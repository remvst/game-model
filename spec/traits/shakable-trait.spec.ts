import { entity, Entity } from "../../src/entity";
import { ShakableTrait } from "../../src/traits/shakable-trait";
import { World } from "../../src/world";

describe("shakable trait", () => {
    let world: World;
    let subject: Entity;
    let shakable: ShakableTrait;

    beforeEach(() => {
        world = new World();
        shakable = new ShakableTrait();
        subject = entity([shakable]);
        world.entities.add(subject);
    });

    it("does not move the entity when not shaking", () => {
        world.cycle(1);
        expect(subject.position.x).toBe(0);
        expect(subject.position.y).toBe(0);
    });

    it("displaces the entity while shaking", () => {
        shakable.shake(10, 1);
        shakable.props.interval = 0; // update every cycle

        spyOn(Math, "random").and.returnValue(1); // always max displacement

        world.cycle(0.1);

        expect(subject.position.x).toBeGreaterThan(0);
        expect(subject.position.y).toBeGreaterThan(0);
    });

    it("resets displacement to zero when duration expires", () => {
        shakable.shake(10, 0.5);
        shakable.props.interval = 0;

        world.cycle(0.6); // duration expires

        expect(subject.position.x).toBe(0);
        expect(subject.position.y).toBe(0);
    });

    it("shake keeps the higher power when called multiple times", () => {
        shakable.shake(5, 1);
        shakable.shake(10, 1);
        expect(shakable.props.power).toBe(10);

        shakable.shake(3, 1);
        expect(shakable.props.power).toBe(10);
    });

    it("shake keeps the longer duration when called multiple times", () => {
        shakable.shake(1, 2);
        shakable.shake(1, 5);
        expect(shakable.props.duration).toBe(5);

        shakable.shake(1, 1);
        expect(shakable.props.duration).toBe(5);
    });

    it("respects the interval between shake updates", () => {
        shakable.shake(10, 10);
        shakable.props.interval = 1;
        shakable.props.nextUpdate = 0;

        spyOn(Math, "random").and.returnValue(1);

        world.cycle(0.5); // nextUpdate → -0.5 < 0 → update fires, position displaced
        const posAfterFirst = subject.position.x;
        expect(posAfterFirst).toBeGreaterThan(0);

        world.cycle(0.3); // nextUpdate = 1 - 0.3 = 0.7 ≥ 0 → no update, offset resets to 0, position unchanged
        expect(subject.position.x).toBe(posAfterFirst);

        world.cycle(0.8); // nextUpdate = 0.7 - 0.8 = -0.1 < 0 → update fires again, position increases
        expect(subject.position.x).toBeGreaterThan(posAfterFirst);
    });
});
