import Entity from "../../entity";
import Trait from "../../trait";
import SerializationOptions from "../serialization-options";
import { EntitySerializer, TraitSerializer, AnySerialized } from "../serializer";

interface Serialized {
    id?: string;
    age?: number;
    x?: number;
    y?: number;
    z?: number;
    angle?: number;
    traits: any[];
}

export default class VerboseEntitySerializer implements EntitySerializer<Serialized> {
    constructor(
        private readonly traitsSerializer: TraitSerializer<Trait, AnySerialized>
    ) {
        
    }

    serialize(value: Entity, options: SerializationOptions): Serialized {
        const serializedTraits = value.traits
            .map(trait => {       
                return {
                    'data': this.traitsSerializer.serialize(trait, options),
                    'enabled': trait.enabled,
                };
            });

        const serialized: Serialized = {
            'id': value.id,
            'traits': serializedTraits,
        };

        serialized.x = value.x;
        serialized.y = value.y;
        serialized.z = value.z;
        serialized.angle = value.angle;
        serialized.age = options.includeEntityAges ? value.age : 0;

        return serialized;
    }

    deserialize(serialized: Serialized, options: SerializationOptions): Entity {
        const entity = new Entity(serialized.id, serialized.traits.map((serializedTrait) => {
            // If the trait is serialized using the old serialization format, convert it
            const isOldFormat = serializedTrait.hasOwnProperty('key');
            if (isOldFormat) {
                serializedTrait = {'data': serializedTrait};
            }

            const deserialized = this.traitsSerializer.deserialize(serializedTrait.data, options);

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
