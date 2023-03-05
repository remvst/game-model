import { Configurable, BooleanConfigurable, StringConfigurable, NumberConfigurable, ColorConfigurable, EnumConfigurable, CompositeConfigurable } from '@remvst/configurable';
import EntityIdConfigurable from './configurable/entity-id-configurable';
import { BooleanConstraints, ColorConstraints, EntityIdConstraints, GenericProperty, ListConstraints, NumberConstraints, Property, PropertyConstraints, StringConstraints } from "./properties";
import PropertyRegistry from './property-registry';
import World from './world';

export function propertyValueConfigurable<T, U>(
    world: World | null,
    type: PropertyConstraints, 
    read: () => T,
    write: (value: T, configurable: Configurable) => void,
): Configurable {
    if (type instanceof ListConstraints) {
        const items = read() as any[];

        const configurable = new CompositeConfigurable();
        for (let i = 0 ; i <= items.length ; i++) {
            const itemConfigurable = propertyValueConfigurable(
                world,
                type.itemType,
                () => items[i],
                (value) => {
                    const copy = items.slice(0);
                    copy[i] = value;
                    write(copy as T, configurable);
                    configurable.invalidate();
                }
            );
            configurable.add(`item[${i}]`, itemConfigurable);
        }

        return configurable;
    }

    if (type instanceof NumberConstraints) {
        return new NumberConfigurable({
            'read': () => parseFloat(read() as any) || 0,
            'write': (value, configurable) => write(value as T, configurable),
            'min': type.min, 
            'max': type.max, 
            'step': type.step,
        });
    }

    if (type instanceof StringConstraints) {
        return new StringConfigurable({
            'read': () => (read() as any).toString(),
            'write': (value, configurable) => write(value as T, configurable),
        });
    }

    if (type instanceof BooleanConstraints) {
        return new BooleanConfigurable({
            'read': () => !!read(),
            'write': (value, configurable) => write(value as T, configurable),
        });
    }

    if (type instanceof ColorConstraints) {
        return new ColorConfigurable({
            'read': () => parseInt(read() as any) || 0,
            'write': (value, configurable) => write(value as T, configurable),
        });
    }

    if (type instanceof EntityIdConstraints) {
        return new EntityIdConfigurable({
            world,
            'read': () => (read() as any).toString(),
            'write': (value, configurable) => write(value as T, configurable),
        });
    }

    throw new Error(`Unknown property type: ${type}`);
}

export function anyProperty(opts: {
    propertyRegistry: PropertyRegistry<Property<any>>,
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
