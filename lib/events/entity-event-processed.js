"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Event indicating that an entity has processed a local event (in case the event needs to be watched at the world layer).
class EntityEventProcessed {
    constructor(entity) {
        this.event = null;
        this.entity = entity;
    }
    apply() { }
}
exports.default = EntityEventProcessed;
