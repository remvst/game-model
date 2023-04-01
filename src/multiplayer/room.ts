import GameModelApp from "../game-model-app";
import World from "../world";
import { Authority } from "./authority";
import { RoomUpdate } from "./room-update";
import WorldUpdatesHelper from "./world-updates-helper";

export default class Room {
    
    private world: World;

    players = new Set<string>();

    private updatesHelper: WorldUpdatesHelper;

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
        this.updatesHelper?.stop();
        this.updatesHelper = new WorldUpdatesHelper(this.app, world, this.authority(this, this.selfId));
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

        const authority = this.authority(this, playerId);
        this.updatesHelper.applyUpdate(update.world, authority);
    }

    broadcast() {
        if (!this.updatesHelper) {
            throw new Error('Did you forget to call setWorld?');
        }

        const worldUpdate = this.updatesHelper.generateUpdate();

        const receivers = this.hostId === this.selfId ? this.players : this.hostId;
        for (const receiverId of receivers) {
            this.sendUpdate(this, receiverId, {
                players: Array.from(this.players),
                world: worldUpdate,
            });
        }
    }
}