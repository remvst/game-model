'use strict';

/* istanbul ignore next */

class BaseObjectSet {

    constructor() {
    }

    get size() {
        throw new Error();
    }

    add(object) { // jshint ignore:line
        throw new Error();
    }

    remove(object) { // jshint ignore:line
        throw new Error();
    }

    removeByKey(key) { // jshint ignore:line
        throw new Error();
    }

    getByKey(key) { // jshint ignore:line
        throw new Error();
    }

    hasKey(key) { // jshint ignore:line
        throw new Error();
    }

    forEach(fn) { // jshint ignore:line
        throw new Error();
    }

    map(fn) { // jshint ignore:line
        throw new Error();
    }

}

module.exports = BaseObjectSet;
