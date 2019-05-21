'use strict';

const ObjectSet = require('../../src/collections/object-set');

describe('a keyed object set', () => {
    const obj1 = {'key': 123, 'value': 2};
    const obj2 = {'key': 456, 'value': 3};
    const obj3 = {'key': 789, 'value': 4};

    let objectSet;

    beforeEach(() => {
        objectSet = new ObjectSet(obj => obj.key);
    });

    it('has the right initial size', () => {
        expect(objectSet.size).toBe(0);
    });

    it('can add an object', () => {
        expect(() => objectSet.add(obj1)).not.toThrow();
        expect(objectSet.size).toBe(1);
    });

    it('can fetch an object after adding it', () => {
        expect(objectSet.hasKey(123)).toBe(false);
        objectSet.add(obj1);

        expect(objectSet.hasKey(123)).toBe(true);
        expect(objectSet.getByKey(123)).toBe(obj1);
    });

    it('can remove an object', () => {
        expect(objectSet.hasKey(123)).toBe(false);
        objectSet.add(obj1);
        objectSet.add(obj1);

        expect(objectSet.hasKey(123)).toBe(true);
        expect(objectSet.getByKey(123)).toBe(obj1);

        objectSet.remove(obj1);

        expect(objectSet.hasKey(123)).toBe(false);
        expect(objectSet.getByKey(123)).toBe(null);
    });

    it('can remove an object by key', () => {
        expect(objectSet.hasKey(123)).toBe(false);
        objectSet.add(obj1);
        objectSet.add(obj1);

        expect(objectSet.hasKey(123)).toBe(true);
        expect(objectSet.getByKey(123)).toBe(obj1);

        objectSet.removeByKey(123);

        expect(objectSet.hasKey(123)).toBe(false);
        expect(objectSet.getByKey(123)).toBe(null);
    });

    it('can remove a non-existing object', () => {
        expect(() => objectSet.remove(obj1)).not.toThrow();
    });

    it('can remove a non-existing key', () => {
        expect(() => objectSet.removeByKey(123)).not.toThrow();
    });

    it('cannot add null-ish values', () => {
        expect(() => objectSet.add(0)).not.toThrow();
        expect(() => objectSet.add(null)).not.toThrow();
        expect(() => objectSet.add(undefined)).not.toThrow();
        expect(objectSet.size).toBe(0);
    });

    it('can map all of its objects', () => {
        objectSet.add(obj1);
        objectSet.add(obj2);

        const mapped = objectSet.map(obj => obj.value);
        expect(mapped).toEqual([2, 3]);
    });

    it('can run a function on all of its objects', () => {
        objectSet.add(obj1);
        objectSet.add(obj2);

        const spy = jasmine.createSpy();

        objectSet.forEach(spy);

        expect(spy).toHaveBeenCalledWith(obj1);
        expect(spy).toHaveBeenCalledWith(obj2);
    });

    it('can run a function on all of its objects and stop on the first true', () => {
        objectSet.add(obj1);
        objectSet.add(obj2);
        objectSet.add(obj3);

        const spy = jasmine.createSpy().and.callFake(obj => obj.value === 3);

        objectSet.forEach(spy);

        expect(spy).toHaveBeenCalledWith(obj1);
        expect(spy).toHaveBeenCalledWith(obj2);
        expect(spy).not.toHaveBeenCalledWith(obj3);
    });
});
