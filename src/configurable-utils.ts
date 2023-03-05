import { Configurable, BooleanConfigurable, StringConfigurable, NumberConfigurable, ColorConfigurable, EnumConfigurable } from '@remvst/configurable';
import EntityIdConfigurable from './configurable/entity-id-configurable';
import { NumberPropertyConstraints, Property, PropertyType } from "./properties";
import PropertyRegistry from './property-registry';
import World from './world';

export function propertyValueConfigurable<T>(
    world: World | null,
    property: Property<T>, 
    read: () => T,
    write: (value: T) => void,
): Configurable {
    switch (property.type) {
    case PropertyType.BOOLEAN:
        return new BooleanConfigurable({
            'read': () => !!read(),
            'write': (value) => write(value as T),
        });
    case PropertyType.STRING:
        return new StringConfigurable({
            'read': () => (read() as any).toString(),
            'write': (value) => write(value as T),
        });
    case PropertyType.NUMBER:
        let min = undefined;
        let max = undefined;
        let step = undefined;

        const { constraints } = property;
        if (constraints instanceof NumberPropertyConstraints) {
            min = constraints.min;
            max = constraints.max;
            step = constraints.step;
        }

        return new NumberConfigurable({
            'read': () => parseFloat(read() as any) || 0,
            'write': (value) => write(value as T),
            min, max, step,
        });
    case PropertyType.COLOR:
        return new ColorConfigurable({
            'read': () => parseInt(read() as any) || 0,
            'write': (value) => write(value as T),
        });
    case PropertyType.ENTITY_ID:
        return new EntityIdConfigurable({
            world,
            'read': () => (read() as any).toString(),
            'write': (value) => write(value as T),
        });
    }

    throw new Error(`Unknown property type: ${property.type}`);
}

export function anyProperty(opts: {
    propertyRegistry: PropertyRegistry,
    filter: (property: Property<any>) => boolean,
    read: () => Property<any>,
    write: (value: Property<any>) => void,
}): Configurable {
    const configurable = new EnumConfigurable<Property<any>>({ 
        'read': opts.read,
        'write': opts.write,
     });

    for (const identifier of opts.propertyRegistry.keys()) {
        const split = identifier.split('.');
        const category = split.length > 0 ? split[0] : '';

        const property = opts.propertyRegistry.property(identifier)!;
        if (!opts.filter(property)) {
            continue;
        }

        configurable.category(category).add(identifier, property);
    }

    return configurable;
}
