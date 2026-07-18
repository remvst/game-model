import {
    AutomaticTrigger,
    BurstTrigger,
    HoldAndReleaseTrigger,
    SemiAutomaticTrigger,
    TriggerAction,
} from "../../src/weapon/weapon-trigger";

describe("SemiAutomaticTrigger", () => {
    let trigger: SemiAutomaticTrigger;

    beforeEach(() => {
        trigger = new SemiAutomaticTrigger(0.5);
    });

    it("fires once on pull", () => {
        expect(trigger.pull()).toBe(TriggerAction.TRIGGER_EFFECT);
    });

    it("does not fire again while still pulled", () => {
        trigger.pull();
        expect(trigger.pull()).toBe(TriggerAction.NONE);
    });

    it("respects interval cooldown — no fire immediately after releasing and re-pulling", () => {
        trigger.pull();
        trigger.release();
        // Cooldown hasn't expired yet
        expect(trigger.pull()).toBe(TriggerAction.NONE);
    });

    it("fires again after cooldown expires", () => {
        trigger.pull();
        trigger.release();
        trigger.cycle(0.5); // expire cooldown
        expect(trigger.pull()).toBe(TriggerAction.TRIGGER_EFFECT);
    });

    it("release returns END_EFFECT", () => {
        trigger.pull();
        expect(trigger.release()).toBe(TriggerAction.END_EFFECT);
    });
});

describe("AutomaticTrigger", () => {
    let trigger: AutomaticTrigger;

    beforeEach(() => {
        trigger = new AutomaticTrigger(0.5);
    });

    it("fires on initial pull", () => {
        expect(trigger.pull()).toBe(TriggerAction.TRIGGER_EFFECT);
    });

    it("repeats fire on each cycle while held", () => {
        trigger.pull();
        // cycle(0.5) will expire the cooldown and fire in the same call
        expect(trigger.cycle(0.5)).toBe(TriggerAction.TRIGGER_EFFECT);
    });

    it("does not fire while on cooldown", () => {
        trigger.pull();
        expect(trigger.cycle(0.1)).toBe(TriggerAction.NONE); // still in cooldown
    });

    it("stops firing after release", () => {
        trigger.pull();
        trigger.release();
        trigger.cycle(0.5);
        expect(trigger.cycle(0)).toBe(TriggerAction.NONE);
    });
});

describe("BurstTrigger", () => {
    let trigger: BurstTrigger;

    beforeEach(() => {
        // 3-shot burst, 0.1s between shots, 1s between bursts
        trigger = new BurstTrigger(3, 0.1, 1);
        // Mark as released so first pull is allowed
        trigger.release();
    });

    it("fires on the first pull", () => {
        expect(trigger.pull()).toBe(TriggerAction.TRIGGER_EFFECT);
    });

    it("fires burstSize shots total spaced by interval", () => {
        let shots = 0;

        // First shot from pull
        if (trigger.pull() === TriggerAction.TRIGGER_EFFECT) shots++;

        // Remaining 2 shots come from cycle
        for (let i = 0; i < 10; i++) {
            const action = trigger.cycle(0.1);
            if (action === TriggerAction.TRIGGER_EFFECT) shots++;
        }

        expect(shots).toBe(3);
    });

    it("does not fire again before burst interval has elapsed", () => {
        trigger.pull();
        trigger.release();

        // Complete burst
        for (let i = 0; i < 10; i++) trigger.cycle(0.1);

        // Try to start another burst immediately
        expect(trigger.pull()).toBe(TriggerAction.NONE);
    });

    it("fires again after burst interval has elapsed", () => {
        trigger.pull();
        trigger.release();

        // Complete burst (2 remaining shots via cycle)
        for (let i = 0; i < 10; i++) trigger.cycle(0.1);

        // After burst completes, released is reset to false — call release() again
        trigger.release();

        // Now wait for burst interval to expire
        trigger.cycle(1);

        expect(trigger.pull()).toBe(TriggerAction.TRIGGER_EFFECT);
    });
});

describe("HoldAndReleaseTrigger", () => {
    let trigger: HoldAndReleaseTrigger;

    beforeEach(() => {
        trigger = new HoldAndReleaseTrigger();
    });

    it("does not fire on pull", () => {
        expect(trigger.pull()).toBe(TriggerAction.NONE);
    });

    it("does not fire during cycle while held", () => {
        trigger.pull();
        expect(trigger.cycle()).toBe(TriggerAction.NONE);
    });

    it("fires on release after pull", () => {
        trigger.pull();
        expect(trigger.release()).toBe(TriggerAction.TRIGGER_EFFECT);
    });

    it("does not fire on release without prior pull", () => {
        expect(trigger.release()).toBe(TriggerAction.NONE);
    });
});
