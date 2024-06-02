import { copyVec2, distance } from "@remvst/geometry";
import Entity from "../../src/entity";
import ScriptTrait from "../../src/traits/script-trait";
import SmoothTargetFollowingTrait from "../../src/traits/smooth-target-following-trait";
import World from "../../src/world";

describe("smooth target following trait", () => {
    let world: World;
    let target: Entity;

    beforeEach(() => {
        world = new World();

        target = new Entity(undefined, [new ScriptTrait()]);
        world.entities.add(target);
    });

    it("will do nothing if it has no target", () => {
        const follower = new Entity(undefined, [
            new SmoothTargetFollowingTrait(),
        ]);
        world.entities.add(follower);

        world.cycle(1);

        expect(follower.position.x).toBe(0);
        expect(follower.position.y).toBe(0);
    });

    it("can follow a target ID", () => {
        const follower = new Entity(undefined, [
            new SmoothTargetFollowingTrait(),
        ]);
        follower.traitOfType(SmoothTargetFollowingTrait)!.targetEntityIds = [
            target.id,
        ];
        world.entities.add(follower);

        target.position.x = 200;
        target.position.y = 400;

        world.cycle(1);

        expect(follower.position.x).toBe(target.position.x);
        expect(follower.position.y).toBe(target.position.y);
    });

    it("can follow a target trait", () => {
        const follower = new Entity(undefined, [
            new SmoothTargetFollowingTrait(),
        ]);
        follower.traitOfType(SmoothTargetFollowingTrait)!.targetTraitKeys = [
            ScriptTrait.key,
        ];
        world.entities.add(follower);

        target.position.x = 200;
        target.position.y = 400;

        world.cycle(1);

        expect(follower.position.x).toBe(target.position.x);
        expect(follower.position.y).toBe(target.position.y);
    });

    it("can follow a target ID with an offset", () => {
        const follower = new Entity(undefined, [
            new SmoothTargetFollowingTrait(),
        ]);
        follower
            .traitOfType(SmoothTargetFollowingTrait)!
            .targetEntityIds.push(target.id);
        follower.traitOfType(SmoothTargetFollowingTrait)!.offset.x = 10;
        follower.traitOfType(SmoothTargetFollowingTrait)!.offset.y = 5;
        world.entities.add(follower);

        target.position.x = 200;
        target.position.y = 400;

        world.cycle(1);

        expect(follower.position.x).toBe(target.position.x + 10);
        expect(follower.position.y).toBe(target.position.y + 5);
    });

    it("can have a max speed", () => {
        const follower = new Entity(undefined, [
            new SmoothTargetFollowingTrait(),
        ]);
        follower.traitOfType(SmoothTargetFollowingTrait)!.targetEntityIds = [
            target.id,
        ];
        follower.traitOfType(SmoothTargetFollowingTrait)!.maxSpeed = 100;
        world.entities.add(follower);

        target.position.x = 200;
        target.position.y = 0;

        world.cycle(1);

        expect(follower.position.x).toBe(100);
        expect(follower.position.y).toBe(0);
    });

    it("will follow its target smoothly", () => {
        const follower = new Entity(undefined, [
            new SmoothTargetFollowingTrait(),
        ]);
        follower.traitOfType(SmoothTargetFollowingTrait)!.targetEntityIds = [
            target.id,
        ];
        world.entities.add(follower);

        target.position.x = 200;
        target.position.y = 400;

        let previousDistance = Number.MAX_SAFE_INTEGER;

        for (let i = 0; i < 60; i++) {
            const previousPosition = copyVec2(follower.position);
            world.cycle(1 / 60);

            const dist = distance(previousPosition, follower.position);
            expect(dist).toBeLessThan(previousDistance);

            previousDistance = dist;
        }
    });

    it("can follow its target even after it's gone", () => {
        const follower = new Entity(undefined, [
            new SmoothTargetFollowingTrait(),
        ]);
        follower.traitOfType(SmoothTargetFollowingTrait)!.targetEntityIds = [
            target.id,
        ];
        follower.traitOfType(
            SmoothTargetFollowingTrait,
        )!.reachTargetLastPosition = true;
        world.entities.add(follower);

        target.position.x = 200;
        target.position.y = 400;

        world.cycle(1 / 60);

        expect(follower.position.x).not.toBe(target.position.x);
        expect(follower.position.y).not.toBe(target.position.y);

        target.remove();
        world.cycle(1);

        expect(follower.position.x).toBe(target.position.x);
        expect(follower.position.y).toBe(target.position.y);
    });

    it("will stop following its target by default after it's gone", () => {
        const follower = new Entity(undefined, [
            new SmoothTargetFollowingTrait(),
        ]);
        follower.traitOfType(SmoothTargetFollowingTrait)!.targetEntityIds = [
            target.id,
        ];
        world.entities.add(follower);

        target.position.x = 200;
        target.position.y = 400;

        world.cycle(1 / 60);

        const previousPosition = copyVec2(follower.position);
        expect(follower.position.x).not.toBe(target.position.x);
        expect(follower.position.y).not.toBe(target.position.y);

        target.remove();
        world.cycle(1);

        expect(follower.position.x).toBe(previousPosition.x);
        expect(follower.position.y).toBe(previousPosition.y);
    });
});
