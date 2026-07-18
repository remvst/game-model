import { getOrDefault } from "../util/defaults";

type AmmoConsumption = number | ((elapsed: number) => number);

function getAmmoConsumption(ammoConsumption: AmmoConsumption, elapsed: number) {
    const asAny = ammoConsumption as unknown as any;
    if (asAny.call) {
        return asAny(elapsed);
    } else {
        return asAny;
    }
}

export interface AmmoParams {
    readonly ammoConsumption?: AmmoConsumption;
    readonly clipSize?: number;
    readonly reloadTime?: number;
    readonly ammoInPouch?: number;
}

export class AmmoController {
    // State
    ammoInClip = 1;
    ammoInPouch = Number.MAX_SAFE_INTEGER;
    reloadStart = 0;
    reloadEnd = 0;
    age = 0;
    reloading = false;
    autoReload = false;
    inHand = false;

    // Params
    readonly ammoConsumption: AmmoConsumption;
    readonly clipSize: number;
    readonly reloadTime: number;

    // Callbacks
    private onReloading: () => void = () => {};
    private onDepleted: () => void = () => {};

    constructor(params: AmmoParams) {
        this.ammoConsumption = getOrDefault(params.ammoConsumption, 1);
        this.clipSize = getOrDefault(params.clipSize, 1);
        this.reloadTime = getOrDefault(params.reloadTime, 1);
        this.ammoInPouch =
            getOrDefault(params.ammoInPouch, Number.MAX_SAFE_INTEGER) - 1;
        this.ammoInClip = this.clipSize;
    }

    bind(opts: { onReloading: () => void; onDepleted: () => void }) {
        this.onReloading = opts.onReloading;
        this.onDepleted = opts.onDepleted;
    }

    onTriggerEffect(elapsed: number) {
        this.ammoInClip -= getAmmoConsumption(this.ammoConsumption, elapsed);
        if (this.ammoInClip <= 0 && this.ammoInPouch <= 0) {
            this.onDepleted();
        }
    }

    cycle(elapsed: number) {
        this.age += elapsed;

        if (this.reloading) {
            const reloadProgress = Math.min(
                1,
                (this.age - this.reloadStart) /
                    (this.reloadEnd - this.reloadStart),
            );

            if (reloadProgress >= 1) {
                this.reloading = false;

                const addedAmmo = Math.min(
                    this.ammoInPouch,
                    this.clipSize - this.ammoInClip,
                );
                this.ammoInClip += addedAmmo;
                this.ammoInPouch -= addedAmmo;
            }
        }
    }

    reload(duration: number) {
        if (this.ammoInPouch <= 0) return;
        if (this.ammoInClip >= this.clipSize) return;

        this.reloadStart = this.age;
        this.reloadEnd = this.age + duration;
        this.reloading = true;
        this.onReloading();
    }

    get readiness(): number {
        if (this.reloading) {
            return (
                (this.age - this.reloadStart) /
                (this.reloadEnd - this.reloadStart)
            );
        } else {
            return this.ammoInClip / this.clipSize;
        }
    }

    get empty(): boolean {
        return this.ammoInClip <= 0 || this.ammoInPouch <= 0;
    }

    get ready() {
        return !this.reloading && this.ammoInClip > 0;
    }
}

export class AlwaysReloadingAmmoController extends AmmoController {
    // Params
    private nextReload = 0;

    onTriggerEffect(elapsed: number) {
        super.onTriggerEffect(elapsed);
        this.nextReload = this.reloadTime / this.clipSize;
    }

    cycle(elapsed: number) {
        this.nextReload -= elapsed;

        this.reloading = false;

        if (this.ammoInClip < this.clipSize && this.nextReload <= 0) {
            this.ammoInClip++;
            this.nextReload = this.reloadTime / this.clipSize;
        }
    }

    get readiness(): number {
        return this.ammoInClip > 0 ? 1 : 0;
    }

    get ready() {
        return this.ammoInClip > 0;
    }
}
