import { EntityProperties } from '../entity';
import { Entity, PropertyType, worldEventGetSet } from "..";
import InterpolatorTrait from "../traits/interpolator-trait";
import World from "../world";
import { WorldEvent } from "./world-event";
import { AutoWorldEventRegistryEntry } from "../registry/world-event-registry";
import { resolveIds } from '../adapt-id';

export default class MoveTo implements WorldEvent {
    static readonly key = 'move-to';
    readonly key = MoveTo.key;

    constructor(
        public entityId: string = '',
        public duration: number = 1,
        public targetEntityId: string = '',
    ) {
    }

    apply(world: World) {
        const targetEntity = world.entity(this.targetEntityId);
        if (!targetEntity) {
            return;
        }

        for (const entity of resolveIds(this.entityId, null, world)) {
            if (this.duration <= 0) {
                entity.position.x = targetEntity.position.x;
                entity.position.y = targetEntity.position.y;
                entity.position.z = targetEntity.position.z;
                continue;
            }

            if (entity.position.x !== targetEntity.position.x) {
                world.entities.add(new Entity(undefined, [
                    new InterpolatorTrait(
                        this.entityId,
                        EntityProperties.x,
                        entity.position.x,
                        targetEntity.position.x,
                        this.duration,
                    ),
                ]));
            }

            if (entity.position.y !== targetEntity.position.y) {
                world.entities.add(new Entity(undefined, [
                    new InterpolatorTrait(
                        this.entityId,
                        EntityProperties.y,
                        entity.position.y,
                        targetEntity.position.y,
                        this.duration,
                    ),
                ]));
            }

            if (entity.position.y !== targetEntity.position.y) {
                world.entities.add(new Entity(undefined, [
                    new InterpolatorTrait(
                        this.entityId,
                        EntityProperties.z,
                        entity.position.z,
                        targetEntity.position.z,
                        this.duration,
                    ),
                ]));
            }
        }
    }

    static registryEntry(): AutoWorldEventRegistryEntry<MoveTo> {
        return {
            eventType: MoveTo,
            category: 'movement',
            properties: [
                worldEventGetSet(MoveTo, 'entityId', PropertyType.id(), event => event.entityId, (event, entityId) => event.entityId = entityId),
                worldEventGetSet(MoveTo, 'targetEntityId', PropertyType.id(), event => event.targetEntityId, (event, targetEntityId) => event.targetEntityId = targetEntityId),
                worldEventGetSet(MoveTo, 'duration', PropertyType.num(0, 200, 0.1), event => event.duration, (event, duration) => event.duration = duration),
            ],
        }
    }
}
