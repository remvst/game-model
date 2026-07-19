import { Vector2 } from "@remvst/geometry";
import { PropertyType } from "../properties/property-constraints";
import {
    traitRegistryEntry,
    TraitRegistryEntry,
} from "../registry/trait-registry";
import { Trait } from "../trait";

export class ShakableTrait extends Trait {
    static readonly key = "shakable";
    readonly key = ShakableTrait.key;

    interval: number = 1 / 60;
    duration: number = 0;
    power: number = 0;
    nextUpdate: number = 0;

    private readonly shakeOffset = new Vector2();

    cycle(elapsed: number): void {
        this.duration -= elapsed;
        this.nextUpdate -= elapsed;
        if (this.duration > 0 && this.nextUpdate < 0) {
            this.nextUpdate = this.interval;
            this.shakeOffset.x += (Math.random() * 2 - 1) * this.power;
            this.shakeOffset.y += (Math.random() * 2 - 1) * this.power;
        } else {
            this.shakeOffset.x = 0;
            this.shakeOffset.y = 0;
        }

        this.entity!.position.x += this.shakeOffset.x;
        this.entity!.position.y += this.shakeOffset.y;
    }

    shake(power: number, duration: number) {
        this.power = Math.max(this.power, power);
        this.duration = Math.max(this.duration, duration);
    }

    static registryEntry(): TraitRegistryEntry<ShakableTrait> {
        return traitRegistryEntry<ShakableTrait>((builder) => {
            builder.traitClass(ShakableTrait);
            builder.simpleProp("interval", PropertyType.num());
            builder.simpleProp("duration", PropertyType.num());
            builder.simpleProp("power", PropertyType.num());
            builder.simpleProp("nextUpdate", PropertyType.num());
        });
    }
}
