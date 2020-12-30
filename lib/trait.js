"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Trait {
    constructor() {
        this.entity = null;
        this.enabled = true;
    }
    bind(entity) {
        this.entity = entity;
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
    get key() {
        throw new Error('Must implement key()');
    }
    maybeCycle(elapsed) {
        if (!this.enabled) {
            return;
        }
        if (!this.entity.world) {
            return;
        }
        this.cycle(elapsed);
    }
    cycle(elapsed) {
        // to be implemented in subtraits
    }
}
exports.default = Trait;
