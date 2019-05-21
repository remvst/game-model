'use strict';

const uuid = require('uuid');

const AgingTrait = require('./traits/aging-trait');

const ObjectSet = require('./collections/object-set');

class Entity {

    constructor(id, traits) {
        if (!traits) {
            traits = id;
            id = uuid.v4();
        }

        this.id = id;
        this.world = null;

        this.traits = new ObjectSet(trait => trait.key);

        traits.concat([new AgingTrait()]).forEach(trait => {
            this.traits.add(trait);
            trait.bind(this);
        });

        this.traits.forEach(trait => trait.postBind());
    }

    bind(world) {
        this.world = world;
    }

    cycle(elapsed) {
        this.traits.forEach(trait => {
            trait.maybeCycle(elapsed);
        });
    }

    remove() {
        if (this.world) {
            this.world.entities.remove(this);
        }
    }

}

module.exports = Entity;
