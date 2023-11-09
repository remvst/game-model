import World from "../../world";
import { EncoderSequence } from "../encoder";
import { WorldSetup } from "../all-serializers";
import SerializationOptions, { SerializationType } from "../serialization-options";
import { WorldSerializer } from "../serializer";
import { VerboseSerializedWorld } from "../verbose/verbose-world-serializer";

type AnySerializedWorld = VerboseSerializedWorld | EncoderSequence;

export default class DualSupportWorldSerializer implements WorldSerializer<AnySerializedWorld> {
    constructor(
        private readonly verbose: WorldSerializer<VerboseSerializedWorld>,
        private readonly packed: WorldSerializer<EncoderSequence>,
    ) {

    }

    get worldSetup(): WorldSetup {
        return this.verbose.worldSetup;
    }

    set worldSetup(worldSetup: WorldSetup) {
        this.verbose.worldSetup = worldSetup;
        this.packed.worldSetup = worldSetup;
    }

    serialize(world: World, options: SerializationOptions): AnySerializedWorld {
        if (options.type === SerializationType.PACKED) {
            return this.packed.serialize(world, options);
        } else {
            return this.verbose.serialize(world, options);
        }
    }

    deserialize(serialized: AnySerializedWorld, options: SerializationOptions): World {
        if (options.type === SerializationType.PACKED) {
            return this.packed.deserialize(serialized as EncoderSequence, options);
        } else {
            return this.verbose.deserialize(serialized as VerboseSerializedWorld, options);
        }
    }
}
