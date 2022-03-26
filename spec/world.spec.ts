'use strict';

import EntityRemoved from '../src/events/entity-removed';
import { Entity, Trait, World, WorldEvent } from '../src/index';

describe('a world', () => {
    class TestTrait extends Trait {
        key: string = 'test';
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
