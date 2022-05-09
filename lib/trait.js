"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
class Trait {
    constructor() {
        this._entity = null;
        this.lastEntityPosition = _1.vector3();
        this.enabled = true;
    }
    get entity() {
        return this._entity;
    }
    bind(entity) {
        this._entity = entity;
        this.lastEntityPosition.x = this._entity.position.x;
        this.lastEntityPosition.y = this._entity.position.y;
        this.lastEntityPosition.z = this._entity.position.z;
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
        if (!this.entity || !this.entity.world) {
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
