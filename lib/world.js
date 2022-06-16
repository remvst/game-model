"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rxjs_1 = require("rxjs");
const watchable_object_set_1 = require("./collections/watchable-object-set");
const object_set_1 = require("./collections/object-set");
const entity_removed_1 = require("./events/entity-removed");
const sector_object_set_1 = require("./collections/sector-object-set");
class World {
    constructor() {
        this.reusableRemoveEvent = new entity_removed_1.default();
        this.sectorSets = new Map();
        this.entities = new watchable_object_set_1.default(new object_set_1.default(entity => entity.id, entity => entity.traits.map(trait => trait.key)));
        this.entities.additions.subscribe(entity => entity.bind(this));
        this.entities.removals.subscribe(entity => {
            entity.addEvent(this.reusableRemoveEvent);
            entity.unbind();
        });
        this.events = new rxjs_1.Subject();
    }
    sectorSet(key, sectorSize) {
        let sectorSet = this.sectorSets.get(key);
        if (sectorSet) {
            return sectorSet;
        }
        sectorSet = new sector_object_set_1.default(sectorSize);
        this.sectorSets.set(key, sectorSet);
        return sectorSet;
    }
    resetSectors() {
        for (const set of this.sectorSets.values()) {
            set.clear();
        }
    }
    cycle(elapsed) {
        this.resetSectors();
        for (const entity of this.entities.items())
            entity.preCycle();
        for (const entity of this.entities.items())
            entity.cycle(elapsed);
        for (const entity of this.entities.items())
            entity.postCycle();
    }
    addEvent(event) {
        event.apply(this);
        this.events.next(event);
    }
    entity(entityId) {
        return this.entities.getByKey(entityId);
    }
    *traitsOfType(keyProvider) {
        const key = keyProvider.key;
        if (!key) {
            throw new Error('Provided trait type does not have a statically defined key');
        }
        for (const value of this.entities.bucket(key)) {
            yield value.traitOfType(keyProvider);
        }
    }
}
exports.default = World;
;
