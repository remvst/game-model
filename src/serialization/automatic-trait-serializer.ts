import Entity from '../entity';
import { ListConstraints, NumberConstraints, StringConstraints, BooleanConstraints, ColorConstraints, EntityIdConstraints, EnumConstraints, PropertyConstraints, CompositeConstraints, JsonConstraints } from '../properties/property-constraints';
import Trait from '../trait';
import { RegistryEntry } from '../registry/trait-registry';
import { TraitSerializer } from './serializer';

interface Serialized {
    [key: string]: any;
}

export default class AutomaticTraitSerializer<T extends Trait> implements TraitSerializer<T, Serialized> {

    constructor(private readonly registryEntry: RegistryEntry<T>) {

    }

    serialize(trait: Trait): Serialized {
        // Bind to a temporary entity so we can read the properties
        const oldEntity = trait.entity;
        if (!oldEntity) {
            const entity = new Entity(undefined, [trait]);
            trait.bind(entity);
            if (oldEntity) {
                trait.bind(oldEntity);
            }
        }

        const serialized: Serialized = {};
        for (const property of this.registryEntry.properties!) {
            const serializedProperty = this.serializePropertyValue(property.type, property.get(trait.entity));
            serialized[property.localIdentifier!] = serializedProperty;
        }
        return serialized;
    }

    deserialize(serialized: Serialized): T {
        const trait = this.registryEntry.newTrait!();

        // Bind to a temporary entity so we can write the properties
        const entity = new Entity(undefined, [trait]);
        trait.bind(entity);

        for (const property of this.registryEntry.properties!) {
            if (!serialized.hasOwnProperty(property.localIdentifier)) {
                continue;
            }

            const propertyValue = this.deserializePropertyValue(property.type, serialized[property.localIdentifier!]);
            property.set(entity, propertyValue);
        }
        return trait;
    }

    private serializePropertyValue(
        type: PropertyConstraints<any>,
        value: any,
    ): any {
        if (type instanceof ListConstraints) {
            return (value as any[]).map((item) => this.serializePropertyValue(type.itemType, item));
        }

        if (type instanceof CompositeConstraints) {
            const res: any = {};
            for (const [key, subType] of type.properties.entries()) {
                res[key] = this.serializePropertyValue(subType, value[key]);
            }
            return res;
        }

        if (type instanceof JsonConstraints) {
            return JSON.stringify(value);
        }

        if (
            type instanceof NumberConstraints ||
            type instanceof StringConstraints ||
            type instanceof BooleanConstraints ||
            type instanceof ColorConstraints ||
            type instanceof EntityIdConstraints ||
            type instanceof EnumConstraints
        ) {
            return value;
        }

        throw new Error(`Unknown property type: ${type}`);
    }
    
    private deserializePropertyValue(
        type: PropertyConstraints<any>,
        serializedProperty: any,
    ): any {
        if (type instanceof ListConstraints) {
            return (serializedProperty as any[]).map((item) => this.deserializePropertyValue(type.itemType, item));
        }

        if (type instanceof CompositeConstraints) {
            const res: any = {};
            for (const [key, subType] of type.properties.entries()) {
                res[key] = this.deserializePropertyValue(subType, serializedProperty[key]);
            }
            return res;
        }

        if (type instanceof JsonConstraints) {
            return JSON.parse(serializedProperty);
        }

        if (
            type instanceof NumberConstraints ||
            type instanceof StringConstraints ||
            type instanceof BooleanConstraints ||
            type instanceof ColorConstraints ||
            type instanceof EntityIdConstraints ||
            type instanceof EnumConstraints
        ) {
            return serializedProperty;
        }

        throw new Error(`Unknown property type: ${type}`);
    }
}
