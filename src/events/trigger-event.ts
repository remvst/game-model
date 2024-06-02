import { EntityEvent } from "./entity-event";

export class TriggerEvent implements EntityEvent {
    constructor(readonly triggererId: string | null) {}
}
