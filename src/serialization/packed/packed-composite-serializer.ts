import { KeyProvider } from "../../key-provider";
import { ArrayEncoder, ArrayDecoder } from "../encoder";
import SerializationOptions from "../serialization-options";
import { CompositeSerializer, Serializer } from "../serializer";

export default class PackedCompositeSerializer<ObjectType extends KeyProvider> implements CompositeSerializer<ObjectType, string> {

    private readonly encoder = new ArrayEncoder();
    private readonly decoder = new ArrayDecoder();

    readonly serializers: Map<string, Serializer<ObjectType, string>> = new Map();

    add(key: string, serializer: Serializer<ObjectType, string>): this {
        this.serializers.set(key, serializer);
        return this;
    }

    serialize(value: ObjectType, options: SerializationOptions): string {
        const serializer = this.serializers.get(value.key);
        if (!serializer) {
            throw new Error(`Cannot serialize item with key ${value.key}`);
        }

        this.encoder.reset();
        this.encoder.appendString(value.key);
        this.encoder.appendString(serializer.serialize(value, options));

        return this.encoder.getResult();
    }

    deserialize(value: string, options: SerializationOptions): ObjectType {
        this.decoder.setEncoded(value);

        const key = this.decoder.nextString();

        const serializer = this.serializers.get(key);
        if (!serializer) {
            throw new Error(`Cannot deserialize item with key ${key}`);
        }

        return serializer.deserialize(this.decoder.nextString(), options);
    }
}
