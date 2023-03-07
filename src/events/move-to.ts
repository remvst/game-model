import { EntityProperties } from '../entity';
import { Entity, PropertyType, worldEventGetSet } from "..";
import { WorldEventSerializer } from "../serialization/serializer";
import InterpolatorTrait from "../traits/interpolator-trait";
import { vector3 } from "../vector3";
import World from "../world";
import { WorldEvent } from "./world-event";
import { WorldEventRegistryEntry } from "../registry/world-event-registry";

export default class MoveTo implements WorldEvent {
    static readonly key = 'move-to';
    readonly key = MoveTo.key;

    constructor(
        public entityId: string,
        public duration: number,
        public targetEntityId: string,
    ) {
    }

    apply(world: World) {
        const entity = world.entity(this.entityId);
        if (!entity) {
            return;
        }

        const targetPosition = vector3();
        if (this.targetEntityId) {
            const targetEntity = world.entity(this.targetEntityId);
            if (targetEntity) {
                targetPosition.x = targetEntity.position.x;
                targetPosition.y = targetEntity.position.y;
                targetPosition.y = targetEntity.position.y;
            }
        }

        world.entities.add(new Entity(undefined, [
            new InterpolatorTrait(
                this.entityId,
                EntityProperties.x,
                entity.position.x,
                targetPosition.x,
                this.duration,
            ),
        ]));

        world.entities.add(new Entity(undefined, [
            new InterpolatorTrait(
                this.entityId,
                EntityProperties.y,
                entity.position.y,
                targetPosition.y,
                this.duration,
            ),
        ]));

        world.entities.add(new Entity(undefined, [
            new InterpolatorTrait(
                this.entityId,
                EntityProperties.z,
                entity.position.z,
                targetPosition.z,
                this.duration,
            ),
        ]));
    }

    static registryEntry(): WorldEventRegistryEntry<MoveTo> {
        return {
            key: MoveTo.key,
            category: 'movement',
            newEvent: () => new MoveTo('', 1, ''),
            serializer: () => new MoveSerializer(),
            properties: [
                worldEventGetSet(MoveTo, 'entityId', PropertyType.id(), event => event.entityId, (event, entityId) => event.entityId = entityId),
                worldEventGetSet(MoveTo, 'targetEntityId', PropertyType.id(), event => event.targetEntityId, (event, targetEntityId) => event.targetEntityId = targetEntityId),
                worldEventGetSet(MoveTo, 'duration', PropertyType.num(0, 200, 0.1), event => event.duration, (event, duration) => event.duration = duration),
            ],
        }
    }
}

interface Serialized {
    readonly entityId: string;
    readonly duration: number;
    readonly targetEntityId: string;
}

export class MoveSerializer implements WorldEventSerializer<MoveTo, Serialized> {
    serialize(event: MoveTo): Serialized {
        return {
            'entityId': event.entityId,
            'duration': event.duration,
            'targetEntityId': event.targetEntityId,
        };
    }

    deserialize(serialized: Serialized): MoveTo {
        return new MoveTo(
            serialized.entityId, 
            serialized.duration, 
            serialized.targetEntityId,
        );
    }
}
