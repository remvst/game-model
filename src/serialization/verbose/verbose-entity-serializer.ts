import { Entity } from "../../entity";
import { Trait } from "../../trait";
import { SerializationOptions } from "../serialization-options";
import { EntitySerializer } from "../serializer";
import { VerboseCompositeSerializer } from "./verbose-composite-serializer";

export interface VerboseSerializedEntity {
    id: string;
    age: number;
    x: number;
    y: number;
    z: number;
    angle: number;
    traits: VerboseSerializedEntityTraitItem[];
}

interface VerboseSerializedEntityTraitItem {
    data: any;
    enabled: boolean;
}

export class VerboseEntitySerializer<VerboseSerializedTrait>
    implements EntitySerializer<VerboseSerializedEntity>
{
    constructor(
        private readonly traitsSerializer: VerboseCompositeSerializer<
            Trait,
            VerboseSerializedTrait
        >,
    ) {}

    getId(value: VerboseSerializedEntity): string {
        return value.id;
    }

    serialize(
        value: Entity,
        options: SerializationOptions,
    ): VerboseSerializedEntity {
        const serializedTraits = value.traits.map((trait) => {
            return {
                data: this.traitsSerializer.serialize(trait, options),
                enabled: trait.enabled,
            };
        });

        return {
            id: value.id,
            traits: serializedTraits,
            x: value.x,
            y: value.y,
            z: value.z,
            angle: value.angle,
            age: options.includeEntityAges ? value.age : 0,
        };
    }

    deserialize(
        serialized: VerboseSerializedEntity,
        options: SerializationOptions,
    ): Entity {
        const entity = new Entity(
            serialized.id,
            serialized.traits.map((serializedTrait) => {
                // If the trait is serialized using the old serialization format, convert it
                const isOldFormat = serializedTrait.hasOwnProperty("key");
                if (isOldFormat) {
                    serializedTrait = { data: serializedTrait } as any;
                }

                const deserialized = this.traitsSerializer.deserialize(
                    serializedTrait.data,
                    options,
                );

                // Apply general properties
                deserialized.enabled =
                    serializedTrait.enabled === undefined
                        ? true
                        : !!serializedTrait.enabled;

                return deserialized;
            }),
        );
        entity.age = serialized.age || 0;
        entity.x = serialized.x || 0;
        entity.y = serialized.y || 0;
        entity.z = serialized.z || 0;
        entity.angle = serialized.angle || 0;
        return entity;
    }
}
