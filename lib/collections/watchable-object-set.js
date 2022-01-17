'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const rxjs_1 = require("rxjs");
class WatchableObjectSet {
    constructor(wrappedSet) {
        this.wrappedSet = wrappedSet;
        this.additions = new rxjs_1.Subject();
        this.removals = new rxjs_1.Subject();
    }
    get size() {
        return this.wrappedSet.size;
    }
    items() {
        return this.wrappedSet.items();
    }
    bucketSize(bucketKey) {
        return this.wrappedSet.bucketSize(bucketKey);
    }
    add(object) {
        const added = this.wrappedSet.add(object);
        if (added) {
            this.additions.next(object);
        }
        return added;
    }
    remove(object) {
        const removed = this.wrappedSet.remove(object);
        if (removed) {
            this.removals.next(object);
        }
        return removed;
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
    bucket(bucketKey) {
        return this.wrappedSet.bucket(bucketKey);
    }
}
exports.default = WatchableObjectSet;
;
