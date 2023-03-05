import { GenericProperty } from './properties';

export default class PropertyRegistry<PropertyType extends GenericProperty<any, any>> {
    private readonly properties = new Map<string, PropertyType>();

    add(property: PropertyType): this {
        this.properties.set(property.identifier, property);
        return this;
    }

    property(identifier: string): PropertyType | null {
        return this.properties.get(identifier) || null;
    }

    keys(): Iterable<string> {
        return this.properties.keys();
    }
}
