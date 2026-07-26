import { entity, Entity } from "../../src/entity";
import { Trait } from "../../src/trait";
import {
    PeriodicallyEnableTrait,
    TraitEnabledChange,
} from "../../src/traits/periodically-enable-trait";
import { World } from "../../src/world";

describe("periodically enable trait", () => {
    class TargetTrait extends Trait {
        static readonly key = "target";
        readonly key = TargetTrait.key;
    }

    let world: World;
    let subject: Entity;
    let periodicallyEnable: PeriodicallyEnableTrait;
    let target: TargetTrait;

    beforeEach(() => {
        world = new World();

        periodicallyEnable = new PeriodicallyEnableTrait({
            enabledTraitKey: TargetTrait.key,
            enabledDuration: 2,
            disabledDuration: 3,
        });

        target = new TargetTrait();

        subject = entity([periodicallyEnable, target]);
        world.entities.add(subject);
    });

    it("enables the target trait at the start of the enabled phase", () => {
        target.enabled = false;

        world.cycle(0.5); // age=0.5, 0.5 % 5 = 0.5 < 2 → enable
        expect(target.enabled).toBeTrue();
    });

    it("disables the target trait during the disabled phase", () => {
        target.enabled = true;

        world.cycle(2.5); // age=2.5, 2.5 % 5 = 2.5 >= 2 → disable
        expect(target.enabled).toBeFalse();
    });

    it("re-enables the target trait when the cycle wraps", () => {
        world.cycle(2.5); // age=2.5 → disabled
        world.cycle(2.5); // age=5.0, 5.0 % 5 = 0 < 2 → enabled
        expect(target.enabled).toBeTrue();
    });

    it("fires TraitEnabledChange when enabling", () => {
        target.enabled = false;
        const eventSpy = jasmine.createSpy("eventSpy");
        subject.onEvent(TraitEnabledChange, eventSpy);

        world.cycle(0.5); // triggers enable

        expect(eventSpy).toHaveBeenCalledOnceWith(
            new TraitEnabledChange(TargetTrait.key, true),
            world,
        );
    });

    it("fires TraitEnabledChange when disabling", () => {
        target.enabled = true;
        const eventSpy = jasmine.createSpy("eventSpy");
        subject.onEvent(TraitEnabledChange, eventSpy);

        world.cycle(2.5); // triggers disable

        expect(eventSpy).toHaveBeenCalledOnceWith(
            new TraitEnabledChange(TargetTrait.key, false),
            world,
        );
    });

    it("does not fire TraitEnabledChange when state is unchanged", () => {
        target.enabled = true;
        const eventSpy = jasmine.createSpy("eventSpy");
        subject.onEvent(TraitEnabledChange, eventSpy);

        world.cycle(0.5); // still enabled, no change
        world.cycle(0.5); // still enabled, no change

        expect(eventSpy).not.toHaveBeenCalled();
    });

    it("does nothing when the target trait key does not exist", () => {
        periodicallyEnable.props.enabledTraitKey = "nonexistent";
        expect(() => world.cycle(1)).not.toThrow();
    });

    it("respects the offset", () => {
        periodicallyEnable.props.offset = 2; // shift by 2 → at age 0: (0+2)%5=2 >= 2 → disabled

        target.enabled = true;
        world.cycle(0.5); // age=0.5, (0.5+2)%5=2.5 >= 2 → disable
        expect(target.enabled).toBeFalse();
    });
});
