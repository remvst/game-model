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
import { SerializationOptions } from "../serialization-options";
import { Serializer } from "../serializer";

export interface VerboseSerializedWeapon {
    [key: string]: any;
}

export class VerboseAutomaticWeaponSerializer<T extends Weapon>
    implements Serializer<T, VerboseSerializedWeapon>
{
    constructor(private readonly registryEntry: WeaponRegistryEntry<T>) {}

    serialize(weapon: T, _options: SerializationOptions): VerboseSerializedWeapon {
        const serialized: VerboseSerializedWeapon = {};
        for (const property of this.registryEntry.properties || []) {
            serialized[property.localIdentifier] = this.serializeValue(
                property.type,
                property.get(weapon),
            );
        }
        return serialized;
    }

    deserialize(
        serialized: VerboseSerializedWeapon,
        _options: SerializationOptions,
    ): T {
        const weapon = this.registryEntry.newWeapon();
        for (const property of this.registryEntry.properties || []) {
            if (!Object.prototype.hasOwnProperty.call(serialized, property.localIdentifier)) {
                continue;
            }
            property.set(
                weapon,
                this.deserializeValue(property.type, serialized[property.localIdentifier]),
            );
        }
        return weapon;
    }

    private serializeValue(type: PropertyConstraints<any>, value: any): any {
        if (type instanceof ListConstraints) {
            return (value as any[]).map((item) =>
                this.serializeValue(type.itemType, item),
            );
        }

        if (type instanceof CompositeConstraints) {
            const res: any = {};
            for (const [key, subType] of type.properties.entries()) {
                res[key] = this.serializeValue(subType, value[key]);
            }
            return res;
        }

        if (type instanceof JsonConstraints) {
            return JSON.stringify(value);
        }

        if (type instanceof BooleanConstraints) {
            return value ? 1 : 0;
        }

        if (type instanceof NumberConstraints) {
            return value || 0;
        }

        if (
            type instanceof StringConstraints ||
            type instanceof ColorConstraints ||
            type instanceof EntityIdConstraints ||
            type instanceof EnumConstraints
        ) {
            return value;
        }

        throw new Error(`Unknown property type: ${type}`);
    }

    private deserializeValue(type: PropertyConstraints<any>, serialized: any): any {
        if (type instanceof ListConstraints) {
            return (serialized as any[]).map((item) =>
                this.deserializeValue(type.itemType, item),
            );
        }

        if (type instanceof CompositeConstraints) {
            const res: any = {};
            for (const [key, subType] of type.properties.entries()) {
                res[key] = this.deserializeValue(subType, serialized[key]);
            }
            return res;
        }

        if (type instanceof JsonConstraints) {
            return JSON.parse(serialized);
        }

        if (type instanceof BooleanConstraints) {
            return !!serialized;
        }

        if (type instanceof NumberConstraints) {
            return serialized || 0;
        }

        if (
            type instanceof StringConstraints ||
            type instanceof ColorConstraints ||
            type instanceof EntityIdConstraints ||
            type instanceof EnumConstraints
        ) {
            return serialized;
        }

        throw new Error(`Unknown property type: ${type}`);
    }
}
