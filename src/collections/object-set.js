'use strict';

const BaseObjectSet = require('./base-object-set');

class ObjectSet extends BaseObjectSet {

    constructor(getKey, getBuckets) {
        super();
        this.getKey = getKey;
        this.getBuckets = getBuckets;
        this.list = [];
        this.objectMap = {};
        this.bucketMap = {};
    }

    get size() {
        return this.list.length;
    }

    add(object) {
        if (!object) {
            return;
        }

        const key = this.getKey(object);
        if (key in this.objectMap) {
            return;
        }

        this.list.push(object);
        this.objectMap[key] = object;

        this.didAdd(object);

        return true;
    }

    remove(object) {
        if (!object) {
            return;
        }

        const key = this.getKey(object);
        if (!(key in this.objectMap)) {
            return;
        }

        const index = this.list.indexOf(object);
        if (index >= 0) {
            this.list.splice(index, 1);
        }

        delete this.objectMap[key];

        this.didRemove(object);

        return object;
    }

    didAdd(object) {
        if (!this.getBuckets) {
            return;
        }

        const buckets = this.getBuckets(object);
        buckets.forEach(bucketKey => {
            let bucket = this.bucketMap[bucketKey];
            if (!bucket) {
                bucket = [];
                this.bucketMap[bucketKey] = bucket;
            }

            bucket.push(object);
        });
    }

    didRemove(object) {
        if (!this.getBuckets) {
            return;
        }

        const buckets = this.getBuckets(object);
        buckets.forEach(bucketKey => {
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

    forEachItemInBucket(bucketKey, fn) {
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

    removeByKey(key) {
        return this.remove(this.objectMap[key]);
    }

    getByKey(key) {
        return this.objectMap[key] || null;
    }

    hasKey(key) {
        return key in this.objectMap;
    }

    forEach(fn) {
        for (let i = 0 ; i < this.list.length ; i++) {
            if (fn(this.list[i])) {
                return true;
            }
        }

        return false;
    }

    map(fn) {
        return this.list.map(fn);
    }

}

module.exports = ObjectSet;
