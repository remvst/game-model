'use strict';

import { BaseObjectSet } from './base-object-set';

export default class ObjectSet<ObjectType> implements BaseObjectSet<ObjectType> {

    private getKey: (item: ObjectType) => string;
    private getBuckets: ((item: ObjectType) => string[]) | null;

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

    add(object: ObjectType): boolean {
        if (!object) {
            return;
        }

        const key = this.getKey(object);
        if (key in this.objectMap) {
            return;
        }

        this.list.push(object);
        this.objectMap[key] = object;

        if (this.getBuckets) {
            this.getBuckets(object).forEach(bucketKey => {
                let bucket = this.bucketMap[bucketKey];
                if (!bucket) {
                    bucket = [];
                    this.bucketMap[bucketKey] = bucket;
                }

                bucket.push(object);
            });
        }

        return true;
    }

    remove(object: ObjectType): ObjectType | null {
        if (!object) {
            return null;
        }

        const key = this.getKey(object);
        if (!(key in this.objectMap)) {
            return null;
        }

        const index = this.list.indexOf(object);
        if (index >= 0) {
            this.list.splice(index, 1);
        }

        delete this.objectMap[key];

        if (this.getBuckets) {
            this.getBuckets(object).forEach(bucketKey => {
                const bucket = this.bucketMap[bucketKey];
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

    forEachItemInBucket(bucketKey: string, fn: (item: ObjectType) => (boolean | undefined)) {
        const bucket = this.bucketMap[bucketKey];
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
        return this.remove(this.objectMap[key]);
    }

    getByKey(key: string): ObjectType | null {
        return this.objectMap[key] || null;
    }

    hasKey(key: string): boolean {
        return key in this.objectMap;
    }

    forEach(fn: (item: ObjectType) => (boolean | undefined)) {
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
