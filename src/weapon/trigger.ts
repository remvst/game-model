export interface Trigger {
    pull(): TriggerAction;
    release(): TriggerAction;
    cycle(elapsed: number): TriggerAction;
    reset(): void;
}

export enum TriggerAction {
    NONE = 0,
    TRIGGER_EFFECT = 1,
    END_EFFECT = 2,
}

export class SemiAutomaticTrigger implements Trigger {
    private pulled = false;
    private cooldown: number = 0;

    constructor(public interval: number) {}

    reset(): void {}

    cycle(elapsed: number): TriggerAction {
        this.cooldown -= elapsed;
        return TriggerAction.NONE;
    }

    pull(): TriggerAction {
        if (this.pulled) {
            return TriggerAction.NONE;
        }

        this.pulled = true;

        if (this.cooldown <= 0) {
            this.cooldown = this.interval;
            return TriggerAction.TRIGGER_EFFECT;
        } else {
            return TriggerAction.NONE;
        }
    }

    release(): TriggerAction {
        if (!this.pulled) {
            return TriggerAction.NONE;
        }

        this.pulled = false;
        return TriggerAction.END_EFFECT;
    }
}

export class AutomaticTrigger implements Trigger {
    private pulled = false;
    private cooldown: number = 0;

    constructor(public interval: number) {}

    reset(): void {}

    cycle(elapsed: number): TriggerAction {
        this.cooldown -= elapsed;

        if (this.pulled && this.cooldown <= 0) {
            this.cooldown = this.interval;
            return TriggerAction.TRIGGER_EFFECT;
        }
        return TriggerAction.NONE;
    }

    pull(): TriggerAction {
        if (this.pulled) {
            return TriggerAction.NONE;
        }

        if (this.cooldown <= 0) {
            this.cooldown = this.interval;
            this.pulled = true;
            return TriggerAction.TRIGGER_EFFECT;
        }
        return TriggerAction.NONE;
    }

    release(): TriggerAction {
        this.pulled = false;
        return TriggerAction.NONE;
    }
}

export class HoldTrigger implements Trigger {
    private pulled = false;

    reset(): void {}

    cycle(): TriggerAction {
        return this.pulled
            ? TriggerAction.TRIGGER_EFFECT
            : TriggerAction.END_EFFECT;
    }

    pull(): TriggerAction {
        this.pulled = true;
        return TriggerAction.NONE;
    }

    release(): TriggerAction {
        this.pulled = false;
        return TriggerAction.END_EFFECT;
    }
}

export class BurstTrigger implements Trigger {
    private cooldown: number = 0;
    private remainingBurstShots: number = 0;
    private released = false;

    constructor(
        readonly burstSize: number,
        readonly interval: number,
        readonly burstInterval: number,
    ) {}

    get burstDuration() {
        return (this.burstSize - 1) * this.interval;
    }

    reset(): void {
        this.remainingBurstShots = 0;
    }

    cycle(elapsed: number): TriggerAction {
        this.cooldown -= elapsed;

        if (this.remainingBurstShots > 0) {
            if (this.cooldown <= 0) {
                this.cooldown = this.interval;
                this.remainingBurstShots--;

                if (this.remainingBurstShots <= 0) {
                    this.released = false;
                    this.cooldown = this.burstInterval;
                }

                return TriggerAction.TRIGGER_EFFECT;
            }
        }

        return TriggerAction.NONE;
    }

    pull(): TriggerAction {
        if (!this.released || this.cooldown > 0) {
            return TriggerAction.NONE;
        }

        if (this.remainingBurstShots > 0) {
            return TriggerAction.NONE;
        }

        this.cooldown = this.interval;
        this.remainingBurstShots = this.burstSize - 1;
        return TriggerAction.TRIGGER_EFFECT;
    }

    release(): TriggerAction {
        if (this.remainingBurstShots <= 0) {
            this.released = true;
        }

        return TriggerAction.NONE;
    }
}

export class HoldAndReleaseTrigger implements Trigger {
    pulled = false;

    reset(): void {}

    cycle(): TriggerAction {
        return TriggerAction.NONE;
    }

    pull(): TriggerAction {
        this.pulled = true;
        return TriggerAction.NONE;
    }

    release(): TriggerAction {
        if (!this.pulled) {
            return TriggerAction.NONE;
        }
        this.pulled = false;
        return TriggerAction.TRIGGER_EFFECT;
    }
}
