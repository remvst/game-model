import { KeyProvider } from "../../key-provider";
import PackedCompositeSerializer from "../packed/packed-composite-serializer";
import SerializationOptions, { SerializationType } from "../serialization-options";
import { AnySerialized, CompositeSerializer, Serializer } from "../serializer";
import VerboseCompositeSerializer from "../verbose/verbose-composite-serializer";

type Serialized = any;

export default class DualSupportCompositeSerializer<ObjectType extends KeyProvider> implements CompositeSerializer<ObjectType, Serialized> {
    readonly serializers: Map<string, Serializer<ObjectType, AnySerialized>> = new Map();

    constructor(
        private readonly verbose: VerboseCompositeSerializer<ObjectType>,
        private readonly packed: PackedCompositeSerializer<ObjectType>,
    ) {
        
    }

    add(key: string, serializer: Serializer<ObjectType, any>): this {
        this.verbose.add(key, serializer);
        this.packed.add(key, serializer);
        return this;
    }


    serialize(value: ObjectType, options: SerializationOptions): Serialized {
        if (options.type === SerializationType.PACKED) {
            return this.packed.serialize(value, options);
        } else {
            return this.verbose.serialize(value, options);
        }
    }

    deserialize(value: Serialized, options: SerializationOptions): ObjectType {
        if (options.type === SerializationType.PACKED) {
            return this.packed.deserialize(value, options);
        } else {
            return this.verbose.deserialize(value, options);
        }
    }
}
