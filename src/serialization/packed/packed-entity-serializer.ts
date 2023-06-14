import Entity from "../../entity";
import Trait from "../../trait";
import { ArrayEncoder, ArrayDecoder, EncoderSequence } from "../encoder";
import SerializationOptions from "../serialization-options";
import { EntitySerializer, TraitSerializer } from "../serializer";

export default class PackedEntitySerializer implements EntitySerializer<EncoderSequence> {

    private readonly encoder = new ArrayEncoder();
    private readonly decoder = new ArrayDecoder();

    constructor(
        private readonly traitsSerializer: TraitSerializer<Trait, EncoderSequence>
    ) {
        
    }

    serialize(value: Entity, options: SerializationOptions): EncoderSequence {
        this.encoder.reset();

        this.encoder.appendString(value.id);
        this.encoder.appendNumber(options.includeEntityAges ? value.age : 0);
        this.encoder.appendNumber(value.x);
        this.encoder.appendNumber(value.y);
        this.encoder.appendNumber(value.z);
        this.encoder.appendNumber(value.angle);

        this.encoder.appendNumber(value.traits.size);

        for (const trait of value.traits.items()) {
            this.encoder.appendBool(trait.enabled);

            const serializedTrait = this.traitsSerializer.serialize(trait, options);
            this.encoder.appendSequence(serializedTrait);
        }

        return this.encoder.getResult();
    }

    deserialize(serialized: EncoderSequence, options: SerializationOptions): Entity {
        this.decoder.setEncoded(serialized);

        const id = this.decoder.nextString();
        const age = this.decoder.nextNumber();
        const x = this.decoder.nextNumber();
        const y = this.decoder.nextNumber();
        const z = this.decoder.nextNumber();
        const angle = this.decoder.nextNumber();

        const traitCount = this.decoder.nextNumber();
        const traits: Trait[] = [];

        for (let i = 0 ; i < traitCount ; i++) {
            const enabled = this.decoder.nextBool();
            const serializedTrait = this.decoder.nextSequence();
            const deserialized = this.traitsSerializer.deserialize(serializedTrait, options);
            deserialized.enabled = enabled;
            traits.push(deserialized);
        }

        const entity = new Entity(id, traits);
        entity.age = age;
        entity.x = x;
        entity.y = y;
        entity.z = z;
        entity.angle = angle;
        return entity;
    }
}
