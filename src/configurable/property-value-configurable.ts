import { BooleanConfigurable, ButtonConfigurable, ColorConfigurable, CompositeConfigurable, Configurable, EnumConfigurable, GroupConfigurable, NumberConfigurable, StringConfigurable } from "@remvst/configurable";
import EntityIdConfigurable from "./entity-id-configurable";
import { PropertyConstraints, ListConstraints, NumberConstraints, StringConstraints, BooleanConstraints, ColorConstraints, EntityIdConstraints, EnumConstraints } from "../properties/property-constraints";
import World from "../world";

export function propertyValueConfigurable<T>(
    world: World | null,
    type: PropertyConstraints<T>, 
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
                () => items[i] || type.defaultValue(),
                (value) => {
                    const copy = items.slice(0);
                    copy[i] = value;
                    write(copy as T, configurable);
                    configurable.invalidate();
                }
            );

            let group: GroupConfigurable;
            if (itemConfigurable instanceof GroupConfigurable) {
                group = itemConfigurable;
            } else {
                group = new GroupConfigurable();
                group.add(itemConfigurable);
            }

            group.add(new ButtonConfigurable({
                'label': 'del',
                'onClick': () => {
                    const copy = items.slice(0);
                    copy.splice(i, 1);
                    write(copy as T, configurable);
                    configurable.invalidate();
                }
            }))

            configurable.add(`item[${i}]`, group);
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

    if (type instanceof EnumConstraints) {
        const configurable = new EnumConfigurable({
            'read': () => read() as any,
            'write': (value, configurable) => write(value as T, configurable),
        });

        for (const value of type.values) {
            configurable.add(value.toString(), value);
        }

        return configurable;
    }

    throw new Error(`Unknown property type: ${type}`);
}
