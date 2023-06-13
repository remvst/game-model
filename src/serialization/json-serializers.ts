import { KeyProvider } from './../key-provider';
import Entity from "../entity";
import Trait from "../trait";
import World from "../world";
import CompositeSerializer from "./composite-serializer";
import { AnySerialized, EntitySerializer, Serializers, TraitSerializer, WorldSerializer } from "./serializer";
import { WorldEvent } from '../events/world-event';
import SerializationOptions from './serialization-options';

export interface SerializedTrait {
    enabled?: 1 | 0; // undefined = true
    data: AnySerialized;
}

export interface JsonSerializedEntity {
    id?: string;
    age?: number;
    x?: number;
    y?: number;
    z?: number;
    angle?: number;
    traits: SerializedTrait[];
}

export interface JsonSerializedWorld {
    entities: AnySerialized[];
}

class JsonEntitySerializer implements EntitySerializer<JsonSerializedEntity> {
    constructor(
        private readonly traitsSerializer: TraitSerializer<Trait, AnySerialized>
    ) {
        
    }

    serialize(value: Entity, options: SerializationOptions): JsonSerializedEntity {
        const serializedTraits = value.traits
            .map(trait => {       
                const serialized: SerializedTrait = {
                    'data': this.traitsSerializer.serialize(trait, options),
                };
                if (!trait.enabled) {
                    serialized.enabled = 0;
                }
                return serialized;
            });

        const serialized: JsonSerializedEntity = {
            'id': value.id,
            'traits': serializedTraits,
        };

        if (value.x) serialized.x = value.x;
        if (value.y) serialized.y = value.y;
        if (value.z) serialized.z = value.z;
        if (value.angle) serialized.angle = value.angle;
        if (value.age) serialized.age = value.age;

        return serialized;
    }

    deserialize(serialized: JsonSerializedEntity): Entity {
        const entity = new Entity(serialized.id, serialized.traits.map((serializedTrait: SerializedTrait) => {
            // If the trait is serialized using the old serialization format, convert it
            const isOldFormat = serializedTrait.hasOwnProperty('key');
            if (isOldFormat) {
                serializedTrait = {'data': serializedTrait};
            }

            const deserialized = this.traitsSerializer.deserialize(serializedTrait.data);

            // Apply general properties
            deserialized.enabled = serializedTrait.enabled === undefined ? true : !!serializedTrait.enabled;

            return deserialized;
        }));
        entity.age = serialized.age || 0;
        entity.x = serialized.x || 0;
        entity.y = serialized.y || 0;
        entity.z = serialized.z || 0;
        entity.angle = serialized.angle || 0;
        return entity;
    }
}

class JsonWorldSerializer implements WorldSerializer<JsonSerializedWorld> {
    constructor(
        private readonly entitySerializer: EntitySerializer<AnySerialized>,
        public worldSetup: WorldSetup,
    ) {

    }

    filterAndSerialize(world: World, entityFilter: (entity: Entity) => boolean, options: SerializationOptions): JsonSerializedWorld {
        const entities: AnySerialized[] = [];
        world.entities.forEach((entity) => {
            if (!entityFilter(entity)) {
                return;
            }

            try {
                const serialized = this.entitySerializer.serialize(entity, options);
                entities.push(serialized);
            } catch (e) {
                // entity is not serializable, skip
            }
        });

        return { entities };
    }

    serialize(value: World, options: SerializationOptions): JsonSerializedWorld {
        return this.filterAndSerialize(value, () => true, options);
    }

    doSerialize() {
        
    }

    deserialize(serialized: JsonSerializedWorld): World {
        const world = new World();
        this.worldSetup(world);

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

export interface JsonSerializers extends Serializers {
    trait: CompositeSerializer<Trait>;
    entity: JsonEntitySerializer;
    world: JsonWorldSerializer;
    worldEvent: CompositeSerializer<WorldEvent & KeyProvider>;
};

export type WorldSetup = (world: World) => void;

export function jsonSerializers(opts?: {
    worldSetup?: WorldSetup,
}): JsonSerializers {
    const trait = new CompositeSerializer<Trait>()
    const entity = new JsonEntitySerializer(trait);
    const world = new JsonWorldSerializer(entity, opts?.worldSetup || (() => {}));
    const worldEvent = new CompositeSerializer<WorldEvent & KeyProvider>();

    return { trait, entity, world, worldEvent };
}
