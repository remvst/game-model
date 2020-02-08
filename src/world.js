'use strict';

const Rx = require('rxjs');
const Rectangle = require('@remvst/geometry/rectangle');

const WatchableObjectSet = require('./collections/watchable-object-set');
const ObjectSet = require('./collections/object-set');

module.exports = class World {

    constructor() {
        this.bounds = new Rectangle(0, 0, 4000, 1600);

        this.entities = new WatchableObjectSet(new ObjectSet(
            entity => entity.id,
            entity => entity.traits.map(trait => trait.key)
        ));
        this.entities.additions.subscribe(entity => entity.bind(this));
        // this.entities.deletions.subscribe(object => object.world = null);

        this.events = new Rx.Subject();
    }

    cycle(elapsed) {
        this.entities.forEach(entity => {
            entity.cycle(elapsed);
        });
    }

    addEvent(event) {
        event.apply(this);
        this.events.next(event);
    }

    entity(entityId) {
        return this.entities.getByKey(entityId);
    }

};
