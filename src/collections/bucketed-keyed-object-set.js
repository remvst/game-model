'use strict';

const KeyedObjectSet = require('./keyed-object-set');

class BucketedKeyedObjectSet extends KeyedObjectSet {

    constructor(getKey, getBuckets) {
        super(getKey);
        this.getBuckets = getBuckets;
        this.bucketMap = {};
    }

    add(object) {
        if (!super.add(object)) {
            return;
        }

        this.didAdd(object);
    }

    remove(object) {
        if (!super.remove(object)) {
            return;
        }

        this.didRemove(object);
    }

    removeByKey(key) {
        const removed = super.removeByKey(key);
        if (!removed) {
            return;
        }

        this.didRemove(removed);
    }

    didAdd(object) {
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

}

module.exports = BucketedKeyedObjectSet;
