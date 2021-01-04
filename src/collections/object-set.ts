'use strict';

import { BaseObjectSet } from './base-object-set';

export default class ObjectSet<ObjectType> implements BaseObjectSet<ObjectType> {

    private getKey: (item: ObjectType) => string;
    private getBuckets: ((item: ObjectType) => string[]) | undefined;

    private list: ObjectType[];
    private objectMap: Map<string, ObjectType>;
    private bucketMap: Map<string, ObjectType[]>;

    constructor(
        getKey: (item: ObjectType) => string,
        getBuckets: ((item: ObjectType) => string[]) | undefined = undefined
    ) {
        this.getKey = getKey;
        this.getBuckets = getBuckets;
        this.list = [];
        this.objectMap = new Map();
        this.bucketMap = new Map();
    }

    get size(): number {
        return this.list.length;
    }

    bucketSize(bucketKey: string): number {
        const bucket = this.bucketMap.get(bucketKey);
        if (!bucket) {
            return 0;
        }

        return bucket.length;
    }

    add(object: ObjectType): boolean {
        const key = this.getKey(object);
        if (this.objectMap.has(key)) {
            return false;
        }

        this.list.push(object);
        this.objectMap.set(key, object);

        if (this.getBuckets) {
            this.getBuckets(object).forEach(bucketKey => {
                let bucket = this.bucketMap.get(bucketKey);
                if (!bucket) {
                    bucket = [];
                    this.bucketMap.set(bucketKey, bucket);
                }

                bucket.push(object);
            });
        }

        return true;
    }

    remove(object: ObjectType): ObjectType | null {
        const key = this.getKey(object);
        if (!this.objectMap.has(key)) {
            return null;
        }

        const index = this.list.indexOf(object);
        if (index >= 0) {
            this.list.splice(index, 1);
        }

        this.objectMap.delete(key);

        if (this.getBuckets) {
            this.getBuckets(object).forEach(bucketKey => {
                const bucket = this.bucketMap.get(bucketKey);
                if (!bucket) {
                    return;
                }

                const indexInBucket = bucket.indexOf(object);
                if (indexInBucket >= 0) {
                    bucket.splice(indexInBucket, 1);
                }
            });
        }

        return object;
    }

    forEachItemInBucket(bucketKey: string, fn: (item: ObjectType) => (boolean | void)) {
        const bucket = this.bucketMap.get(bucketKey);
        if (!bucket) {
            return;
        }

        for (let i = 0 ; i < bucket.length ; i++) {
            if (fn(bucket[i])) {
                return true;
            }
        }
    }

    removeByKey(key: string): ObjectType | null {
        const object = this.objectMap.get(key);
        if (!object) {
            return null;
        }

        return this.remove(object);
    }

    getByKey(key: string): ObjectType | null {
        return this.objectMap.get(key) || null;
    }

    hasKey(key: string): boolean {
        return this.objectMap.has(key);
    }

    forEach(fn: (item: ObjectType) => (boolean | void)) {
        for (let i = 0 ; i < this.list.length ; i++) {
            if (fn(this.list[i])) {
                return true;
            }
        }

        return false;
    }

    map<MappedType>(fn: (item: ObjectType) => MappedType): MappedType[] {
        return this.list.map(fn);
    }
};
