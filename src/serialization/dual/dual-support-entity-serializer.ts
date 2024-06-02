import { Entity } from "../../entity";
import { EncoderSequence } from "../encoder";
import {
    SerializationOptions,
    SerializationType,
} from "../serialization-options";
import { AnySerialized, EntitySerializer } from "../serializer";
import { VerboseSerializedEntity } from "../verbose/verbose-entity-serializer";

export type AnySerializedEntity = VerboseSerializedEntity | EncoderSequence;

export class DualSupportEntitySerializer
    implements EntitySerializer<AnySerializedEntity>
{
    constructor(
        readonly verbose: EntitySerializer<AnySerialized>,
        readonly packed: EntitySerializer<EncoderSequence>,
    ) {}

    serialize(
        entity: Entity,
        options: SerializationOptions,
    ): AnySerializedEntity {
        if (options.type === SerializationType.PACKED) {
            return this.packed.serialize(entity, options);
        } else {
            return this.verbose.serialize(
                entity,
                options,
            ) as VerboseSerializedEntity;
        }
    }

    deserialize(
        serialized: AnySerializedEntity,
        options: SerializationOptions,
    ): Entity {
        if (options.type === SerializationType.PACKED) {
            return this.packed.deserialize(
                serialized as EncoderSequence,
                options,
            );
        } else {
            return this.verbose.deserialize(serialized, options);
        }
    }

    getId(
        serialized: AnySerializedEntity,
        options: SerializationOptions,
    ): string {
        if (options.type === SerializationType.PACKED) {
            return this.packed.getId(serialized as EncoderSequence, options);
        } else {
            return this.verbose.getId(serialized, options);
        }
    }
}
