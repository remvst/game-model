import { traitGetSet } from "../properties/properties";
import { PropertyType } from "../properties/property-constraints";
import { AutoRegistryEntry } from "../registry/trait-registry";
import Trait from "../trait";

export default class DisappearingTrait extends Trait {

    static readonly key = 'disappearing';
    readonly key = DisappearingTrait.key;
    readonly disableChunking: boolean = true;

    constructor(
        public maxAge: number = 0,
        public sideEffect: ((trait: DisappearingTrait) => void) = () => {},
    ) {
        super();
        this.maxAge = maxAge;
    }

    cycle(_: number) {
        if (this.entity!.age >= this.maxAge) {
            this.sideEffect(this);
            this.entity!.remove();
        }
    }

    static registryEntry(): AutoRegistryEntry<DisappearingTrait> {
        return {
            traitType: DisappearingTrait,
            properties: [
                traitGetSet(DisappearingTrait, 'maxAge', PropertyType.num(), (trait) => trait.maxAge, (trait, maxAge) => trait.maxAge = maxAge),
            ],
        };
    }
}
