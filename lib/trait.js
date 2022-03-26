"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
class Trait {
    constructor() {
        this.lastEntityPosition = _1.vector3();
        this.entity = null;
        this.enabled = true;
    }
    bind(entity) {
        this.entity = entity;
        this.lastEntityPosition.x = this.entity.x;
        this.lastEntityPosition.y = this.entity.y;
        this.lastEntityPosition.z = this.entity.z;
    }
    postBind() {
        // to be implemented in subtraits
    }
    dependency(traitId) {
        const trait = this.entity.traits.getByKey(traitId);
        if (!trait) {
            throw new Error('Trait ' + this.key + ' depends on trait ' + traitId + ' but trait was not found');
        }
        return trait;
    }
    maybeCycle(elapsed) {
        if (!this.enabled) {
            return;
        }
        if (!this.entity.world) {
            return;
        }
        this.cycle(elapsed);
        this.lastEntityPosition.x = this.entity.x;
        this.lastEntityPosition.y = this.entity.y;
        this.lastEntityPosition.z = this.entity.z;
    }
    cycle(elapsed) {
        // to be implemented in subtraits
    }
    processEvent(event) {
        // to be implemented in subtraits
    }
}
exports.default = Trait;
