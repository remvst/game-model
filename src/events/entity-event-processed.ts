import { Entity, EntityEvent, WorldEvent } from "..";

// Event indicating that an entity has processed a local event (in case the event needs to be watched at the world layer).
export default class EntityEventProcessed implements WorldEvent {
    static readonly key = "entity-event";
    readonly key = EntityEventProcessed.key;

    constructor(
        public entity: Entity | null = null,
        public event: EntityEvent | null = null,
    ) {}

    apply() {}
}
