'use strict';

const Entity = require('../index').Entity;
const Trait = require('../index').Trait;
const World = require('../index').World;

describe('an entity', () => {

    it('can be initialized with no traits', () => {
        const entity = new Entity([]);

        expect(entity.x).toBe(0);
        expect(entity.y).toBe(0);
        expect(entity.age).toBe(0);
        expect(entity.world).toBe(null);
        expect(entity.traits.size).toBe(0);
    });

    it('can be initialized with an ID', () => {
        const entity = new Entity('myid', []);

        expect(entity.id).toBe('myid');
    });

    it('updates its age on cycle', () => {
        const entity = new Entity([]);

        entity.cycle(123);
        expect(entity.age).toBe(123);
    });

    it('updates its age on cycle with the correct time factor', () => {
        const entity = new Entity([]);

        entity.timeFactor = 0.1;
        entity.cycle(123);
        expect(entity.age).toBe(12.3);
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
        spyOn(testTrait, 'maybeCycle').and.callThrough();

        const entity = new Entity([testTrait]);
        entity.cycle(123);

        expect(testTrait.maybeCycle).toHaveBeenCalledWith(123);
    });

    it('calls maybeCycle() on all traits with the right time factor', () => {
        const testTrait = new Trait();
        spyOnProperty(testTrait, 'key').and.returnValue('zeetest');
        spyOn(testTrait, 'maybeCycle').and.callThrough();

        const entity = new Entity([testTrait]);
        entity.timeFactor = 0.1;
        entity.cycle(100);

        expect(testTrait.maybeCycle).toHaveBeenCalledWith(10);
    });

    it('can be bound to a world', () => {
        const world = new World();
        const entity = new Entity([]);
        entity.bind(world);

        expect(entity.world).toBe(world);
    });

    it('can be unbound from its world', () => {
        const world = new World();
        const entity = new Entity([]);
        entity.bind(world);
        entity.unbind(world);

        expect(entity.world).toBe(null);
    });

    it('can be removed from the world', () => {
        const world = new World();

        const entity = new Entity([]);
        world.entities.add(entity);

        entity.remove();

        expect(world.entities.size).toBe(0);
    });

    it('does not throw if removed from a world before being added', () => {
        const entity = new Entity([]);
        expect(() => entity.remove()).not.toThrow();
    });

    it('can fetch a trait', () => {
        const testTrait = new Trait();
        spyOnProperty(testTrait, 'key').and.returnValue('foo');

        const entity = new Entity([testTrait]);

        expect(entity.trait('foo')).toBe(testTrait);
    });
});
