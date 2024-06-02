import { WorldUpdate } from "../multiplayer/world-update";

export class RecordedFrame {
    constructor(
        readonly age: number,
        readonly worldUpdate: WorldUpdate<any, any>,
    ) {}
}
