"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_1 = require("uuid");
const object_set_1 = require("./collections/object-set");
class Entity {
    constructor(id = undefined, traits) {
        this.id = id || uuid_1.v4();
        this.world = null;
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.angle = 0;
        this.age = 0;
        this.timeFactor = 1;
        this.traits = new object_set_1.default(trait => trait.key);
        for (const trait of traits) {
            this.traits.add(trait);
            trait.bind(this);
        }
        for (const trait of this.traits.items()) {
            trait.postBind();
        }
    }
    bind(world) {
        this.world = world;
    }
    unbind() {
        this.world = null;
    }
    cycle(elapsed) {
        const adjusted = elapsed * this.timeFactor;
        this.age += adjusted;
        for (const trait of this.traits.items()) {
            trait.maybeCycle(adjusted);
        }
    }
    remove() {
        if (this.world) {
            this.world.entities.remove(this);
        }
    }
    trait(traitKey) {
        return this.traits.getByKey(traitKey);
    }
    traitOfType(keyProvider) {
        const key = keyProvider.key;
        if (!key) {
            throw new Error('Provided trait type does not have a statically defined key');
        }
        return this.traits.getByKey(key);
    }
    addEvent(event) {
        for (const trait of this.traits.items()) {
            trait.processEvent(event);
        }
    }
}
exports.default = Entity;
;
