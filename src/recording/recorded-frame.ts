import { WorldUpdate } from "../multiplayer/world-update";

export default class RecordedFrame {
    constructor(
        readonly age: number,
        readonly worldUpdate: WorldUpdate<any, any>,
    ) {}
}
