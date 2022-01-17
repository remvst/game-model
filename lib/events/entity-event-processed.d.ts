import { Entity, EntityEvent, WorldEvent } from "..";
export default class EntityEventProcessed implements WorldEvent {
    entity: Entity;
    event: EntityEvent | null;
    constructor(entity: Entity);
    apply(): void;
}
