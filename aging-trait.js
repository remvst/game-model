'use strict';

const Trait = require('./trait');

class AgingTrait extends Trait {

    constructor() {
        super();
        this.age = 0;
    }

    get key() {
        return 'aging';
    }

    cycle(elapsed) {
        this.age += elapsed;
    }

}

module.exports = AgingTrait;
