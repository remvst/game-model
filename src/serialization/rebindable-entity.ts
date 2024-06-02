import { Entity } from "../entity";
import { Trait } from "../trait";

export class RebindableEntity extends Entity {
    private traitOverride: Trait;

    constructor() {
        super(undefined, []);
    }

    setTrait(trait: Trait) {
        this.traitOverride = trait;
        trait.bind(this);
    }

    trait(): Trait {
        return this.traitOverride;
    }

    traitOfType<T extends Trait>(): T {
        return this.traitOverride as T;
    }
}
