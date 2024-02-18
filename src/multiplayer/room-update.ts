import { WorldUpdate } from "./world-update";

export interface PlayerJson {
    id: string;
    latency?: number;
    isMeta?: boolean;
}

export interface RoomUpdate {
    updateId: number;
    ackId: number;
    players?: PlayerJson[];
    world: WorldUpdate<any, any>;
}
