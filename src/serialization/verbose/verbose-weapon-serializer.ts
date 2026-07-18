import { Weapon } from "../../weapon/weapon";
import { WeaponSerializer, WeaponClass } from "../../weapon/weapon-registry";
import { SerializationOptions } from "../serialization-options";

export class VerboseWeaponSerializer<
    T extends Weapon,
> implements WeaponSerializer<T> {
    // TODO
}
