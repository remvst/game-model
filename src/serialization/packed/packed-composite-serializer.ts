import { KeyProvider } from "../../key-provider";
import { ArrayDecoder, ArrayEncoder, EncoderSequence } from "../encoder";
import { SerializationOptions } from "../serialization-options";
import { CompositeSerializer, Serializer } from "../serializer";

export class PackedCompositeSerializer<ObjectType extends KeyProvider>
    implements CompositeSerializer<ObjectType, EncoderSequence>
{
    private readonly encoder = new ArrayEncoder();
    private readonly decoder = new ArrayDecoder();

    readonly serializers: Map<string, Serializer<ObjectType, EncoderSequence>> =
        new Map();

    add(
        key: string,
        serializer: Serializer<ObjectType, EncoderSequence>,
    ): this {
        this.serializers.set(key, serializer);
        return this;
    }

    serialize(
        value: ObjectType,
        options: SerializationOptions,
    ): EncoderSequence {
        const serializer = this.serializers.get(value.key);
        if (!serializer)
            throw new Error(`Cannot serialize item with key ${value.key}`);
        this.encoder.reset();
        this.encoder.appendString(value.key);
        this.encoder.appendSequence(serializer.serialize(value, options));
        return this.encoder.getResult();
    }

    deserialize(
        value: EncoderSequence,
        options: SerializationOptions,
        output: ObjectType,
    ): ObjectType {
        this.decoder.setEncoded(value);

        const key = this.decoder.nextString();

        const serializer = this.serializers.get(key);
        if (!serializer)
            throw new Error(`Cannot deserialize item with key ${key}`);
        return serializer.deserialize(
            this.decoder.nextSequence(),
            options,
            output,
        );
    }

    getKey(value: EncoderSequence, options: SerializationOptions) {
        this.decoder.setEncoded(value);
        return this.decoder.nextString();
    }
}
