import { EntityEvent } from "./entity-event";

export default class TriggerEvent implements EntityEvent {
    constructor(readonly triggererId: string | null) {}
}
