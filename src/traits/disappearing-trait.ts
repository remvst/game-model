import { PropertyType } from "../properties/property-constraints";
import { RegistryEntry } from "../registry/trait-registry";
import {
    DefinitionsOfProps,
    SimpleTrait,
    simpleTraitRegistryEntry,
} from "./simple-trait";

export class DisappearingTrait extends SimpleTrait<{ maxAge: number }> {
    static readonly key = "disappearing";
    readonly key = DisappearingTrait.key;
    readonly disableChunking: boolean = true;

    definitions(): DefinitionsOfProps<DisappearingTrait["props"]> {
        return {
            maxAge: PropertyType.num(),
        };
    }

    cycle(_: number) {
        if (this.entity!.age >= this.props.maxAge) {
            this.entity!.remove();
        }
    }

    static registryEntry(): RegistryEntry<DisappearingTrait> {
        return simpleTraitRegistryEntry(DisappearingTrait);
    }
}
