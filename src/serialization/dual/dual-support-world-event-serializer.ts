import { WorldEvent } from "../../events/world-event";
import { EncoderSequence } from "../encoder";
import SerializationOptions, { SerializationType } from "../serialization-options";
import { AnySerialized, WorldEventSerializer } from "../serializer";

type AnySerializedWorldEvent = AnySerialized | EncoderSequence;

export default class DualSupportWorldEventSerializer<T extends WorldEvent> implements WorldEventSerializer<T, AnySerializedWorldEvent> {

    constructor(
        readonly verbose: WorldEventSerializer<T, any>,
        readonly packed: WorldEventSerializer<T, EncoderSequence>,
    ) {

    }

    serialize(WorldEvent: T, options: SerializationOptions): AnySerializedWorldEvent {
        if (options.type === SerializationType.PACKED) {
            return this.packed.serialize(WorldEvent, options);
        } else {
            return this.verbose.serialize(WorldEvent, options);
        }
    }

    deserialize(serialized: AnySerializedWorldEvent, options: SerializationOptions): T {
        if (options.type === SerializationType.PACKED) {
            return this.packed.deserialize(serialized as EncoderSequence, options);
        } else {
            return this.verbose.deserialize(serialized, options);
        }
    }
}
