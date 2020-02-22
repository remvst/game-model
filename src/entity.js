'use strict';

const uuid = require('uuid');

const ObjectSet = require('./collections/object-set');

class Entity {

    constructor(id, traits) {
        if (!traits) {
            traits = id;
            id = uuid.v4();
        }

        this.id = id;
        this.world = null;

        this.x = 0;
        this.y = 0;
        this.angle = 0;
        this.age = 0;

        this.traits = new ObjectSet(trait => trait.key);

        traits.forEach(trait => {
            this.traits.add(trait);
            trait.bind(this);
        });

        this.traits.forEach(trait => trait.postBind());
    }

    bind(world) {
        this.world = world;
    }

    unbind() {
        this.world = null;
    }

    cycle(elapsed) {
        this.age += elapsed;

        this.traits.forEach(trait => {
            trait.maybeCycle(elapsed);
        });
    }

    remove() {
        if (this.world) {
            this.world.entities.remove(this);
        }
    }

    trait(traitKey) {
        return this.traits.getByKey(traitKey);
    }

}

module.exports = Entity;
