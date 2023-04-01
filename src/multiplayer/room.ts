import ObjectSet from "../collections/object-set";
import WatchableObjectSet from "../collections/watchable-object-set";
import GameModelApp from "../game-model-app";
import World from "../world";
import { Authority } from "./authority";
import Player from "./player";
import { RoomUpdate } from "./room-update";
import WorldUpdatesHelper from "./world-updates-helper";

export default class Room {

    private world: World;

    readonly players = new WatchableObjectSet(new ObjectSet<Player>(player => player.id));

    private updatesHelper: WorldUpdatesHelper;

    constructor(
        private readonly app: GameModelApp,
        private readonly authority: (player: Player) => Authority,
        private readonly sendUpdate: (update: RoomUpdate) => void,
    ) {

    }

    setWorld(world: World, authority: Authority) {
        this.world = world;
        this.updatesHelper?.stop();
        this.updatesHelper = new WorldUpdatesHelper(this.app, world, authority);
    }

    onUpdateReceived(playerId: string, update: RoomUpdate) {
        const player = this.players.getByKey(playerId);
        if (!player) {
            console.warn(`Received update from non-existing player: ${playerId}`);
            return;
        }

        // TODO add more checks

        const authority = this.authority(player);
        this.updatesHelper.applyUpdate(update.world, authority);
    }

    broadcast() {
        if (!this.updatesHelper) {
            throw new Error('Did you forget to call startRound');
        }

        const worldUpdate = this.updatesHelper.generateUpdate();
        for (const player of this.players.items()) {
            this.sendUpdate({
                playerId: player.id,
                world: worldUpdate,
            })
        }
    }
}