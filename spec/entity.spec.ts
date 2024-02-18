"use strict";

import {
    Entity,
    EntityEvent,
    EntityEventProcessed,
    Trait,
    World,
    vector3,
} from "../src/index";

describe("an entity", () => {
    class TestTrait extends Trait {
        static readonly key = "test";
        readonly key = TestTrait.key;
    }

    class OtherTestTrait extends Trait {
        static readonly key = "other";
        readonly key = OtherTestTrait.key;
    }

    class TraitWithParams extends Trait {
        static readonly key = "other";
        readonly key = OtherTestTrait.key;

        constructor(_: string, _1: number) {
            super();
        }
    }

    class TestEvent implements EntityEvent {}

    let idGenerator: (entity: Entity) => string;

    beforeEach(() => {
        idGenerator = Entity.idGenerator;
    });

    afterEach(() => {
        Entity.idGenerator = idGenerator;
    });

    it("can be initialized with no traits", () => {
        const entity = new Entity(undefined, []);

        expect(entity.x).toBe(0);
        expect(entity.y).toBe(0);
        expect(entity.age).toBe(0);
        expect(entity.world).toBe(null);
        expect(entity.traits.size).toBe(0);
    });

    it("can be initialized with an ID", () => {
        const entity = new Entity("myid", []);

        expect(entity.id).toBe("myid");
    });

    it("can be initialized with no ID", () => {
        Entity.idGenerator = jasmine.createSpy().and.returnValue("zeecoolid");
        const entity = new Entity(undefined, []);
        expect(entity.id).toBe("zeecoolid");
    });

    it("updates its age on cycle", () => {
        const entity = new Entity(undefined, []);

        entity.cycle(123);
        expect(entity.age).toBe(123);
    });

    it("updates its cycle start and end positions", () => {
        const entity = new Entity(undefined, []);
        entity.position.x = 1;
        entity.position.y = 2;
        entity.position.z = 3;
        entity.preCycle();

        entity.position.x = 4;
        entity.position.y = 7;
        entity.position.z = 9;
        entity.postCycle();

        expect(entity.cycleVelocity).toEqual(vector3(3, 5, 6));
    });

    it("calls bind() then postBind() on all traits", () => {
        const testTrait = new TestTrait();
        spyOn(testTrait, "bind");
        spyOn(testTrait, "postBind");

        const entity = new Entity(undefined, [testTrait]);
        entity.bind({} as World);

        expect(testTrait.bind).toHaveBeenCalled();
        expect(testTrait.postBind).toHaveBeenCalled();
    });

    it("calls maybeCycle() on all traits", () => {
        const testTrait = new TestTrait();
        spyOn(testTrait, "maybeCycle").and.callThrough();

        const entity = new Entity(undefined, [testTrait]);
        entity.cycle(123);

        expect(testTrait.maybeCycle).toHaveBeenCalledWith(123);
    });

    it("can be bound to a world", () => {
        const world = new World();
        const entity = new Entity(undefined, []);
        entity.bind(world);

        expect(entity.world).toBe(world);
    });

    it("can be unbound from its world", () => {
        const world = new World();
        const entity = new Entity(undefined, []);
        entity.bind(world);
        entity.unbind();

        expect(entity.world).toBe(null);
    });

    it("can be removed from the world", () => {
        const world = new World();

        const entity = new Entity(undefined, []);
        world.entities.add(entity);

        entity.remove();

        expect(world.entities.size).toBe(0);
    });

    it("does not throw if removed from a world before being added", () => {
        const entity = new Entity(undefined, []);
        expect(() => entity.remove()).not.toThrow();
    });

    it("can fetch a trait", () => {
        const testTrait = new TestTrait();
        const entity = new Entity(undefined, [testTrait]);
        expect(entity.trait("test")).toBe(testTrait);
    });

    it("can fetch a trait of a type", () => {
        const testTrait = new TestTrait();
        const otherTestTrait = new OtherTestTrait();
        const entity = new Entity(undefined, [testTrait, otherTestTrait]);
        expect(entity.traitOfType(TestTrait)).toBe(testTrait);
        expect(entity.traitOfType(OtherTestTrait)).toBe(otherTestTrait);
    });

    it("can fetch a trait of a type with params", () => {
        const traitWithParams = new TraitWithParams("", 2);
        const entity = new Entity(undefined, [traitWithParams]);
        expect(entity.traitOfType(TraitWithParams)).toBe(traitWithParams);
    });

    it("can fail to fetch a trait of a type", () => {
        const testTrait = new TestTrait();
        const entity = new Entity(undefined, [testTrait]);
        expect(entity.traitOfType(OtherTestTrait)).toBe(null);
    });

    it("can process a local event", () => {
        const testTrait = new TestTrait();
        spyOn(testTrait, "processEvent");

        const entity = new Entity(undefined, [testTrait]);
        const event = new TestEvent();

        const world = new World();
        world.entities.add(entity);

        entity.addEvent(event);

        expect(testTrait.processEvent).toHaveBeenCalledWith(event, world);
    });

    it("can process a local event and notify the world about it", () => {
        const testTrait = new TestTrait();
        spyOn(testTrait, "processEvent");

        const entity = new Entity(undefined, [testTrait]);
        const entityEvent = new TestEvent();

        const world = new World();
        world.entities.add(entity);
        spyOn(world, "addEvent")
            .withArgs(jasmine.any(EntityEventProcessed))
            .and.callFake((event) => {
                expect((event as EntityEventProcessed).event).toBe(entityEvent);
            });

        entity.addEvent(entityEvent);

        expect(world.addEvent).toHaveBeenCalled();
    });
});
