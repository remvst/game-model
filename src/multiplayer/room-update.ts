import { WorldUpdate } from "./world-update";

export interface PlayerJson {
    id: string;
    latency: number;
}

export interface RoomUpdate {
    updateId: number;
    ackId: number;
    players: PlayerJson[];
    world: WorldUpdate<any, any>;
}
