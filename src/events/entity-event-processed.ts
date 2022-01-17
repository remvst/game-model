import { Entity, EntityEvent, WorldEvent } from "..";

// Event indicating that an entity has processed a local event (in case the event needs to be watched at the world layer).
export default class EntityEventProcessed implements WorldEvent {

    entity: Entity;
    event: EntityEvent | null = null;

    constructor(entity: Entity) {
        this.entity = entity;
    }

    apply() {}
}
