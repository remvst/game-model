import { PropertyConstraints } from "../properties/property-constraints";
import { Weapon } from "./weapon";

export interface WeaponProperty<T> {
    identifier: string;
    localIdentifier: string;
    type: PropertyConstraints<T>;
    get: (weapon: Weapon) => T;
    set: (weapon: Weapon, value: T) => void;
}
