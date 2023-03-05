import { EntityEvent } from "./entity-event";

export default class EntitySelectionRequested implements EntityEvent {
    constructor(readonly resolve: (value: string) => void) {

    }
}
