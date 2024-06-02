import { PropertyType } from "../properties/property-constraints";
import { RegistryEntry, traitRegistryEntry } from "../registry/trait-registry";
import { Trait } from "../trait";

export class DisappearingTrait extends Trait {
    static readonly key = "disappearing";
    readonly key = DisappearingTrait.key;
    readonly disableChunking: boolean = true;

    constructor(
        public maxAge: number = 0,
        public sideEffect: (trait: DisappearingTrait) => void = () => {},
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

    static registryEntry(): RegistryEntry<DisappearingTrait> {
        return traitRegistryEntry((builder) => {
            builder.traitClass(DisappearingTrait);
            builder.simpleProp("maxAge", PropertyType.num());
        });
    }
}
