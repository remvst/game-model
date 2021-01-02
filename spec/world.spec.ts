'use strict';

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

        const world = new World();
        world.entities.add(entity);

        spyOn(entity, 'unbind');
        world.entities.remove(entity);

        expect(entity.unbind).toHaveBeenCalled();
    });

    it('will cycle all its entities', () => {
        const entity = new Entity(undefined, [new TestTrait()]);

        spyOn(entity, 'cycle');

        const world = new World();
        world.entities.add(entity);
        world.cycle(123);

        expect(entity.cycle).toHaveBeenCalledWith(123);
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
