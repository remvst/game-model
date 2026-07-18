import { getOrDefault } from "../util/defaults";

export interface HeatParams {
    readonly decreaseDelay?: number;
    readonly decreasePerSecond?: number;
    readonly heatPerShot?: number;
}

export class WeaponHeatController {
    // Params
    readonly decreaseDelay: number = 0;
    readonly decreasePerSecond: number = 1;
    readonly heatPerShot: number = 1;

    // State
    heat = 0;
    age = 0;
    lastEffect = 0;

    constructor(opts: HeatParams) {
        this.decreaseDelay = getOrDefault(opts.decreaseDelay, 0);
        this.decreasePerSecond = getOrDefault(opts.decreasePerSecond, 1);
        this.heatPerShot = getOrDefault(opts.heatPerShot, 0);
    }

    onTriggerEffect(elapsed: number) {
        this.lastEffect = this.age;
        this.heat = Math.min(1, this.heat + this.heatPerShot);
    }

    cycle(elapsed: number) {
        this.age += elapsed;

        if (this.age - this.lastEffect > this.decreaseDelay) {
            this.heat = Math.max(
                0,
                this.heat - this.decreasePerSecond * elapsed,
            );
        }
    }
}
