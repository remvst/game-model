import { Entity } from "../../entity";
import {
    BooleanConstraints,
    ColorConstraints,
    CompositeConstraints,
    EntityIdConstraints,
    EnumConstraints,
    JsonConstraints,
    ListConstraints,
    NumberConstraints,
    PropertyConstraints,
    StringConstraints,
} from "../../properties/property-constraints";
import { RegistryEntry } from "../../registry/trait-registry";
import { Trait } from "../../trait";
import { ArrayDecoder, ArrayEncoder, EncoderSequence } from "../encoder";
import { RebindableEntity } from "../rebindable-entity";
import { SerializationOptions } from "../serialization-options";
import { TraitSerializer } from "../serializer";

const REBINDABLE_ENTITY = new RebindableEntity();

export class PackedAutomaticTraitSerializer<T extends Trait>
    implements TraitSerializer<T, EncoderSequence>
{
    private readonly encoder = new ArrayEncoder();
    private readonly decoder = new ArrayDecoder();

    constructor(private readonly registryEntry: RegistryEntry<T>) {}

    private encode(
        type: PropertyConstraints<any>,
        value: any,
        options: SerializationOptions,
    ): void {
        if (type instanceof ListConstraints) {
            const subType = type.itemType;
            this.encoder.appendNumber(value.length);
            for (const item of value) {
                this.encode(subType, item, options);
            }
            return;
        }

        if (type instanceof CompositeConstraints) {
            for (const [key, subType] of type.properties.entries()) {
                this.encode(subType, value[key], options);
            }
            return;
        }

        if (
            type instanceof NumberConstraints ||
            type instanceof ColorConstraints
        ) {
            this.encoder.appendNumber(value, options.maxNumberDecimals);
            return;
        }

        if (
            type instanceof StringConstraints ||
            type instanceof EnumConstraints ||
            type instanceof EntityIdConstraints
        ) {
            this.encoder.appendString(value);
            return;
        }

        if (type instanceof BooleanConstraints) {
            this.encoder.appendBool(value);
            return;
        }

        if (type instanceof JsonConstraints) {
            this.encoder.appendString(JSON.stringify(value));
            return;
        }

        throw new Error(`Unrecognized value type: ${type}`);
    }

    private decode(type: PropertyConstraints<any>): any {
        if (type instanceof ListConstraints) {
            const subType = type.itemType;
            const listLength = this.decoder.nextNumber();

            const res = [];
            for (let i = 0; i < listLength; i++) {
                res.push(this.decode(subType));
            }
            return res;
        }

        if (type instanceof CompositeConstraints) {
            const res: any = {};
            for (const [key, subType] of type.properties.entries()) {
                res[key] = this.decode(subType);
            }
            return res;
        }

        if (
            type instanceof NumberConstraints ||
            type instanceof ColorConstraints
        ) {
            return this.decoder.nextNumber();
        }

        if (
            type instanceof StringConstraints ||
            type instanceof EnumConstraints ||
            type instanceof EntityIdConstraints
        ) {
            return this.decoder.nextString();
        }

        if (type instanceof BooleanConstraints) {
            return this.decoder.nextBool();
        }

        if (type instanceof JsonConstraints) {
            return JSON.parse(this.decoder.nextString());
        }

        throw new Error(`Unrecognized value type: ${type}`);
    }

    serialize(trait: Trait, options: SerializationOptions): EncoderSequence {
        // Bind to a temporary entity so we can read the properties
        const oldEntity = trait.entity;
        if (!oldEntity) {
            const entity = new Entity(undefined, [trait]);
            trait.bind(entity);
            if (oldEntity) {
                trait.bind(oldEntity);
            }
        }

        this.encoder.reset();

        for (const property of this.registryEntry.properties!) {
            const type = property.type;
            const value = property.get(trait.entity);
            this.encode(type, value, options);
        }

        return this.encoder.getResult();
    }

    deserialize(
        serialized: EncoderSequence,
        options: SerializationOptions,
        output: T,
    ): T {
        const trait = output || this.registryEntry.newTrait();

        // Bind to a temporary entity so we can write the properties
        REBINDABLE_ENTITY.setTrait(trait);

        this.decoder.setEncoded(serialized);

        for (const property of this.registryEntry.properties!) {
            const type = property.type;
            property.set(REBINDABLE_ENTITY, this.decode(type));
        }
        return trait;
    }
}
