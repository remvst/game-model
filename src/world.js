'use strict';

const Rectangle = require('@remvst/geometry/rectangle');

const WatchableObjectSet = require('./collections/watchable-object-set');
const BucketedKeyedObjectSet = require('./collections/bucketed-keyed-object-set');

class World {

    constructor() {
        this.bounds = new Rectangle(0, 0, 4000, 1600);

        this.entities = new WatchableObjectSet(new BucketedKeyedObjectSet(
            entity => entity.id,
            entity => entity.traits.map(trait => trait.key)
        ));
        this.entities.additions.subscribe(object => object.world = this);
        // this.entities.deletions.subscribe(object => object.world = null);
    }

    cycle(elapsed) {
        this.entities.forEach(entity => {
            entity.cycle(elapsed);
        });
    }

}

module.exports = World;
