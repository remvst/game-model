import GameModelApp from "../game-model-app";
import SerializationOptions, {
    SerializationType,
} from "../serialization/serialization-options";
import World from "../world";
import { Authority } from "./authority";
import { RoomUpdate } from "./room-update";
import WorldUpdatesCollector from "./world-updates-collector";
import WorldUpdatesReceiver from "./world-updates-receiver";

export class Player {
    isMeta = false;
    latency = 0;
    sentUpdateId = 0;
    receivedUpdateId = -1;
    acknowledgedUpdateId = 0;
    latencyProbe: { updateId: number; at: number } = null;

    constructor(readonly id: string) {}
}

export default class Room {
    world: World;

    readonly players = new Map<string, Player>();

    private nextUpdateId: number = 0;

    private updatesReceiver: WorldUpdatesReceiver;
    private updatesCollector: WorldUpdatesCollector;

    readonly serializationOptions = new SerializationOptions();

    constructor(
        public hostId: string,
        readonly selfId: string,
        private readonly app: GameModelApp,
        private readonly authority: (room: Room, playerId: string) => Authority,
        private readonly sendUpdate: (
            room: Room,
            playerId: string,
            update: RoomUpdate,
        ) => void,
    ) {
        this.serializationOptions.type = SerializationType.PACKED;
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

    onUpdateReceived(playerId: string, update: RoomUpdate) {
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

                this.players.get(player.id).latency = player.latency;
                this.players.get(player.id).isMeta = player.isMeta;
            }
        }

        const player = this.players.get(playerId);
        if (player.receivedUpdateId >= update.updateId) {
            // We've received something more recent from this player, ignore
            return;
        }

        player.acknowledgedUpdateId = update.ackId;
        player.receivedUpdateId = update.updateId;

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

    broadcast() {
        if (!this.updatesCollector) {
            throw new Error("Did you forget to call setWorld?");
        }

        const world = this.updatesCollector.generateUpdate();

        const isHost = this.hostId === this.selfId;

        const updateId = this.nextUpdateId++;
        const baseUpdate: RoomUpdate = {
            updateId,
            world,
            ackId: 0,
        };

        // Only include the list of players if we're the host
        if (isHost) {
            baseUpdate.players = Array.from(this.players.values()).map((p) => ({
                id: p.id,
                latency: p.latency,
                isMeta: p.isMeta,
            }));
        }

        const receivers = isHost
            ? this.players.values()
            : [this.players.get(this.hostId)];
        for (const receiver of receivers) {
            if (!receiver) continue;
            if (receiver.id === this.selfId) continue;

            this.sendUpdate(this, receiver.id, {
                ...baseUpdate,
                ackId: receiver.receivedUpdateId,
            });

            receiver.sentUpdateId = updateId;

            if (!receiver.latencyProbe) {
                receiver.latencyProbe = {
                    updateId,
                    at: Date.now(),
                };
            }
        }
    }
}
