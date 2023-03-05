import Entity from '../entity';
import { ListConstraints, NumberConstraints, StringConstraints, BooleanConstraints, ColorConstraints, EntityIdConstraints, EnumConstraints, PropertyConstraints } from '../properties/property-constraints';
import Trait from '../trait';
import { RegistryEntry } from '../registry/trait-registry';
import { TraitSerializer } from './serializer';

interface Serialized {
    [key: string]: any;
}

export default class AutomaticTraitSerializer<T extends Trait> implements TraitSerializer<T, Serialized> {

    constructor(private readonly registryEntry: RegistryEntry<T>) {

    }

    serialize(value: Trait): Serialized {
        const serialized: Serialized = {};
        for (const property of this.registryEntry.properties!) {
            serialized[property.identifier] = this.serializePropertyValue(property.type, value);
        }
        return serialized;
    }

    deserialize(serialized: Serialized): T {
        const trait = this.registryEntry.newTrait!();

        // Bind to a temporary entity so we can read the properties
        const entity = new Entity(undefined, [trait]);
        trait.bind(entity);

        for (const property of this.registryEntry.properties!) {
            const propertyValue = this.deserializePropertyValue(property.type, serialized);
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
