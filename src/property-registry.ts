import { EntityProperties } from './entity';
import { Property } from './properties';

export default class PropertyRegistry {
    private readonly properties = new Map<string, Property<any>>();

    constructor() {
        this.add(EntityProperties.x);
        this.add(EntityProperties.y);
    }

    add(property: Property<any>): this {
        this.properties.set(property.identifier, property);
        return this;
    }

    property(identifier: string): Property<any> | null {
        return this.properties.get(identifier) || null;
    }

    keys(): Iterable<string> {
        return this.properties.keys();
    }
}
