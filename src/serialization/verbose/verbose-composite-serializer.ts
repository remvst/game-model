import { KeyProvider } from "../../key-provider";
import { SerializationOptions } from "../serialization-options";
import { AnySerialized, CompositeSerializer, Serializer } from "../serializer";

export interface VerboseCompositeSerialized<SerializedItem> {
    key: string;
    data: SerializedItem;
}

export class VerboseCompositeSerializer<
    ObjectType extends KeyProvider,
    SerializedItem extends AnySerialized,
> implements
        CompositeSerializer<
            ObjectType,
            VerboseCompositeSerialized<SerializedItem>
        >
{
    readonly serializers: Map<string, Serializer<ObjectType, AnySerialized>> =
        new Map();

    add(key: string, serializer: Serializer<ObjectType, AnySerialized>): this {
        this.serializers.set(key, serializer);
        return this;
    }

    serialize(
        value: ObjectType,
        options: SerializationOptions,
    ): VerboseCompositeSerialized<SerializedItem> {
        const serializer = this.serializers.get(value.key) as Serializer<
            ObjectType,
            SerializedItem
        >;
        if (!serializer)
            throw new Error(`Cannot serialize item with key ${value.key}`);

        return {
            key: value.key,
            data: serializer.serialize(value, options),
        };
    }

    deserialize(
        value: VerboseCompositeSerialized<SerializedItem>,
        options: SerializationOptions,
        output?: ObjectType,
    ): ObjectType {
        const serializer = this.serializers.get(value.key);
        if (!serializer) {
            throw new Error(`Cannot deserialize item with key ${value.key}`);
        }
        return serializer.deserialize(value.data, options, output);
    }

    getKey(
        value: VerboseCompositeSerialized<SerializedItem>,
        options: SerializationOptions,
    ): string {
        return value.key;
    }
}
