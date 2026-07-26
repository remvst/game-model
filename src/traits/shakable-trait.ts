import { Vector2 } from "@remvst/geometry";
import { PropertyType } from "../properties/property-constraints";
import { RegistryEntry } from "../registry/trait-registry";
import {
    DefinitionsOfProps,
    SimpleTrait,
    simpleTraitRegistryEntry,
} from "./simple-trait";

export class ShakableTrait extends SimpleTrait<{
    interval: number;
    duration: number;
    power: number;
    nextUpdate: number;
}> {
    static readonly key = "shakable";
    readonly key = ShakableTrait.key;

    private readonly shakeOffset = new Vector2();

    definitions(): DefinitionsOfProps<ShakableTrait["props"]> {
        return {
            interval: PropertyType.num(1 / 60),
            duration: PropertyType.num(),
            power: PropertyType.num(),
            nextUpdate: PropertyType.num(),
        };
    }

    cycle(elapsed: number): void {
        this.props.duration -= elapsed;
        this.props.nextUpdate -= elapsed;
        if (this.props.duration > 0 && this.props.nextUpdate < 0) {
            this.props.nextUpdate = this.props.interval;
            this.shakeOffset.x += (Math.random() * 2 - 1) * this.props.power;
            this.shakeOffset.y += (Math.random() * 2 - 1) * this.props.power;
        } else {
            this.shakeOffset.x = 0;
            this.shakeOffset.y = 0;
        }

        this.entity!.position.x += this.shakeOffset.x;
        this.entity!.position.y += this.shakeOffset.y;
    }

    shake(power: number, duration: number) {
        this.props.power = Math.max(this.props.power, power);
        this.props.duration = Math.max(this.props.duration, duration);
    }

    static registryEntry(): RegistryEntry<ShakableTrait> {
        return simpleTraitRegistryEntry(ShakableTrait);
    }
}
