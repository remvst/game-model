import { Configurable, CompositeConfigurable } from "@remvst/configurable";
import EntityIdConfigurable from "../configurable/entity-id-configurable";
import Entity from "../entity";
import TraitRegistry from "../registry/trait-registry";
import SerializationOptions from "../serialization/serialization-options";
import { EntitySerializer } from "../serialization/serializer";
import World from "../world";
import EntityIdMapping from "./entity-id-mapping";

export default function duplicateEntities(
    entities: Iterable<Entity>, 
    targetWorld: World,
    entitySerializer: EntitySerializer<any>,
    traitRegistry: TraitRegistry,
): Entity[] {
    const mapping = new EntityIdMapping(
        targetWorld,
        Array.from(entities).map((entity) => entity.id),
    );

    const duplicatedEntities: Entity[] = [];

    const serializationOptions = new SerializationOptions();
    for (const sourceEntity of entities) {
        const serialized = entitySerializer.serialize(sourceEntity, serializationOptions);
        const duplicatedEntity = entitySerializer.deserialize(serialized, serializationOptions);

        (duplicatedEntity as any).id = mapping.destinationId(sourceEntity.id);
        duplicatedEntity.bind(targetWorld);

        for (const trait of duplicatedEntity.traits.items()) {
            const registryEntry = traitRegistry.entry(trait.key);

            // TODO rely on properties rather than configurables
            if (registryEntry && registryEntry.configurable) {
                const configurable = registryEntry.configurable(trait);
                replaceReferencedIds(configurable, mapping);
            }
        }

        duplicatedEntities.push(duplicatedEntity);
    }

    return duplicatedEntities;
}

function replaceReferencedIds(configurable: Configurable, idMapping: EntityIdMapping) {
    if (configurable instanceof EntityIdConfigurable) {
        const sourceId = configurable.read(configurable);
        const destinationId = idMapping.destinationId(sourceId);
        if (destinationId) {
            configurable.write(destinationId, configurable);
        }
    } else if (configurable instanceof CompositeConfigurable) {
        for (const entry of configurable.entries) {
            replaceReferencedIds(entry.configurable, idMapping);
        }
    }
}
