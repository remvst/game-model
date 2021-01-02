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
        this.angle = 0;
        this.age = 0;
        this.timeFactor = 1;
        this.traits = new object_set_1.default(trait => trait.key);
        traits.forEach((trait) => {
            this.traits.add(trait);
            trait.bind(this);
        });
        this.traits.forEach((trait) => {
            trait.postBind();
        });
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
        this.traits.forEach((trait) => {
            trait.maybeCycle(adjusted);
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
exports.default = Entity;
;
