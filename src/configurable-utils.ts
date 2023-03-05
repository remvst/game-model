import { Configurable, BooleanConfigurable, StringConfigurable, NumberConfigurable, ColorConfigurable } from '@remvst/configurable';
import EntityIdConfigurable from './configurable/entity-id-configurable';
import { Property, PropertyType } from "./properties";
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
        return new NumberConfigurable({
            'read': () => parseFloat(read() as any) || 0,
            'write': (value) => write(value as T),
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
