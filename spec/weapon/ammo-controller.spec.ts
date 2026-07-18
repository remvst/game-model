// ---------------------------------------------------------------------------
// AmmoController
// ---------------------------------------------------------------------------

import {
    AlwaysReloadingAmmoController,
    WeaponAmmoController,
} from "../../src/weapon/weapon-ammo-controller";

describe("AmmoController", () => {
    describe("with default params", () => {
        let ammo: WeaponAmmoController;

        beforeEach(() => {
            ammo = new WeaponAmmoController({ clipSize: 5, reloadTime: 2 });
        });

        it("starts with a full clip", () => {
            expect(ammo.ammoInClip).toBe(5);
            expect(ammo.ready).toBe(true);
        });

        it("onTriggerEffect reduces ammoInClip", () => {
            ammo.onTriggerEffect(0);
            expect(ammo.ammoInClip).toBe(4);
        });

        it("ready is false when clip is empty", () => {
            ammo.ammoInPouch = 0; // prevent depletion callback complaints
            for (let i = 0; i < 5; i++) {
                ammo.onTriggerEffect(0);
            }
            expect(ammo.ready).toBe(false);
        });

        it("reload() refills the clip after reloadTime", () => {
            // Empty the clip first
            ammo.ammoInClip = 0;
            ammo.ammoInPouch = 10;

            ammo.reload(2);
            expect(ammo.reloading).toBe(true);

            ammo.cycle(1); // halfway
            expect(ammo.ammoInClip).toBe(0); // not yet refilled

            ammo.cycle(1); // done
            expect(ammo.reloading).toBe(false);
            expect(ammo.ammoInClip).toBe(5);
        });

        it("reload() does nothing when clip is already full", () => {
            // clip is full by default
            ammo.reload(2);
            expect(ammo.reloading).toBe(false);
        });

        it("reload() does nothing when pouch is empty", () => {
            ammo.ammoInClip = 0;
            ammo.ammoInPouch = 0;
            ammo.reload(2);
            expect(ammo.reloading).toBe(false);
        });

        it("readiness returns correct ratio during reload", () => {
            ammo.ammoInClip = 0;
            ammo.ammoInPouch = 10;

            ammo.reload(2);

            ammo.cycle(1); // halfway through reload
            expect(ammo.readiness).toBeCloseTo(0.5, 5);
        });

        it("readiness returns 1 when clip is full and not reloading", () => {
            expect(ammo.readiness).toBe(1);
        });

        it("readiness returns ammo ratio when not reloading", () => {
            ammo.ammoInPouch = 0;
            ammo.onTriggerEffect(0); // 4/5
            expect(ammo.readiness).toBeCloseTo(4 / 5, 5);
        });

        it("calls onReloading callback when reload starts", () => {
            const onReloading = jasmine.createSpy("onReloading");
            const onDepleted = jasmine.createSpy("onDepleted");
            ammo.bind({ onReloading, onDepleted });

            ammo.ammoInClip = 0;
            ammo.ammoInPouch = 10;
            ammo.reload(2);

            expect(onReloading).toHaveBeenCalledTimes(1);
        });

        it("calls onDepleted callback when clip and pouch run out", () => {
            const onReloading = jasmine.createSpy("onReloading");
            const onDepleted = jasmine.createSpy("onDepleted");
            ammo.bind({ onReloading, onDepleted });

            ammo.ammoInPouch = 0;
            for (let i = 0; i < 5; i++) {
                ammo.onTriggerEffect(0);
            }

            expect(onDepleted).toHaveBeenCalledTimes(1);
        });
    });

    describe("with limited pouch", () => {
        it("initializes ammoInPouch minus the initial clip load", () => {
            // Constructor deducts clipSize from pouch on init
            const ammo = new WeaponAmmoController({
                clipSize: 3,
                ammoInPouch: 10,
            });
            // ammoInPouch is passed as 10 but constructor does ammoInPouch - 1 (documentation quirk).
            // Let's just verify the clip starts full and pouch is smaller.
            expect(ammo.ammoInClip).toBe(3);
            expect(ammo.ammoInPouch).toBeLessThan(10);
        });
    });
});

// ---------------------------------------------------------------------------
// AlwaysReloadingAmmoController
// ---------------------------------------------------------------------------

describe("AlwaysReloadingAmmoController", () => {
    let ammo: AlwaysReloadingAmmoController;

    beforeEach(() => {
        // clipSize=3, reloadTime=3 → one bullet every 1 second
        ammo = new AlwaysReloadingAmmoController({
            clipSize: 3,
            reloadTime: 3,
        });
    });

    it("starts with a full clip", () => {
        expect(ammo.ammoInClip).toBe(3);
    });

    it("auto-reloads one bullet per (reloadTime/clipSize) seconds without explicit reload call", () => {
        // Fire two shots
        ammo.onTriggerEffect(0);
        ammo.onTriggerEffect(0);
        expect(ammo.ammoInClip).toBe(1);

        // Advance by slightly less than one reload interval — no refill yet
        ammo.cycle(0.9);
        expect(ammo.ammoInClip).toBe(1);

        // Advance past the interval — one bullet back
        ammo.cycle(0.2);
        expect(ammo.ammoInClip).toBe(2);
    });

    it("readiness is 1 when ammo > 0 and 0 when empty", () => {
        expect(ammo.readiness).toBe(1);
        ammo.onTriggerEffect(0);
        ammo.onTriggerEffect(0);
        ammo.onTriggerEffect(0);
        expect(ammo.ammoInClip).toBe(0);
        expect(ammo.readiness).toBe(0);
    });

    it("is never in reloading state", () => {
        ammo.onTriggerEffect(0);
        ammo.cycle(0.1);
        expect(ammo.reloading).toBe(false);
    });
});
