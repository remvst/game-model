'use strict';

const BaseObjectSet = require('./base-object-set');

class KeyedObjectSet extends BaseObjectSet {

    constructor(getKey) {
        super();
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

        const key = this.getKey(object);
        if (key in this.objectMap) {
            return;
        }

        this.list.push(object);
        this.objectMap[key] = object;

        return true;
    }

    remove(object) {
        if (!object) {
            return;
        }

        const key = this.getKey(object);
        if (!(key in this.objectMap)) {
            return;
        }

        const index = this.list.indexOf(object);
        if (index >= 0) {
            this.list.splice(index, 1);
        }

        delete this.objectMap[key];

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

}

module.exports = KeyedObjectSet;
