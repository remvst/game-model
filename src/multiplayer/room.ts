import GameModelApp from "../game-model-app";
import SerializationOptions, {
    SerializationType,
} from "../serialization/serialization-options";
import World from "../world";
import { Authority } from "./authority";
import { RoomPlayerJson, RoomUpdateJson } from "./room-update";
import WorldUpdatesCollector from "./world-updates-collector";
import WorldUpdatesReceiver from "./world-updates-receiver";

export class Player {
    isMeta = false;
    latency = 0;
    sentUpdateId = 0;
    receivedUpdateId = -1;
    acknowledgedUpdateId = 0;
    latencyProbe: { updateId: number; at: number } = null;
    sentUpdatesWithoutResponse = 0;

    constructor(readonly id: string) {}
}

export default class Room {
    world: World;

    readonly players = new Map<string, Player>();

    private nextUpdateId: number = 0;

    private updatesReceiver: WorldUpdatesReceiver;
    private updatesCollector: WorldUpdatesCollector;

    readonly serializationOptions = new SerializationOptions();

    // Number of updates that we're going to send before wait to get one update from a player
    maxPlayerBacklogSize: number = 5;

    constructor(
        public hostId: string,
        readonly selfId: string,
        private readonly app: GameModelApp,
        private readonly authority: (room: Room, playerId: string) => Authority,
        private readonly sendUpdate: (
            room: Room,
            playerId: string,
            update: RoomUpdateJson,
        ) => void,
    ) {
        this.serializationOptions.type = SerializationType.PACKED;
    }

    pin(entityId: string) {
        this.updatesCollector.pin(entityId);
    }

    resetAllKeyFrames() {
        this.updatesCollector?.resetUpdateSkipping();
    }

    setHostId(hostId: string) {
        if (hostId === this.hostId) {
            return;
        }

        this.hostId = hostId;

        if (this.world) {
            this.setWorld(this.world);
        }
    }

    addPlayer(playerId: string) {
        if (this.players.has(playerId)) return;
        this.players.set(playerId, new Player(playerId));
        this.updatesCollector?.resetUpdateSkipping();
    }

    removePlayer(playerId: string) {
        this.players.delete(playerId);
    }

    setWorld(world: World) {
        this.world = world;
        this.updatesCollector?.stop();

        const authority = this.authority(this, this.selfId);
        this.world.authority = authority;
        this.updatesCollector = new WorldUpdatesCollector(
            this.app,
            world,
            this.serializationOptions,
        );
        this.updatesReceiver = new WorldUpdatesReceiver(
            this.app,
            world,
            this.serializationOptions,
        );
    }

    onUpdateReceived(playerId: string, update: RoomUpdateJson) {
        if (!this.players.has(playerId) && playerId !== this.hostId) {
            console.warn(
                `Received update from non-existing player: ${playerId}`,
            );
            return;
        }

        // If we're receiving an update from the host, update the players list
        if (playerId === this.hostId && update.players) {
            const ids = new Set(update.players.map((p) => p.id));
            for (const playerId of this.players.keys()) {
                if (!ids.has(playerId)) {
                    this.removePlayer(playerId);
                }
            }

            for (const player of update.players) {
                if (!this.players.has(player.id)) {
                    this.addPlayer(player.id);
                }

                this.players.get(player.id).latency = player.latency || 0;
                this.players.get(player.id).isMeta = !!player.isMeta;
            }
        }

        const player = this.players.get(playerId);
        if (player.receivedUpdateId >= update.updateId) {
            // We've received something more recent from this player, ignore
            return;
        }

        player.acknowledgedUpdateId = update.ackId;
        player.receivedUpdateId = update.updateId;
        player.sentUpdatesWithoutResponse = 0;

        const { latencyProbe } = player;
        if (latencyProbe && update.ackId >= latencyProbe.updateId) {
            player.latency = Date.now() - latencyProbe.at;
            player.latencyProbe = null;
        }

        this.updatesReceiver.applyUpdate(
            update.world,
            playerId,
            this.authority(this, playerId),
        );
    }

    playerLatency(player: Player): number {
        const { latencyProbe, latency } = player;
        return Math.max(
            latency,
            latencyProbe ? Date.now() - latencyProbe.at : 0,
            player.acknowledgedUpdateId ? 0 : 9999,
        );
    }

    private playerToJson(player: Player): RoomPlayerJson {
        const jsonPlayer: RoomPlayerJson = { id: player.id };

        const playerLatency = this.playerLatency(player);
        if (playerLatency) {
            jsonPlayer.latency = playerLatency;
        }

        if (player.isMeta) {
            jsonPlayer.isMeta = player.isMeta;
        }

        return jsonPlayer;
    }

    broadcast() {
        if (!this.updatesCollector) {
            throw new Error("Did you forget to call setWorld?");
        }

        const world = this.updatesCollector.generateUpdate();

        const isHost = this.hostId === this.selfId;

        const updateId = this.nextUpdateId++;
        const baseUpdate: RoomUpdateJson = {
            updateId,
            world,
            ackId: 0,
        };

        // Only include the list of players if we're the host
        if (isHost) {
            baseUpdate.players = Array.from(this.players.values()).map((p) =>
                this.playerToJson(p),
            );
        }

        const receivers = isHost
            ? this.players.values()
            : [this.players.get(this.hostId)];
        for (const receiver of receivers) {
            if (!receiver) continue;
            if (receiver.id === this.selfId) continue;

            // If we've been sending too many updates without receiving one, skip this one to
            // avoid building up backpressure on the outgoing side
            const hasPins = (baseUpdate.world?.pins?.length || 0) > 0;
            const hasUnpins = (baseUpdate.world?.unpins?.length || 0) > 0;
            const isBacklogged =
                receiver.sentUpdatesWithoutResponse > this.maxPlayerBacklogSize;
            if (isBacklogged && !hasPins && !hasUnpins) continue;

            this.sendUpdate(this, receiver.id, {
                ...baseUpdate,
                ackId: receiver.receivedUpdateId,
            });

            receiver.sentUpdateId = updateId;
            receiver.sentUpdatesWithoutResponse++;

            if (!receiver.latencyProbe) {
                receiver.latencyProbe = {
                    updateId,
                    at: Date.now(),
                };
            }
        }
    }
}
