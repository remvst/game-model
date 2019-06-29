'use strict';

const Rx = require('rxjs');

const BaseObjectSet = require('./base-object-set');

module.exports = class WatchableObjectSet extends BaseObjectSet {

    constructor(wrappedSet) {
        super();
        this.wrappedSet = wrappedSet;

        this.additions = new Rx.Subject();
        this.removals = new Rx.Subject();
    }

    get size() {
        return this.wrappedSet.size;
    }

    add(object) {
        const added = this.wrappedSet.add(object);
        if (added) {
            this.additions.next(object);
        }
    }

    remove(object) {
        const removed = this.wrappedSet.remove(object);
        if (removed) {
            this.removals.next(object);
        }
    }

    removeByKey(key) {
        const object = this.wrappedSet.removeByKey(key);
        if (object) {
            this.removals.next(object);
        }
        return object;
    }

    getByKey(key) {
        return this.wrappedSet.getByKey(key);
    }

    hasKey(key) {
        return this.wrappedSet.hasKey(key);
    }

    forEach(fn) {
        return this.wrappedSet.forEach(fn);
    }

    map(fn) {
        return this.wrappedSet.map(fn);
    }

    forEachItemInBucket(bucketKey, fn) {
        return this.wrappedSet.forEachItemInBucket(bucketKey, fn);
    }

};
