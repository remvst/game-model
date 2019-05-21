'use strict';

const Rectangle = require('@remvst/geometry/rectangle');

const WatchableBucketedObjectSet = require('./collections/watchable-bucketed-object-set');
const BucketedKeyedObjectSet = require('./collections/bucketed-keyed-object-set');

class World {

    constructor() {
        this.bounds = new Rectangle(0, 0, 4000, 1600);

        this.entities = new WatchableBucketedObjectSet(new BucketedKeyedObjectSet(
            entity => entity.id,
            entity => entity.traits.map(trait => trait.key)
        ));
        this.entities.additions.subscribe(entity => entity.bind(this));
        // this.entities.deletions.subscribe(object => object.world = null);
    }

    cycle(elapsed) {
        this.entities.forEach(entity => {
            entity.cycle(elapsed);
        });
    }

}

module.exports = World;
