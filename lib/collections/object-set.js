'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
class ObjectSet {
    constructor(getKey, getBuckets = undefined) {
        this.getKey = getKey;
        this.getBuckets = getBuckets;
        this.list = [];
        this.objectMap = new Map();
        this.bucketMap = new Map();
    }
    get size() {
        return this.list.length;
    }
    add(object) {
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
    remove(object) {
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
    forEachItemInBucket(bucketKey, fn) {
        const bucket = this.bucketMap.get(bucketKey);
        if (!bucket) {
            return;
        }
        for (let i = 0; i < bucket.length; i++) {
            if (fn(bucket[i])) {
                return true;
            }
        }
    }
    removeByKey(key) {
        const object = this.objectMap.get(key);
        if (!object) {
            return null;
        }
        return this.remove(object);
    }
    getByKey(key) {
        return this.objectMap.get(key) || null;
    }
    hasKey(key) {
        return this.objectMap.has(key);
    }
    forEach(fn) {
        for (let i = 0; i < this.list.length; i++) {
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
exports.default = ObjectSet;
;
