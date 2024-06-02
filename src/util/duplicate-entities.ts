import { Entity } from "../entity";
import {
    EntityIdConstraints,
    ListConstraints,
} from "../properties/property-constraints";
import { TraitRegistry } from "../registry/trait-registry";
import { SerializationOptions } from "../serialization/serialization-options";
import { EntitySerializer } from "../serialization/serializer";
import { World } from "../world";
import { EntityIdMapping } from "./entity-id-mapping";

export function duplicateEntities(
    entities: Iterable<Entity>,
    targetWorld: World,
    entitySerializer: EntitySerializer<any>,
    traitRegistry: TraitRegistry,
): Entity[] {
    const entitiesArray = Array.from(entities);

    const mapping = new EntityIdMapping(
        targetWorld,
        entitiesArray.map((entity) => entity.id),
    );

    const duplicatedEntities: Entity[] = [];

    const serializationOptions = new SerializationOptions();
    for (const sourceEntity of entitiesArray) {
        const serialized = entitySerializer.serialize(
            sourceEntity,
            serializationOptions,
        );
        const duplicatedEntity = entitySerializer.deserialize(
            serialized,
            serializationOptions,
        );

        (duplicatedEntity as any).id = mapping.destinationId(sourceEntity.id);
        duplicatedEntity.bind(targetWorld);

        for (const trait of duplicatedEntity.traits.items()) {
            const registryEntry = traitRegistry.entry(trait.key);

            if (registryEntry?.properties) {
                for (const property of registryEntry.properties) {
                    const type = property.type;

                    if (type instanceof EntityIdConstraints) {
                        const value = property.get(trait.entity);
                        const mapped = mapping.destinationId(value);
                        if (mapped) property.set(duplicatedEntity, mapped);
                    }

                    if (
                        type instanceof ListConstraints &&
                        type.itemType instanceof EntityIdConstraints
                    ) {
                        const values: string[] = property.get(trait.entity);
                        const mapped = values.map(
                            (value) => mapping.destinationId(value) || value,
                        );
                        property.set(duplicatedEntity, mapped);
                    }
                }
            }
        }

        duplicatedEntities.push(duplicatedEntity);
    }

    return duplicatedEntities;
}
