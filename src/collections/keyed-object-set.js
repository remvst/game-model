'use strict';

class KeyedObjectSet {

    constructor(getKey) {
        this.getKey = getKey;
        this.list = [];
        this.objectMap = {};
    }

    get size() {
        return this.list.length;
    }

    add(object) {
        if (!object) {
            return;
        }

        const id = this.getKey(object);
        if (id in this.objectMap) {
            return;
        }

        this.list.push(object);
        this.objectMap[id] = object;

        this.didAdd(object);
    }

    remove(object) {
        if (!object) {
            return;
        }

        const id = this.getKey(object);
        if (!(id in this.objectMap)) {
            return;
        }

        const index = this.list.indexOf(object);
        if (index >= 0) {
            this.list.splice(index, 1);
        }

        delete this.objectMap[id];

        this.didRemove(object);

        return object;
    }

    removeByKey(key) {
        return this.remove(this.objectMap[key]);
    }

    getByKey(key) {
        return this.objectMap[key] || null;
    }

    hasKey(key) {
        return key in this.objectMap;
    }

    forEach(fn) {
        for (let i = 0 ; i < this.list.length ; i++) {
            if (fn(this.list[i])) {
                return true;
            }
        }

        return false;
    }

    map(fn) {
        return this.list.map(fn);
    }

    didAdd(object) { // jshint ignore:line
    }

    didRemove(object) { // jshint ignore:line
    }

}

module.exports = KeyedObjectSet;
