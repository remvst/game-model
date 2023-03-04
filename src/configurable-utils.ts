import { Configurable, BooleanConfigurable, StringConfigurable, NumberConfigurable } from '@remvst/configurable';
import { Property, PropertyType } from "./properties";

export function propertyValueConfigurable<T>(
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
    }

    throw new Error(`Unknown property type: ${property.type}`);
}
