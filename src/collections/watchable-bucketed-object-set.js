'use strict';

const WatchableObjectSet = require('./watchable-object-set');

class WatchableBucketedObjectSet extends WatchableObjectSet {

    forEachItemInBucket(bucketKey, fn) {
        return this.wrappedSet.forEachItemInBucket(bucketKey, fn);
    }

}

module.exports = WatchableBucketedObjectSet;
