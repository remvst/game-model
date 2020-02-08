'use strict';

const Entity = require('../index').Entity;
const Trait = require('../index').Trait;
const World = require('../index').World;
const WorldEvent = require('../index').WorldEvent;

describe('a world', () => {
    class TestTrait extends Trait {
        get key() {
            return 'testtrait';
        }
    }

    it('can fetch an entity after it\'s been added', () => {
        const entity = new Entity([new TestTrait()]);

        const world = new World();
        world.entities.add(entity);

        expect(world.entity(entity.id)).toBe(entity);
    });

    it('will cycle all its entities', () => {
        const entity = new Entity([new TestTrait()]);

        spyOn(entity, 'cycle');

        const world = new World();
        world.entities.add(entity);
        world.cycle(123);

        expect(entity.cycle).toHaveBeenCalledWith(123);
    });

    it('can add an event', () => {
        const world = new World();

        const event = new WorldEvent();
        spyOn(event, 'apply').and.callThrough();

        const eventSpy = jasmine.createSpy('eventSpy');
        world.events.subscribe(eventSpy);

        world.addEvent(event);

        expect(event.apply).toHaveBeenCalledWith(world);
        expect(eventSpy).toHaveBeenCalledWith(event);
    });
});
