import Entity from "../../entity";
import Trait from "../../trait";
import { ArrayEncoder, ArrayDecoder } from "../encoder";
import SerializationOptions from "../serialization-options";
import { EntitySerializer, TraitSerializer } from "../serializer";

export default class PackedEntitySerializer implements EntitySerializer<string> {

    private readonly encoder = new ArrayEncoder();
    private readonly decoder = new ArrayDecoder();

    constructor(
        private readonly traitsSerializer: TraitSerializer<Trait, string>
    ) {
        
    }

    serialize(value: Entity, options: SerializationOptions): string {
        this.encoder.reset();

        this.encoder.appendString(value.id);
        this.encoder.appendNumber(value.age);
        this.encoder.appendNumber(value.x);
        this.encoder.appendNumber(value.y);
        this.encoder.appendNumber(value.z);
        this.encoder.appendNumber(value.angle);

        this.encoder.appendNumber(value.traits.size);

        for (const trait of value.traits.items()) {
            const serializedTrait = this.traitsSerializer.serialize(trait, options);
            this.encoder.appendString(serializedTrait);
        }

        return this.encoder.getResult();;
    }

    deserialize(serialized: string, options: SerializationOptions): Entity {
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
            const serializedTrait = this.decoder.nextString();
            const deserialized = this.traitsSerializer.deserialize(serializedTrait, options);
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
