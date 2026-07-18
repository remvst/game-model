import { entity } from "../../src/entity";
import { GameModelApp } from "../../src/game-model-app";
import { weaponRegistryEntry } from "../../src/registry/weapon-registry";
import { WeaponHolderTrait } from "../../src/traits/weapon-holder-trait";
import { SemiAutomaticTrigger, WeaponTrigger } from "../../src/weapon/trigger";
import { Weapon } from "../../src/weapon/weapon";
import {
    CompositeWeaponEffect,
    WeaponEffect,
} from "../../src/weapon/weapon-effect";
import { World } from "../../src/world";

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

describe("WeaponEffect", () => {
    let effect: NoOpWeaponEffect;
    let weapon: TestWeapon;
    let world: World;

    beforeEach(() => {
        world = new World();
        weapon = new TestWeapon();
        effect = weapon.effect;

        const e = entity([new WeaponHolderTrait()]);
        world.entities.add(e);
        e.traitOfType(WeaponHolderTrait)!.setWeapon(weapon, 0);
    });

    it("triggerEffect increments effectCount", () => {
        expect(effect.effectCount).toBe(0);
        effect.triggerEffect();
        expect(effect.effectCount).toBe(1);
    });

    it("triggerEffect calls startEffect", () => {
        effect.triggerEffect();
        expect(effect.startEffectCount).toBe(1);
    });
});

describe("CompositeWeaponEffect", () => {
    let child1: NoOpWeaponEffect;
    let child2: NoOpWeaponEffect;
    let composite: CompositeWeaponEffect;
    let weapon: TestWeapon;
    let world: World;

    beforeEach(() => {
        child1 = new NoOpWeaponEffect();
        child2 = new NoOpWeaponEffect();
        composite = new CompositeWeaponEffect([child1, child2]);

        world = new World();
        // Build a weapon with the composite effect
        class CompositeTestWeapon extends Weapon {
            static readonly key = "composite-test-weapon";
            readonly key = CompositeTestWeapon.key;
            readonly type = CompositeTestWeapon.key;
            readonly trigger = new SemiAutomaticTrigger(0);
            readonly effect = composite;
        }
        weapon = new CompositeTestWeapon() as any;

        const e = entity([new WeaponHolderTrait()]);
        world.entities.add(e);
        e.traitOfType(WeaponHolderTrait)!.setWeapon(weapon as any, 0);
    });

    it("delegates startEffect to all children", () => {
        composite.startEffect();
        expect(child1.startEffectCount).toBe(1);
        expect(child2.startEffectCount).toBe(1);
    });

    it("delegates endEffect to all children", () => {
        composite.endEffect();
        expect(child1.endEffectCount).toBe(1);
        expect(child2.endEffectCount).toBe(1);
    });

    it("sums projectileCount of children", () => {
        expect(composite.projectileCount).toBe(2);
    });
});
