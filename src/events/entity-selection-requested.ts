import { EntityFilter } from './../configurable/entity-filter';
import { EntityEvent } from "./entity-event";

export default class EntitySelectionRequested implements EntityEvent {
    constructor(
        readonly filter: EntityFilter,
        readonly resolve: (value: string) => void,
    ) {

    }
}
