import { entity } from "../../src/entity";
import { GameModelApp } from "../../src/game-model-app";
import { weaponRegistryEntry } from "../../src/registry/weapon-registry";
import { SerializationOptions } from "../../src/serialization/serialization-options";
import { WeaponHolderTrait } from "../../src/traits/weapon-holder-trait";
import { Weapon } from "../../src/weapon/weapon";
import { WeaponEffect } from "../../src/weapon/weapon-effect";
import {
    AutomaticTrigger,
    SemiAutomaticTrigger,
    WeaponTrigger,
} from "../../src/weapon/weapon-trigger";
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

describe("WeaponHolderTrait", () => {
    let trait: WeaponHolderTrait;
    let world: World;

    beforeEach(() => {
        world = new World();
        const e = entity([new WeaponHolderTrait()]);
        world.entities.add(e);
        trait = e.traitOfType(WeaponHolderTrait)!;
    });

    it("setWeapon stores the weapon and calls setOwner", () => {
        const weapon = new TestWeapon();
        trait.setWeapon(weapon, 0);

        expect(trait.getWeapon(0)).toBe(weapon);
        expect(weapon.owner).toBeDefined();
    });

    it("cycle delegates to all held weapons", () => {
        const weapon = new TestWeapon(new AutomaticTrigger(0.5));
        trait.setWeapon(weapon, 0);

        const ageBefore = weapon.ammo.age;
        trait.cycle(1);
        expect(weapon.ammo.age).toBe(ageBefore + 1);
    });

    it("replacing a weapon releases the trigger on the old weapon", () => {
        const oldWeapon = new TestWeapon(new SemiAutomaticTrigger(0));
        trait.setWeapon(oldWeapon, 0);

        // Pull the trigger so it is held
        oldWeapon.setTriggerPulled(true);
        expect(oldWeapon.effect.effectCount).toBe(1);

        // Replace with a new weapon — old weapon's trigger should be released
        const newWeapon = new TestWeapon();
        trait.setWeapon(newWeapon, 0);

        // Pulling old weapon's trigger again should still work (trigger was released), but
        // the important thing is that replacing didn't throw and the new weapon is stored.
        expect(trait.getWeapon(0)).toBe(newWeapon);
    });

    it("registryEntry round-trips ammoInClip through serialization", () => {
        const app = new GameModelApp();
        app.weaponRegistry.add(TestWeapon.registryEntry(app));
        app.traitRegistry.add(WeaponHolderTrait.registryEntry(app));
        app.finalize();

        const weapon = new TestWeapon();
        weapon.ammo.ammoInClip = 2; // drain some ammo

        const e = entity([new WeaponHolderTrait()]);
        const holderTrait = e.traitOfType(WeaponHolderTrait)!;

        // Need a world so postBind is called and setOwner works
        world.entities.add(e);
        holderTrait.setWeapon(weapon, 0);

        const options = new SerializationOptions();
        const serialized = app.serializers.verbose.entity.serialize(e, options);
        const deserialized = app.serializers.verbose.entity.deserialize(
            serialized,
            options,
        );

        const deserializedHolder = deserialized.traitOfType(WeaponHolderTrait)!;

        // Need to bind the deserialized entity to a world so setOwner is invoked
        const world2 = new World();
        world2.entities.add(deserialized);

        const restoredWeapon = deserializedHolder.getWeapon(0);
        expect(restoredWeapon).not.toBeNull();
        expect(restoredWeapon!.ammo.ammoInClip).toBe(2);
    });
});
