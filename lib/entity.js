"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_1 = require("uuid");
const object_set_1 = require("./collections/object-set");
const entity_event_processed_1 = require("./events/entity-event-processed");
const vector3_1 = require("./vector3");
class Entity {
    constructor(id, traits) {
        this.reusableEventProcessedEvent = new entity_event_processed_1.default(this);
        this.world = null;
        this.position = vector3_1.vector3();
        this.cycleStartPosition = vector3_1.vector3();
        this.cycleEndPosition = vector3_1.vector3();
        this.cycleVelocity = vector3_1.vector3();
        this.id = id || uuid_1.v4();
        this.angle = 0;
        this.age = 0;
        this.timeFactor = 1;
        this.traits = new object_set_1.default(trait => trait.key);
        for (const trait of traits) {
            this.traits.add(trait);
        }
    }
    get x() { return this.position.x; }
    get y() { return this.position.y; }
    get z() { return this.position.z; }
    set x(x) { this.position.x = x; }
    set y(y) { this.position.y = y; }
    set z(z) { this.position.z = z; }
    bind(world) {
        this.world = world;
        for (const trait of this.traits.items()) {
            trait.bind(this);
        }
        for (const trait of this.traits.items()) {
            trait.postBind();
        }
    }
    unbind() {
        this.world = null;
    }
    preCycle() {
        this.cycleStartPosition.x = this.x;
        this.cycleStartPosition.y = this.y;
        this.cycleStartPosition.z = this.z;
        for (const trait of this.traits.items()) {
            trait.preCycle();
        }
    }
    cycle(elapsed) {
        const adjusted = elapsed * this.timeFactor;
        this.age += adjusted;
        for (const trait of this.traits.items()) {
            trait.maybeCycle(adjusted);
        }
    }
    postCycle() {
        this.cycleEndPosition.x = this.x;
        this.cycleEndPosition.y = this.y;
        this.cycleEndPosition.z = this.z;
        this.cycleVelocity.x = this.x - this.cycleStartPosition.x;
        this.cycleVelocity.y = this.y - this.cycleStartPosition.y;
        this.cycleVelocity.z = this.z - this.cycleStartPosition.z;
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
        const { world } = this;
        for (const trait of this.traits.items()) {
            trait.processEvent(event);
        }
        if (world) {
            this.reusableEventProcessedEvent.event = event;
            world.addEvent(this.reusableEventProcessedEvent);
        }
    }
}
exports.default = Entity;
;
