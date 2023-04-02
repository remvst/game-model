import GameModelApp from "../game-model-app";
import World from "../world";
import { Authority } from "./authority";
import { RoomUpdate } from "./room-update";
import WorldUpdatesCollector from "./world-updates-collector";
import WorldUpdatesReceiver from "./world-updates-receiver";

class Player {
    constructor(
        readonly id: string,
    ) {

    }
}

export default class Room {
    
    private world: World;

    players = new Set<string>();

    private updatesReceiver: WorldUpdatesReceiver;
    private updatesCollector: WorldUpdatesCollector;

    constructor(
        readonly hostId: string,
        readonly selfId: string,
        private readonly app: GameModelApp,
        private readonly authority: (room: Room, playerId: string) => Authority,
        private readonly sendUpdate: (room: Room, playerId: string, update: RoomUpdate) => void,
    ) {

    }

    setWorld(world: World) {
        this.world = world;
        this.updatesCollector?.stop();

        const authority = this.authority(this, this.selfId);
        this.updatesCollector = new WorldUpdatesCollector(this.app, world, authority);
        this.updatesReceiver = new WorldUpdatesReceiver(this.app, world, authority);
    }

    onUpdateReceived(playerId: string, update: RoomUpdate) {
        if (!this.players.has(playerId) && playerId !== this.hostId) {
            console.warn(`Received update from non-existing player: ${playerId}`);
            return;
        }

        if (playerId === this.hostId) {
            this.players = new Set(update.players);
        }

        // TODO add more checks

        this.updatesReceiver.applyUpdate(update.world);
    }

    broadcast() {
        if (!this.updatesCollector) {
            throw new Error('Did you forget to call setWorld?');
        }

        const worldUpdate = this.updatesCollector.generateUpdate();

        const receivers = this.hostId === this.selfId ? this.players : [this.hostId];
        for (const receiverId of receivers) {
            if (receiverId === this.selfId) continue;
            
            this.sendUpdate(this, receiverId, {
                players: Array.from(this.players),
                world: worldUpdate,
            });
        }
    }
}