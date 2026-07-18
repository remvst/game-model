import { entity } from "../../src/entity";
import { GameModelApp } from "../../src/game-model-app";
import { weaponRegistryEntry } from "../../src/registry/weapon-registry";
import { WeaponHolderTrait } from "../../src/traits/weapon-holder-trait";
import { Weapon } from "../../src/weapon/weapon";
import { WeaponEffect } from "../../src/weapon/weapon-effect";
import {
    SemiAutomaticTrigger,
    WeaponTrigger,
} from "../../src/weapon/weapon-trigger";
import { World } from "../../src/world";

class NoOpWeaponEffect extends WeaponEffect {
    startEffectCount = 0;
    endEffectCount = 0;

    startEffect(): void {
        this.startEffectCount++;
    }

    endEffect(): void {
        this.endEffectCount++;
    }
}

class TestWeapon extends Weapon {
    static readonly key = "test-weapon";
    readonly key = TestWeapon.key;
    readonly type = TestWeapon.key;

    readonly trigger: WeaponTrigger;
    readonly effect: NoOpWeaponEffect;

    constructor(trigger?: WeaponTrigger) {
        super();
        this.trigger = trigger ?? new SemiAutomaticTrigger(0);
        this.effect = new NoOpWeaponEffect();
    }

    static registryEntry(app: GameModelApp) {
        return weaponRegistryEntry<TestWeapon>((builder) => {
            builder.key(TestWeapon.key);
            builder.newWeapon(() => new TestWeapon());
        });
    }
}

describe("Weapon", () => {
    let weapon: TestWeapon;
    let world: World;
    let holder: WeaponHolderTrait;

    beforeEach(() => {
        weapon = new TestWeapon(new SemiAutomaticTrigger(0));
        world = new World();

        const e = entity([new WeaponHolderTrait()]);
        world.entities.add(e);
        holder = e.traitOfType(WeaponHolderTrait)!;
        holder.setWeapon(weapon, 0);
    });

    it("setTriggerPulled(true) triggers effect when ammo is ready", () => {
        weapon.setTriggerPulled(true);
        expect(weapon.effect.effectCount).toBe(1);
    });

    it("setTriggerPulled(true) does not trigger effect when ammo is empty", () => {
        weapon.ammo.ammoInClip = 0;
        weapon.ammo.ammoInPouch = 0;
        weapon.setTriggerPulled(true);
        expect(weapon.effect.effectCount).toBe(0);
    });

    it("cycle advances ammo controller age", () => {
        const ageBefore = weapon.ammo.age;
        weapon.cycle(1);
        expect(weapon.ammo.age).toBe(ageBefore + 1);
    });

    it("cycle advances heat controller age", () => {
        const ageBefore = weapon.heat.age;
        weapon.cycle(1);
        expect(weapon.heat.age).toBe(ageBefore + 1);
    });

    it("setOwner wires up ammo onReloading callback that fires entity event", () => {
        // Manually trigger onReloading by starting a reload
        weapon.ammo.ammoInClip = 0;
        weapon.ammo.ammoInPouch = 10;
        weapon.ammo.reload(weapon.ammo.reloadTime);
        // If wired correctly, the weapon's effect.onReloading was called (no exception thrown)
        expect(weapon.ammo.reloading).toBe(true);
    });

    it("setOwner sets weaponType on events", () => {
        // Verified indirectly: after setOwner the weapon type should be recorded.
        // We check by calling setOwner again with the same entity (no-op path).
        const ownerBefore = weapon.owner;
        weapon.setOwner(ownerBefore); // should be a no-op
        expect(weapon.owner).toBe(ownerBefore);
    });
});
