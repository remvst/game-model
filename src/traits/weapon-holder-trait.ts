import { EntityRemoved, Trait } from "@remvst/game-model";
import { Weapon } from "../weapon/weapon";
import { WeaponSwitched } from "../events/weapon-events";

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

        this.entity!.onEvent(EntityRemoved, (event) => {
            for (const weapon of this.weapons) {
                weapon?.effect?.destroy();
            }
        });
    }

    getWeapon(index: number): Weapon | null {
        return this.weapons[index] || null;
    }

    setWeapon(weapon: Weapon | null, index: number) {
        weapon = weapon || null; // Make sure we use null instead of undefined and such

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

    static registryEntry() {
        // TODO add the weapon property, serializing and such
    }
}
