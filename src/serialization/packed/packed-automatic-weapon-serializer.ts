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
import { WeaponRegistryEntry } from "../../registry/weapon-registry";
import { Weapon } from "../../weapon/weapon";
import { ArrayDecoder, ArrayEncoder, EncoderSequence } from "../encoder";
import { SerializationOptions } from "../serialization-options";
import { Serializer } from "../serializer";

export class PackedAutomaticWeaponSerializer<T extends Weapon>
    implements Serializer<T, EncoderSequence>
{
    private readonly encoder = new ArrayEncoder();
    private readonly decoder = new ArrayDecoder();

    constructor(private readonly registryEntry: WeaponRegistryEntry<T>) {}

    private encode(
        type: PropertyConstraints<any>,
        value: any,
        options: SerializationOptions,
    ): void {
        if (type instanceof ListConstraints) {
            this.encoder.appendNumber(value.length);
            for (const item of value) {
                this.encode(type.itemType, item, options);
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
            const length = this.decoder.nextNumber();
            const res = [];
            for (let i = 0; i < length; i++) {
                res.push(this.decode(type.itemType));
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

    serialize(weapon: T, options: SerializationOptions): EncoderSequence {
        this.encoder.reset();
        for (const property of this.registryEntry.properties || []) {
            this.encode(property.type, property.get(weapon), options);
        }
        return this.encoder.getResult();
    }

    deserialize(
        serialized: EncoderSequence,
        _options: SerializationOptions,
    ): T {
        const weapon = this.registryEntry.newWeapon();
        this.decoder.setEncoded(serialized);
        for (const property of this.registryEntry.properties || []) {
            property.set(weapon, this.decode(property.type));
        }
        return weapon;
    }
}
