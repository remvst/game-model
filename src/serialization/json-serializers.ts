import { KeyProvider } from './../key-provider';
import Entity from "../entity";
import Trait from "../trait";
import World from "../world";
import CompositeSerializer from "./composite-serializer";
import { AnySerialized, EntitySerializer, TraitSerializer, WorldSerializer } from "./serializer";
import { WorldEvent } from '../events/world-event';

interface SerializedEntity {
    id: string;
    x: number;
    y: number;
    z: number;
    angle: number;
    traits: AnySerialized[];
}

interface SerializedWorld {
    entities: AnySerialized[];
}

class JsonEntitySerializer implements EntitySerializer<SerializedEntity> {
    constructor(
        private readonly traitsSerializer: TraitSerializer<Trait, AnySerialized>
    ) {
        
    }

    serialize(value: Entity): SerializedEntity {
        const serializedTraits = value.traits
            .map(trait => this.traitsSerializer.serialize(trait));

        return {
            'id': value.id,
            'x': value.x,
            'y': value.y,
            'z': value.z,
            'angle': value.angle,
            'traits': serializedTraits,
        };
    }

    deserialize(serialized: SerializedEntity): Entity {
        const entity = new Entity(serialized.id, serialized.traits.map((serializedTrait) => {
            return this.traitsSerializer.deserialize(serializedTrait);
        }));
        entity.x = serialized.x;
        entity.y = serialized.y;
        entity.z = serialized.z;
        entity.angle = serialized.angle;
        return entity;
    }
}

class JsonWorldSerializer implements WorldSerializer<SerializedWorld> {
    constructor(
        private readonly entitySerializer: EntitySerializer<AnySerialized>
    ) {

    }

    serialize(value: World): SerializedWorld {
        const entities: AnySerialized[] = [];
        value.entities.forEach((entity) => {
            try {
                const serialized = this.entitySerializer.serialize(entity);
                entities.push(serialized);
            } catch (e) {
                // entity is not serializable, skip
            }
        });

        return { entities };
    }

    deserialize(serialized: SerializedWorld): World {
        const world = new World();
        serialized.entities.forEach(serializedEntity => {
            try {
                const entity = this.entitySerializer.deserialize(serializedEntity);
                world.entities.add(entity);
            } catch (e) {
                console.error('Failed to deserialize', serializedEntity, e);
            }
        });
        return world;
    }

}

export type JsonSerializers = {
    'trait': CompositeSerializer<Trait>,
    'entity': JsonEntitySerializer,
    'world': JsonWorldSerializer,
    'worldEvent': CompositeSerializer<WorldEvent & KeyProvider>,
};

export function jsonSerializers(): JsonSerializers {
    const trait = new CompositeSerializer<Trait>()
    const entity = new JsonEntitySerializer(trait);
    const world = new JsonWorldSerializer(entity);
    const worldEvent = new CompositeSerializer<WorldEvent & KeyProvider>();

    return { trait, entity, world, worldEvent };
}
