'use strict';

const Entity = require('../src/entity');

const Trait = require('../src/traits/trait');
const World = require('../src/world');

describe('an entity', () => {

    it('can be initialized with no traits', () => {
        const entity = new Entity([]);

        expect(entity.traits.size).toBe(1);
        expect(entity.traits.map(trait => trait)[0].key).toBe('aging');
    });

    it('calls bind() then postBind() on all traits', () => {
        const testTrait = new Trait();
        spyOn(testTrait, 'bind');
        spyOn(testTrait, 'postBind');
        spyOnProperty(testTrait, 'key').and.returnValue('zeetest');

        new Entity([testTrait]);

        expect(testTrait.bind).toHaveBeenCalled();
        expect(testTrait.postBind).toHaveBeenCalled();
    });

    it('calls maybeCycle() on all traits', () => {
        const testTrait = new Trait();
        spyOnProperty(testTrait, 'key').and.returnValue('zeetest');
        spyOn(testTrait, 'maybeCycle');

        const entity = new Entity([testTrait]);
        entity.cycle(123);

        expect(testTrait.maybeCycle).toHaveBeenCalledWith(123);
    });

    it('can be bound to a world', () => {
        const world = new World();
        const entity = new Entity([]);
        entity.bind(world);

        expect(entity.world).toBe(world);
    });

    it('can be removed from the world', () => {
        const world = new World();

        const entity = new Entity([]);
        world.entities.add(entity);

        entity.remove();

        expect(world.entities.size).toBe(0);
    });
});
