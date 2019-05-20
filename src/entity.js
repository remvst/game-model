'use strict';

const uuid = require('uuid');

const AgingTrait = require('./aging-trait');

const

class Entity {

    constructor(id, traits) {
        if (!traits) {
            id = uuid.v4();
            traits = [];
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
