import { Entity } from "@remvst/game-model";
import { Weapon } from "./weapon";

export abstract class WeaponEffect {
    effectCount = 0;
    lastEffect = -99;
    readonly projectileCount: number = 1;

    triggerEffect(): void {
        this.effectCount++;
        this.lastEffect = this.owner!.age;
        this.startEffect();
    }

    abstract startEffect(): void;

    abstract endEffect(): void;

    weapon: Weapon | null = null;

    setWeapon(weapon: Weapon) {
        this.weapon = weapon;
    }

    get owner(): Entity | null {
        return this.weapon?.owner || null;
    }

    cycle(_: number) {}

    onReloading() {}

    destroy() {}
}

export class CompositeWeaponEffect extends WeaponEffect {
    readonly projectileCount: number;

    constructor(private readonly effects: WeaponEffect[]) {
        super();
        this.projectileCount = effects.reduce(
            (sum, effect) => sum + effect.projectileCount,
            0,
        );
    }

    startEffect(): void {
        this.effects.forEach((effect) => effect.startEffect());
    }

    endEffect(): void {
        this.effects.forEach((effect) => effect.endEffect());
    }

    cycle(elapsed: number) {
        super.cycle(elapsed);
        this.effects.forEach((effect) => effect.cycle(elapsed));
    }

    setWeapon(weapon: Weapon) {
        super.setWeapon(weapon);
        this.effects.forEach((effect) => effect.setWeapon(weapon));
    }
}

export class SimpleWeaponEffect extends WeaponEffect {
    constructor(
        private opts: {
            startEffect?: (effect: SimpleWeaponEffect) => void;
            endEffect?: (effect: SimpleWeaponEffect) => void;
            cycle?: (effect: SimpleWeaponEffect, elapsed: number) => void;
        },
    ) {
        super();
    }

    startEffect(): void {
        this.opts.startEffect?.call(null, this);
    }

    endEffect(): void {
        this.opts.endEffect?.call(null, this);
    }

    cycle(elapsed: number) {
        this.opts.cycle?.call(null, this, elapsed);
    }
}
