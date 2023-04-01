import { WorldUpdate } from "./world-update";

export interface RoomUpdate {
    players: string[];
    world: WorldUpdate<any, any>;
}