import { GameModelApp } from "../game-model-app";
import { KeyProvider } from "../key-provider";
import {
    PropertyConstraints,
    PropertyType,
} from "../properties/property-constraints";
import { DualSupportWeaponSerializer } from "../serialization/dual/dual-support-weapon-serializer";
import { PackedAutomaticWeaponSerializer } from "../serialization/packed/packed-automatic-weapon-serializer";
import { AnySerialized, Serializer } from "../serialization/serializer";
import { VerboseAutomaticWeaponSerializer } from "../serialization/verbose/verbose-automatic-weapon-serializer";
import { Weapon } from "../weapon/weapon";
import { WeaponProperty } from "../weapon/weapon-property";

export interface WeaponRegistryEntry<WeaponType extends Weapon> {
    key: string;
    newWeapon: () => WeaponType;
    serializer: (app: GameModelApp) => WeaponSerializer<WeaponType>;
    properties: WeaponProperty<any>[];
}

export type WeaponClass<T extends Weapon> = (new () => T) & KeyProvider;

export type WeaponSerializer<WeaponType extends Weapon> = Serializer<
    WeaponType,
    AnySerialized
>;

class WeaponRegistryEntryBuilder<WeaponType extends Weapon> {
    private _key!: string;
    private _newWeapon!: () => WeaponType;
    private _serializer!: (app: GameModelApp) => WeaponSerializer<WeaponType>;
    private readonly _rawProperties: {
        localIdentifier: string;
        type: PropertyConstraints<any>;
        get: (weapon: Weapon) => any;
        set: (weapon: Weapon, value: any) => void;
    }[] = [];

    constructor() {
        this.serializer((app: GameModelApp) => {
            const entry = app.weaponRegistry.entry(this._key)!;
            return new DualSupportWeaponSerializer(
                new VerboseAutomaticWeaponSerializer(entry),
                new PackedAutomaticWeaponSerializer(entry),
            ) as any;
        });

        // Base ammo properties
        this.property(
            "ammoInClip",
            PropertyType.num(),
            (w) => w.ammo.ammoInClip,
            (w, v) => (w.ammo.ammoInClip = v),
        );
        this.property(
            "ammoInPouch",
            PropertyType.num(),
            (w) => w.ammo.ammoInPouch,
            (w, v) => (w.ammo.ammoInPouch = v),
        );

        // Base heat properties
        this.property(
            "heat",
            PropertyType.num(),
            (w) => w.heat.heat,
            (w, v) => (w.heat.heat = v),
        );
    }

    weaponClass(weaponClass: WeaponClass<WeaponType>): void {
        this._key = weaponClass.key;
        this._newWeapon = () => new weaponClass();
    }

    key(key: string): void {
        this._key = key;
    }

    newWeapon(newWeapon: () => WeaponType): void {
        this._newWeapon = newWeapon;
    }

    serializer(
        serializer: (app: GameModelApp) => WeaponSerializer<WeaponType>,
    ): void {
        this._serializer = serializer;
    }

    property<T>(
        identifier: string,
        type: PropertyConstraints<T>,
        get: (weapon: WeaponType) => T,
        set: (weapon: WeaponType, value: T) => void,
    ): void {
        this._rawProperties.push({
            localIdentifier: identifier,
            type,
            get: (weapon) => get(weapon as WeaponType),
            set: (weapon, value) => set(weapon as WeaponType, value),
        });
    }

    simpleProp<
        Key extends string & keyof WeaponType,
        T extends WeaponType[Key],
    >(identifier: Key, type: PropertyConstraints<T>) {
        this.property(
            identifier,
            type,
            (weapon) => weapon[identifier],
            (weapon, value) => (weapon[identifier] = value),
        );
    }

    build(): WeaponRegistryEntry<WeaponType> {
        const key = this._key;
        return {
            key,
            newWeapon: this._newWeapon,
            serializer: this._serializer,
            properties: this._rawProperties.map((p) => ({
                identifier: key + "." + p.localIdentifier,
                localIdentifier: p.localIdentifier,
                type: p.type,
                get: p.get,
                set: p.set,
            })),
        };
    }
}

export function weaponRegistryEntry<WeaponType extends Weapon>(
    func: (builder: WeaponRegistryEntryBuilder<WeaponType>) => void,
): WeaponRegistryEntry<WeaponType> {
    const builder = new WeaponRegistryEntryBuilder<WeaponType>();
    func(builder);
    return builder.build();
}

export interface WeaponRegistryEntryProvider {
    registryEntry(app: GameModelApp): WeaponRegistryEntry<Weapon>;
}

export class WeaponRegistry {
    private readonly entries = new Map<string, WeaponRegistryEntry<Weapon>>();

    add(entry: WeaponRegistryEntry<Weapon>) {
        if (this.entries.has(entry.key)) {
            throw new Error(`Entry conflict for key ${entry.key}`);
        }
        this.entries.set(entry.key, entry);
    }

    entry(key: string): WeaponRegistryEntry<Weapon> | null {
        return this.entries.get(key) || null;
    }

    keys(): Iterable<string> {
        return this.entries.keys();
    }
}
