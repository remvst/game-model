import { RegistryEntry, traitRegistryEntry } from "../registry/trait-registry";
import { Trait } from "../trait";

export class EntitySelectorTrait extends Trait {
    static readonly key = "entity-selector";
    readonly key = EntitySelectorTrait.key;

    static registryEntry(): RegistryEntry<EntitySelectorTrait> {
        return traitRegistryEntry((builder) => {
            builder.traitClass(EntitySelectorTrait);
        });
    }
}
