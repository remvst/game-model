import { Entity } from "../entity";
import {
    WeaponAmmoDepleted,
    WeaponEffectFailed,
    WeaponEffectTriggered,
    WeaponReloadStarted,
} from "../events/weapon-events";
import { KeyProvider } from "../key-provider";
import { Decoder, Encoder } from "../serialization/encoder";
import { AmmoController } from "./ammo-controller";
import { HeatController } from "./heat-controller";
import { TriggerAction, WeaponTrigger } from "./trigger";
import { WeaponEffect } from "./weapon-effect";

export abstract class Weapon implements KeyProvider {
    abstract readonly trigger: WeaponTrigger;
    abstract readonly effect: WeaponEffect;
    readonly ammo: AmmoController = new AmmoController({});
    readonly heat: HeatController = new HeatController({});
    abstract key: string;

    abstract readonly type: string;
    owner!: Entity;

    lastEffectFail: number = Number.MIN_SAFE_INTEGER;

    private readonly events = {
        reloadStarted: new WeaponReloadStarted(),
        effectTriggered: new WeaponEffectTriggered(),
        effectFailed: new WeaponEffectFailed(),
        ammoDepleted: new WeaponAmmoDepleted(),
    };

    setOwner(owner: Entity) {
        if (owner === this.owner) {
            return;
        }

        this.owner = owner;
        this.effect.setWeapon(this);

        this.ammo.bind({
            onReloading: () => {
                this.effect.onReloading();
                this.owner.addEvent(this.events.reloadStarted);
            },
            onDepleted: () => {
                this.owner.addEvent(this.events.ammoDepleted);
            },
        });

        this.events.reloadStarted.weaponType = this.type;
        this.events.ammoDepleted.weaponType = this.type;
        this.events.effectTriggered.weaponType = this.type;
        this.events.effectFailed.weaponType = this.type;
    }

    setTriggerPulled(pulled: boolean) {
        const action = pulled ? this.trigger.pull() : this.trigger.release();
        switch (action) {
            case TriggerAction.TRIGGER_EFFECT:
                this.maybeTriggerEffect(0);
                break;
            case TriggerAction.END_EFFECT:
                this.effect.endEffect();
                break;
        }
    }

    get readiness(): number {
        return this.ammo.readiness;
    }

    private maybeTriggerEffect(elapsed: number) {
        if (!this.ammo.ready) {
            if (!this.ammo.reloading) {
                this.lastEffectFail = this.owner.age;
                this.owner.addEvent(this.events.effectFailed);
            }
            return;
        }

        this.effect.triggerEffect();
        this.owner.addEvent(this.events.effectTriggered);

        this.ammo.onTriggerEffect(elapsed);
        this.heat.onTriggerEffect(elapsed);
    }

    cycle(elapsed: number) {
        const action = this.trigger.cycle(elapsed);
        switch (action) {
            case TriggerAction.TRIGGER_EFFECT:
                this.maybeTriggerEffect(elapsed);
                break;
            case TriggerAction.END_EFFECT:
                this.effect.endEffect();
                break;
        }

        this.effect.cycle(elapsed);
        this.ammo.cycle(elapsed);
        this.heat.cycle(elapsed);
    }

    encode(_encoder: Encoder) {
        // TODO
    }

    decode(_decoder: Decoder) {
        // TODO
    }
}
