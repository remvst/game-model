import TraitRegistry from "../registry/trait-registry";
import World from "../world";
import { EntityPropertyType, Property } from "./properties";

type PropertyFilter = (property: Property<any>) => boolean

export function onlyRelevantProperties(
    traitRegistry: TraitRegistry, 
    world: World, 
    entityId: () => string,
): PropertyFilter {
    return (property) => {
        switch (property.entityPropertyType) {
        case EntityPropertyType.GENERAL_ENTITY: return true;
        case EntityPropertyType.GENERAL_TRAIT: return true;
        case EntityPropertyType.SPECIFIC_TRAIT:
            const entity = world.entity(entityId());
            if (!entity) {
                return true;
            }
    
            for (const trait of entity.traits.items()) {
                const registryEntry = traitRegistry.entry(trait.key);
                if (!registryEntry || !registryEntry.properties) continue;
    
                if (registryEntry.properties.indexOf(property) !== -1) {
                    return true;
                }
            }
    
            return false;
        }
    }
};
