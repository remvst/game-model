import { World } from "..";
import Entity from "../entity";
import Trait from "../trait";
import { AnySerialized, EntitySerializer, TraitSerializer, WorldSerializer } from "./serializer";

interface MetaSerializedTrait extends AnySerialized {
    key: string;
    data: AnySerialized;
}

interface SerializedEntity {
    id: string;
    x: number;
    y: number;
    z: number;
    angle: number;
    traits: MetaSerializedTrait[];
}

interface SerializedWorld {
    entities: SerializedEntity[];
}

class JsonTraitsSerializer implements TraitSerializer<Trait, MetaSerializedTrait> {
    readonly serializers: Map<string, TraitSerializer<Trait, any>> = new Map();

    add(key: string, serializer: TraitSerializer<Trait, any>): this {
        this.serializers.set(key, serializer);
        return this;
    }

    serialize(value: Trait): MetaSerializedTrait {
        const serializer = this.serializers.get(value.key);
        if (!serializer) {
            throw new Error(`Cannot serialize trait ${value.key}`);
        }

        return {
            'key': value.key,
            'data': serializer.serialize(value),
        };
    }

    deserialize(value: MetaSerializedTrait): Trait {
        const serializer = this.serializers.get(value.key);
        if (!serializer) {
            throw new Error(`Cannot deserialize trait ${value.key}`);
        }
        return serializer.deserialize(value.data);
    }
}

class JsonEntitySerializer implements EntitySerializer<SerializedEntity> {
    constructor(
        private readonly traitsSerializer: JsonTraitsSerializer
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
        private readonly entitySerializer: JsonEntitySerializer
    ) {

    }

    serialize(value: World): SerializedWorld {
        const entities: SerializedEntity[] = [];
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
    'trait': JsonTraitsSerializer,
    'entity': JsonEntitySerializer,
    'world': JsonWorldSerializer,
};

export function jsonSerializers(): JsonSerializers {
    const trait = new JsonTraitsSerializer()
    const entity = new JsonEntitySerializer(trait);
    const world = new JsonWorldSerializer(entity);

    return { trait, entity, world };
}
