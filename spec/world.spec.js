'use strict';

const Entity = require('../src/entity');
const Trait = require('../src/trait');
const World = require('../src/world');
const WorldEvent = require('../src/world-event');

describe('a world', () => {
    class TestTrait extends Trait {
        get key() {
            return 'testtrait';
        }
    }

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
