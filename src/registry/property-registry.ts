import { GenericProperty } from "../properties/properties";
import { Registry } from "./registry";

export class PropertyRegistry<PropertyType extends GenericProperty<any, any>>
    implements Registry<PropertyType>
{
    private readonly properties = new Map<string, PropertyType>();

    add(property: PropertyType) {
        this.properties.set(property.identifier, property);
    }

    entry(identifier: string): PropertyType | null {
        return this.properties.get(identifier) || null;
    }

    keys(): Iterable<string> {
        return this.properties.keys();
    }
}
