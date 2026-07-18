import { Weapon } from "../../weapon/weapon";
import { EncoderSequence } from "../encoder";
import {
    SerializationOptions,
    SerializationType,
} from "../serialization-options";
import { AnySerialized, Serializer } from "../serializer";

export class DualSupportWeaponSerializer<T extends Weapon>
    implements Serializer<T, AnySerialized | EncoderSequence>
{
    constructor(
        readonly verbose: Serializer<T, any>,
        readonly packed: Serializer<T, EncoderSequence>,
    ) {}

    serialize(
        weapon: T,
        options: SerializationOptions,
    ): AnySerialized | EncoderSequence {
        if (options.type === SerializationType.PACKED) {
            return this.packed.serialize(weapon, options);
        } else {
            return this.verbose.serialize(weapon, options);
        }
    }

    deserialize(
        serialized: AnySerialized | EncoderSequence,
        options: SerializationOptions,
    ): T {
        if (options.type === SerializationType.PACKED) {
            return this.packed.deserialize(
                serialized as EncoderSequence,
                options,
            );
        } else {
            return this.verbose.deserialize(serialized, options);
        }
    }
}
