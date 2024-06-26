"use strict";

import { Subject } from "rxjs";

import { BaseObjectSet } from "./base-object-set";

export class WatchableObjectSet<ObjectType>
    implements BaseObjectSet<ObjectType>
{
    private wrappedSet: BaseObjectSet<ObjectType>;

    additions: Subject<ObjectType>;
    removals: Subject<ObjectType>;
    allowAddition: (entity: ObjectType) => boolean = () => true;

    constructor(wrappedSet: BaseObjectSet<ObjectType>) {
        this.wrappedSet = wrappedSet;

        this.additions = new Subject();
        this.removals = new Subject();
    }

    get size() {
        return this.wrappedSet.size;
    }

    items(): Iterable<ObjectType> {
        return this.wrappedSet.items();
    }

    bucketSize(bucketKey: string): number {
        return this.wrappedSet.bucketSize(bucketKey);
    }

    forceAdd(object: ObjectType): boolean {
        const added = this.wrappedSet.add(object);
        if (added) {
            this.additions.next(object);
        }
        return added;
    }

    add(object: ObjectType): boolean {
        if (!this.allowAddition(object)) {
            return false;
        }

        return this.forceAdd(object);
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

    forEach(fn: (item: ObjectType) => boolean | void) {
        return this.wrappedSet.forEach(fn);
    }

    bucket(bucketKey: string): Iterable<ObjectType> {
        return this.wrappedSet.bucket(bucketKey);
    }
}
