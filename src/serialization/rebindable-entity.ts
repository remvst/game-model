import Entity from "../entity";
import Trait from "../trait";

export default class RebindableEntity extends Entity {

    private traitOverride: Trait;

    constructor() {
        super(undefined, []);
    }

    setTrait(trait: Trait) {
        this.traitOverride = trait;
    }

    trait(): Trait {
        return this.traitOverride;
    }

    traitOfType<T extends Trait>(): T {
        return this.traitOverride as T;
    }
}