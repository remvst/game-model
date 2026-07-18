// ---------------------------------------------------------------------------
// HeatController
// ---------------------------------------------------------------------------

import { HeatController } from "../../src/weapon/heat-controller";

describe("HeatController", () => {
    let heat: HeatController;

    beforeEach(() => {
        heat = new HeatController({
            heatPerShot: 0.25,
            decreaseDelay: 1,
            decreasePerSecond: 0.5,
        });
    });

    it("starts at 0", () => {
        expect(heat.heat).toBe(0);
    });

    it("onTriggerEffect increases heat by heatPerShot", () => {
        heat.onTriggerEffect(0);
        expect(heat.heat).toBeCloseTo(0.25, 5);
    });

    it("heat does not decrease before decreaseDelay has passed", () => {
        heat.onTriggerEffect(0);
        heat.cycle(0.5); // advance 0.5s; age (0.5) - lastEffect (0) = 0.5 < delay (1)
        expect(heat.heat).toBeCloseTo(0.25, 5);
    });

    it("heat decreases over time after decreaseDelay", () => {
        heat.onTriggerEffect(0);
        heat.cycle(1.1); // age exceeds delay
        // after 1.1s of cooling at 0.5/s the heat should be < 0.25
        expect(heat.heat).toBeLessThan(0.25);
    });

    it("heat is clamped to 0 (does not go negative)", () => {
        heat.cycle(10); // long cooling with heat already 0
        expect(heat.heat).toBe(0);
    });

    it("heat is clamped to 1 (does not exceed 1)", () => {
        const bigHeat = new HeatController({ heatPerShot: 2 });
        bigHeat.onTriggerEffect(0);
        expect(bigHeat.heat).toBe(1);
    });
});
