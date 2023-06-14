import Trait from "../../trait";
import SerializationOptions, { SerializationType } from "../serialization-options";
import { TraitSerializer } from "../serializer";

export default class DualSupportTraitSerializer<T extends Trait> implements TraitSerializer<T, any> {

    constructor(
        private readonly verbose: TraitSerializer<T, any>,
        private readonly packed: TraitSerializer<T, string>,
    ) {

    }

    serialize(trait: T, options: SerializationOptions): any {
        if (options.type === SerializationType.PACKED) {
            return this.packed.serialize(trait, options);
        } else {
            return this.verbose.serialize(trait, options);
        }
    }

    deserialize(serialized: any, options: SerializationOptions): T {
        if (options.type === SerializationType.PACKED) {
            return this.packed.deserialize(serialized as string, options);
        } else {
            return this.verbose.deserialize(serialized, options);
        }
    }
}
