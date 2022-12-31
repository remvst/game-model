'use strict';

import EntityRemoved from '../src/events/entity-removed';
import { Entity, Trait, World, WorldEvent } from '../src/index';

describe('a world', () => {
    class TestTrait extends Trait {
        static readonly key = 'test';
        readonly key = TestTrait.key;
    }

    class TestEvent implements WorldEvent {
        apply(_: World) {}
    }

    it('can fetch an entity after it\'s been added', () => {
        const entity = new Entity(undefined, [new TestTrait()]);

        const world = new World();
        world.entities.add(entity);

        expect(world.entity(entity.id)).toBe(entity);
    });

    it('can cycle traits', () => {
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

    it('can remove an entity after it\'s been added', () => {
        const entity = new Entity(undefined, [new TestTrait()]);
        spyOn(entity, 'addEvent').withArgs(jasmine.any(EntityRemoved)).and.callThrough();

        const world = new World();
        world.entities.add(entity);

        spyOn(entity, 'unbind');
        world.entities.remove(entity);

        expect(entity.addEvent).toHaveBeenCalled();
        expect(entity.unbind).toHaveBeenCalled();
    });

    it('will cycle all its entities', () => {
        const entity = new Entity(undefined, [new TestTrait()]);

        spyOn(entity, 'preCycle');
        spyOn(entity, 'cycle');
        spyOn(entity, 'postCycle');

        const world = new World();
        world.entities.add(entity);
        world.cycle(123);

        expect(entity.preCycle).toHaveBeenCalledWith();
        expect(entity.cycle).toHaveBeenCalledWith(123);
        expect(entity.postCycle).toHaveBeenCalledWith();
    });

    it('will only cycle relevant entities', () => {
        const relevantEntity = new Entity(undefined, []);
        spyOn(relevantEntity, 'preCycle');
        spyOn(relevantEntity, 'cycle');
        spyOn(relevantEntity, 'postCycle');

        const irrelevantEntity = new Entity(undefined, []);
        spyOn(irrelevantEntity, 'preCycle');
        spyOn(irrelevantEntity, 'cycle');
        spyOn(irrelevantEntity, 'postCycle');

        const world = new World();
        world.entityRelevanceProvider = (entity) => {
            return entity === relevantEntity;
        };
        world.entities.add(relevantEntity);
        world.entities.add(irrelevantEntity);
        world.cycle(123);

        expect(relevantEntity.preCycle).toHaveBeenCalledWith();
        expect(relevantEntity.cycle).toHaveBeenCalledWith(123);
        expect(relevantEntity.postCycle).toHaveBeenCalledWith();

        expect(irrelevantEntity.preCycle).toHaveBeenCalledWith();
        expect(irrelevantEntity.cycle).not.toHaveBeenCalled();
        expect(irrelevantEntity.postCycle).not.toHaveBeenCalled();
    });

    it('can add an event', () => {
        const world = new World();

        const event = new TestEvent();
        spyOn(event, 'apply').and.callThrough();

        const eventSpy = jasmine.createSpy('eventSpy');
        world.events.subscribe(eventSpy);

        world.addEvent(event);

        expect(event.apply).toHaveBeenCalledWith(world);
        expect(eventSpy).toHaveBeenCalledWith(event);
    });
});
