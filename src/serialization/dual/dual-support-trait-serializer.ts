import Trait from "../../trait";
import { EncoderSequence } from "../encoder";
import SerializationOptions, { SerializationType } from "../serialization-options";
import { AnySerialized, TraitSerializer } from "../serializer";

type AnySerializedTrait = AnySerialized | EncoderSequence;

export default class DualSupportTraitSerializer<T extends Trait> implements TraitSerializer<T, AnySerializedTrait> {

    constructor(
        readonly verbose: TraitSerializer<T, any>,
        readonly packed: TraitSerializer<T, EncoderSequence>,
    ) {

    }

    serialize(trait: T, options: SerializationOptions): AnySerializedTrait {
        if (options.type === SerializationType.PACKED) {
            return this.packed.serialize(trait, options);
        } else {
            return this.verbose.serialize(trait, options);
        }
    }

    deserialize(serialized: AnySerializedTrait, options: SerializationOptions): T {
        if (options.type === SerializationType.PACKED) {
            return this.packed.deserialize(serialized as EncoderSequence, options);
        } else {
            return this.verbose.deserialize(serialized, options);
        }
    }
}
