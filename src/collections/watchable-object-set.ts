'use strict';

import { Subject } from 'rxjs';

import { BaseObjectSet } from './base-object-set';

export default class WatchableObjectSet<ObjectType> implements BaseObjectSet<ObjectType> {

    private wrappedSet: BaseObjectSet<ObjectType>;

    additions: Subject<ObjectType>;
    removals: Subject<ObjectType>;

    constructor(wrappedSet: BaseObjectSet<ObjectType>) {
        this.wrappedSet = wrappedSet;

        this.additions = new Subject();
        this.removals = new Subject();
    }

    get size() {
        return this.wrappedSet.size;
    }

    add(object: ObjectType): boolean {
        const added = this.wrappedSet.add(object);
        if (added) {
            this.additions.next(object);
        }
        return added;
    }

    remove(object: ObjectType): ObjectType | null {
        const removed = this.wrappedSet.remove(object);
        if (removed) {
            this.removals.next(object);
        }
        return removed;
    }

    removeByKey(key: string): ObjectType | null {
        const object = this.wrappedSet.removeByKey(key);
        if (object) {
            this.removals.next(object);
        }
        return object;
    }

    getByKey(key: string): ObjectType | null {
        return this.wrappedSet.getByKey(key);
    }

    hasKey(key: string): boolean {
        return this.wrappedSet.hasKey(key);
    }

    forEach(fn: (item: ObjectType) => boolean | undefined) {
        return this.wrappedSet.forEach(fn);
    }

    map<MappedType>(fn: (item: ObjectType) => MappedType) {
        return this.wrappedSet.map(fn);
    }

    forEachItemInBucket(bucketKey: string, fn: (item: ObjectType) => boolean | undefined) {
        return this.wrappedSet.forEachItemInBucket(bucketKey, fn);
    }

};
