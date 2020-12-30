import Entity from './entity';

export default class Trait {

    protected entity: Entity | null;
    enabled: boolean;

    constructor() {
        this.entity = null;
        this.enabled = true;
    }

    bind(entity: Entity) {
        this.entity = entity;
    }

    postBind() {
        // to be implemented in subtraits
    }

    dependency(traitId: string) {
        const trait = this.entity.traits.getByKey(traitId);
        if (!trait) {
            throw new Error('Trait ' + this.key + ' depends on trait ' + traitId + ' but trait was not found');
        }

        return trait;
    }

    get key(): string {
        throw new Error('Must implement key()');
    }

    maybeCycle(elapsed: number) {
        if (!this.enabled) {
            return;
        }

        if (!this.entity.world) {
            return;
        }

        this.cycle(elapsed);
    }

    cycle(elapsed: number) { // jshint ignore:line
        // to be implemented in subtraits
    }

}
