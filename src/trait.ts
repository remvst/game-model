import Entity from './entity';

export interface KeyProvider {
    readonly key: string;
}

export default abstract class Trait implements KeyProvider {

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

    dependency<TraitType extends Trait>(traitId: string): TraitType {
        const trait = this.entity!.traits.getByKey(traitId);
        if (!trait) {
            throw new Error('Trait ' + this.key + ' depends on trait ' + traitId + ' but trait was not found');
        }

        return trait as TraitType;
    }

    abstract get key(): string;

    maybeCycle(elapsed: number) {
        if (!this.enabled) {
            return;
        }

        if (!this.entity!.world) {
            return;
        }

        this.cycle(elapsed);
    }

    cycle(elapsed: number) {
        // to be implemented in subtraits
    }

}
