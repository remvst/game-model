"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
const geometry_1 = require("@remvst/geometry");
const REUSABLE_GEOMETRY_AREA = new geometry_1.Rectangle(0, 0, 0, 0);
class Trait {
    constructor() {
        this._entity = null;
        this.lastEntityPosition = _1.vector3();
        this.surfaceProvider = null;
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
    preCycle() {
        this.makeQueriable();
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
    postCycle() {
        this.makeQueriable();
    }
    makeQueriable() {
        const { surfaceProvider } = this;
        if (surfaceProvider) {
            surfaceProvider.surface(this, REUSABLE_GEOMETRY_AREA);
            this.entity?.world?.sectorSet(this.key, surfaceProvider.sectorSize).insert(this.entity, REUSABLE_GEOMETRY_AREA);
        }
    }
    processEvent(event) {
        // to be implemented in subtraits
    }
}
exports.default = Trait;
