import { KeyProvider } from "../../key-provider";
import { EncoderSequence } from "../encoder";
import { PackedCompositeSerializer } from "../packed/packed-composite-serializer";
import {
    SerializationOptions,
    SerializationType,
} from "../serialization-options";
import { AnySerialized, CompositeSerializer, Serializer } from "../serializer";
import {
    VerboseCompositeSerialized,
    VerboseCompositeSerializer,
} from "../verbose/verbose-composite-serializer";

type AnySerializedItem = AnySerialized | EncoderSequence;

export class DualSupportCompositeSerializer<ObjectType extends KeyProvider>
    implements CompositeSerializer<ObjectType, AnySerializedItem>
{
    readonly serializers: Map<string, Serializer<ObjectType, AnySerialized>> =
        new Map();

    constructor(
        private readonly verbose: VerboseCompositeSerializer<
            ObjectType,
            AnySerialized
        >,
        private readonly packed: PackedCompositeSerializer<ObjectType>,
    ) {}

    add(key: string, serializer: Serializer<ObjectType, any>): this {
        this.verbose.add(key, serializer);
        this.packed.add(key, serializer);
        return this;
    }

    serialize(
        value: ObjectType,
        options: SerializationOptions,
    ): AnySerializedItem {
        if (options.type === SerializationType.PACKED) {
            return this.packed.serialize(value, options);
        } else {
            return this.verbose.serialize(value, options);
        }
    }

    deserialize(
        value: AnySerializedItem,
        options: SerializationOptions,
        output?: ObjectType,
    ): ObjectType {
        if (options.type === SerializationType.PACKED) {
            return this.packed.deserialize(
                value as EncoderSequence,
                options,
                output,
            );
        } else {
            return this.verbose.deserialize(
                value as VerboseCompositeSerialized<AnySerialized>,
                options,
                output,
            );
        }
    }

    getKey(value: AnySerializedItem, options: SerializationOptions): string {
        if (options.type === SerializationType.PACKED) {
            return this.packed.getKey(value as EncoderSequence, options);
        } else {
            return this.verbose.getKey(
                value as VerboseCompositeSerialized<AnySerialized>,
                options,
            );
        }
    }
}
