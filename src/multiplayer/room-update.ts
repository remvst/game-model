import { WorldUpdate } from "./world-update";

export interface RoomUpdate {
    playerId: string;
    world: WorldUpdate<any, any>;
}