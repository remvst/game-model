import {
    GameModelApp,
    KeyProvider,
    Serializer,
} from "@remvst/game-model";
import { Weapon } from "./weapon";

export interface WeaponRegistryEntry<WeaponType extends Weapon> {
    key: string;
    newWeapon: () => WeaponType;
    serializer: (app: GameModelApp) => WeaponSerializer<WeaponType>;
}

export type WeaponClass<T extends Weapon> = (new () => T) & KeyProvider;

export class WeaponRegistryEntryBuilder<WeaponType extends Weapon> {
    private _key!: string;
    private _newWeapon!: () => WeaponType;
    private _serializer!: (app: GameModelApp) => WeaponSerializer<WeaponType>;

    weaponClass(weaponClass: WeaponClass<WeaponType>): void {
        this.key(weaponClass.key);
        this.newWeapon(() => new weaponClass());
        this.serializer(() => new BaseWeaponSerializer(weaponClass)); // TODO
    }

    key(key: string): void {
        this._key = key;
    }

    serializer(
        serializer: (app: GameModelApp) => WeaponSerializer<WeaponType>,
    ): void {
        this._serializer = serializer;
    }

    newWeapon(newWeapon: () => WeaponType): void {
        this._newWeapon = newWeapon;
    }

    registryEntry(): WeaponRegistryEntry<WeaponType> {
        return {
            key: this._key,
            newWeapon: this._newWeapon,
            serializer: this._serializer,
        };
    }
}

export function weaponRegistryEntry<WeaponType extends Weapon>(
    func: (builder: WeaponRegistryEntryBuilder<WeaponType>) => void,
) {
    const builder = new WeaponRegistryEntryBuilder<WeaponType>();
    func(builder);
    return builder.registryEntry();
}

export type WeaponSerializer<WeaponType extends Weapon> = Serializer<
    WeaponType,
    any
>;

export interface WeaponRegistryEntryProvider {
    registryEntry(app: GameModelApp): WeaponRegistryEntry<Weapon>;
}

export class WeaponRegistry {
    private readonly entries = new Map<string, WeaponRegistryEntry<Weapon>>();

    add(entry: WeaponRegistryEntry<Weapon>) {
        this.entries.set(entry.key, entry);
    }

    entry(key: string) {
        return this.entries.get(key);
    }

    keys(): Iterable<string> {
        return this.entries.keys();
    }
}
