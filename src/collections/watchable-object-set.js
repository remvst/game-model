'use strict';

const Rx = require('rxjs/Rx');

const BucketedObjectSet = require('./bucketed-object-set');

class WatchableObjectSet extends BucketedObjectSet {

    constructor(wrappedSet) {
        super();
        this.wrappedSet = wrappedSet;

        this.additions = new Rx.Subject();
        this.deletions = new Rx.Subject();
    }

    add(object) {
        this.wrappedSet.add(object);
        this.additions.next(object);
    }

    remove(object) {
        this.wrappedSet.remove(object);
        this.deletions.next(object);
    }

    removeByKey(key) {
        const object = this.wrappedSet.removeByKey(key);
        if (object) {
            this.deletions.next(object);
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

}

module.exports = WatchableObjectSet;
