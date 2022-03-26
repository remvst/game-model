'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const rxjs_1 = require("rxjs");
const watchable_object_set_1 = require("./collections/watchable-object-set");
const object_set_1 = require("./collections/object-set");
const entity_removed_1 = require("./events/entity-removed");
class World {
    constructor() {
        this.reusableRemoveEvent = new entity_removed_1.default();
        this.entities = new watchable_object_set_1.default(new object_set_1.default(entity => entity.id, entity => entity.traits.map(trait => trait.key)));
        this.entities.additions.subscribe(entity => entity.bind(this));
        this.entities.removals.subscribe(entity => {
            entity.addEvent(this.reusableRemoveEvent);
            entity.unbind();
        });
        this.events = new rxjs_1.Subject();
    }
    cycle(elapsed) {
        this.entities.forEach((entity) => {
            entity.cycle(elapsed);
        });
        this.entities.forEach((entity) => {
            entity.postCycle();
        });
    }
    addEvent(event) {
        event.apply(this);
        this.events.next(event);
    }
    entity(entityId) {
        return this.entities.getByKey(entityId);
    }
}
exports.default = World;
;
