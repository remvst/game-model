import { KeyProvider } from "../../key-provider";
import SerializationOptions from "../serialization-options";
import { AnySerialized, CompositeSerializer, Serializer } from "../serializer";

interface Serialized {
    key: string;
    data: AnySerialized;
}

export default class VerboseCompositeSerializer<ObjectType extends KeyProvider> implements CompositeSerializer<ObjectType, Serialized> {
    readonly serializers: Map<string, Serializer<ObjectType, AnySerialized>> = new Map();

    add(key: string, serializer: Serializer<ObjectType, AnySerialized>): this {
        this.serializers.set(key, serializer);
        return this;
    }

    serialize(value: ObjectType, options: SerializationOptions): Serialized {
        const serializer = this.serializers.get(value.key);
        if (!serializer) {
            throw new Error(`Cannot serialize item with key ${value.key}`);
        }

        return {
            'key': value.key,
            'data': serializer.serialize(value, options),
        };
    }

    deserialize(value: Serialized, options: SerializationOptions): ObjectType {
        const serializer = this.serializers.get(value.key);
        if (!serializer) {
            throw new Error(`Cannot deserialize item with key ${value.key}`);
        }
        return serializer.deserialize(value.data, options);
    }
}
