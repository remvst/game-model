import Entity from "../src/entity";
import EntityRemoved from "../src/events/entity-removed";
import { WorldEvent } from "../src/events/world-event";
import Trait from "../src/trait";
import World from "../src/world";

describe("a world", () => {
    class TestTrait extends Trait {
        static readonly key = "test";
        readonly key = TestTrait.key;
    }

    class TestEvent implements WorldEvent {
        apply(_: World) {}
    }

    it("can fetch an entity after it's been added", () => {
        const entity = new Entity(undefined, [new TestTrait()]);

        const world = new World();
        world.entities.add(entity);

        expect(world.entity(entity.id)).toBe(entity);
    });

    it("can cycle traits", () => {
        const entity1 = new Entity(undefined, [new TestTrait()]);
        const entity2 = new Entity(undefined, [new TestTrait()]);
        const entity3 = new Entity(undefined, []);

        const world = new World();
        world.entities.add(entity1);
        world.entities.add(entity2);
        world.entities.add(entity3);

        expect(Array.from(world.traitsOfType(TestTrait))).toEqual([
            entity1.traitOfType(TestTrait)!,
            entity2.traitOfType(TestTrait)!,
        ]);
    });

    it("can remove an entity after it's been added", () => {
        const entity = new Entity(undefined, [new TestTrait()]);
        spyOn(entity, "addEvent")
            .withArgs(jasmine.any(EntityRemoved))
            .and.callThrough();

        const world = new World();
        world.entities.add(entity);

        spyOn(entity, "unbind");
        world.entities.remove(entity);

        expect(entity.addEvent).toHaveBeenCalled();
        expect(entity.unbind).toHaveBeenCalled();
    });

    it("will cycle all its entities", () => {
        const entity = new Entity(undefined, [new TestTrait()]);

        spyOn(entity, "preCycle");
        spyOn(entity, "cycle");
        spyOn(entity, "postCycle");

        const world = new World();
        world.entities.add(entity);
        world.cycle(123);

        expect(entity.preCycle).toHaveBeenCalledWith();
        expect(entity.cycle).toHaveBeenCalledWith(123);
        expect(entity.postCycle).toHaveBeenCalledWith();
    });

    it("will only cycle entities that aren't disabled", () => {
        const relevantEntity = new Entity(undefined, []);
        spyOn(relevantEntity, "preCycle");
        spyOn(relevantEntity, "cycle");
        spyOn(relevantEntity, "postCycle");

        const irrelevantEntity = new Entity(undefined, []);
        irrelevantEntity.position.x += 100;
        spyOn(irrelevantEntity, "preCycle");
        spyOn(irrelevantEntity, "cycle");
        spyOn(irrelevantEntity, "postCycle");

        const world = new World();
        world.entities.add(relevantEntity);
        world.entities.add(irrelevantEntity);

        world.isEntityEnabled = (entity) => entity === relevantEntity;

        world.cycle(123);

        expect(relevantEntity.preCycle).toHaveBeenCalledWith();
        expect(relevantEntity.cycle).toHaveBeenCalledWith(123);
        expect(relevantEntity.postCycle).toHaveBeenCalledWith();

        expect(irrelevantEntity.preCycle).toHaveBeenCalledWith();
        expect(irrelevantEntity.cycle).not.toHaveBeenCalled();
        expect(irrelevantEntity.postCycle).not.toHaveBeenCalled();
    });

    it("will only cycle entities in the current chunk", () => {
        const relevantEntity = new Entity(undefined, []);
        spyOn(relevantEntity, "preCycle");
        spyOn(relevantEntity, "cycle");
        spyOn(relevantEntity, "postCycle");

        const irrelevantEntity = new Entity(undefined, []);
        irrelevantEntity.position.x += 100;
        spyOn(irrelevantEntity, "preCycle");
        spyOn(irrelevantEntity, "cycle");
        spyOn(irrelevantEntity, "postCycle");

        const world = new World();
        world.entities.add(relevantEntity);
        world.entities.add(irrelevantEntity);

        world.chunked.visibleRectangleProvider = (visible, relevant) => {
            visible.centerAround(
                relevantEntity.position.x,
                relevantEntity.position.y,
                10,
                10,
            );
            relevant.centerAround(
                relevantEntity.position.x,
                relevantEntity.position.y,
                10,
                10,
            );
        };

        world.cycle(123);

        expect(relevantEntity.preCycle).toHaveBeenCalledWith();
        expect(relevantEntity.cycle).toHaveBeenCalledWith(123);
        expect(relevantEntity.postCycle).toHaveBeenCalledWith();

        expect(irrelevantEntity.preCycle).toHaveBeenCalledWith();
        expect(irrelevantEntity.cycle).not.toHaveBeenCalled();
        expect(irrelevantEntity.postCycle).not.toHaveBeenCalled();
    });

    it("can add an event", () => {
        const world = new World();

        const event = new TestEvent();
        spyOn(event, "apply").and.callThrough();

        const eventSpy = jasmine.createSpy("eventSpy");
        world.events.subscribe(eventSpy);

        world.addEvent(event);

        expect(event.apply).toHaveBeenCalledWith(world);
        expect(eventSpy).toHaveBeenCalledWith(event);
    });
});
