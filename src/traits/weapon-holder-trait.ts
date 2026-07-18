import { EntityRemoved } from "../events/entity-removed";
import { WeaponSwitched } from "../events/weapon-events";
import { GameModelApp } from "../game-model-app";
import { PropertyType } from "../properties/property-constraints";
import { TraitRegistryEntry, traitRegistryEntry } from "../registry/trait-registry";
import { SerializationOptions } from "../serialization/serialization-options";
import { Trait } from "../trait";
import { Weapon } from "../weapon/weapon";

export class WeaponHolderTrait extends Trait {
    private weapons: (Weapon | null)[] = [];

    static readonly key = "weapon-holder";
    readonly key = WeaponHolderTrait.key;

    private readonly events = {
        weaponSwitch: new WeaponSwitched(),
    };

    postBind() {
        super.postBind();

        for (const weapon of this.weapons) {
            weapon?.setOwner(this.entity!);
        }

        this.entity!.onEvent(EntityRemoved, () => {
            for (const weapon of this.weapons) {
                weapon?.effect?.destroy();
            }
        });
    }

    get weaponCount(): number {
        return this.weapons.length;
    }

    getWeapon(index: number): Weapon | null {
        return this.weapons[index] || null;
    }

    setWeapon(weapon: Weapon | null, index: number) {
        weapon = weapon || null;

        const existing = this.weapons[index];
        if (weapon === existing) return;

        if (existing) {
            existing.setTriggerPulled(false);
            existing.trigger.reset();
        }
        this.weapons[index] = weapon;
        if (weapon) {
            weapon.setOwner(this.entity!);
            this.entity?.addEvent(this.events.weaponSwitch);
        }
    }

    cycle(elapsed: number) {
        for (let index = 0; index < this.weapons.length; index++) {
            this.weapons[index]?.cycle(elapsed);
        }
    }

    static registryEntry(app: GameModelApp): TraitRegistryEntry<WeaponHolderTrait> {
        return traitRegistryEntry<WeaponHolderTrait>((builder) => {
            builder.traitClass(WeaponHolderTrait);
            builder.property(
                "weapons",
                PropertyType.str(),
                (trait) =>
                    JSON.stringify(
                        Array.from({ length: trait.weaponCount }, (_, i) => {
                            const weapon = trait.getWeapon(i);
                            return weapon
                                ? app.serializers.verbose.weapon.serialize(
                                      weapon,
                                      new SerializationOptions(),
                                  )
                                : null;
                        }),
                    ),
                (trait, serialized) => {
                    const weapons = JSON.parse(serialized) as (object | null)[];
                    for (let i = 0; i < trait.weaponCount; i++) {
                        trait.setWeapon(null, i);
                    }
                    for (let i = 0; i < weapons.length; i++) {
                        const data = weapons[i];
                        trait.setWeapon(
                            data
                                ? app.serializers.verbose.weapon.deserialize(
                                      data,
                                      new SerializationOptions(),
                                  )
                                : null,
                            i,
                        );
                    }
                },
            );
        });
    }
}
