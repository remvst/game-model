import { BooleanConfigurable, ButtonConfigurable, ColorConfigurable, CompositeConfigurable, Configurable, EnumConfigurable, GroupConfigurable, NumberConfigurable, StringConfigurable } from "@remvst/configurable";
import EntityIdConfigurable from "./entity-id-configurable";
import { PropertyConstraints, ListConstraints, NumberConstraints, StringConstraints, BooleanConstraints, ColorConstraints, EntityIdConstraints, EnumConstraints, CompositeConstraints } from "../properties/property-constraints";
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
                    const copy = (read() as any[]).slice(0);
                    copy[i] = value;
                    write(copy as T, configurable);
                    configurable.invalidate();
                }
            );

            const deleteButton = new ButtonConfigurable({
                'label': 'del',
                'onClick': () => {
                    const copy = (read() as any[]).slice(0);
                    copy.splice(i, 1);
                    write(copy as T, configurable);
                    configurable.invalidate();
                }
            });

            if (itemConfigurable instanceof GroupConfigurable) {
                itemConfigurable.add(deleteButton);
                configurable.add(`item[${i}]`, itemConfigurable);
            } else if (itemConfigurable instanceof CompositeConfigurable) {
                itemConfigurable.add('del', deleteButton);
                configurable.add(`item[${i}]`, itemConfigurable);
            } else {
                configurable.add(`item[${i}]`, new GroupConfigurable()
                    .add(itemConfigurable)
                    .add(deleteButton));
            }
        }

        return configurable;
    }

    if (type instanceof CompositeConstraints) {
        const existing = Object.assign({}, read() as any);
        const configurable = new CompositeConfigurable();

        for (const [key, subType] of type.properties.entries()) {
            configurable.add(key, propertyValueConfigurable(
                world, 
                subType,
                () => existing[key],
                (value, configurable) => {
                    const newValue = Object.assign({}, existing);
                    newValue[key] = value;
                    write(newValue, configurable);
                }
            ))
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
            'read': () => (read() || '').toString(),
            'write': (value, configurable) => write(value as T, configurable),
        });
    }

    if (type instanceof EnumConstraints) {
        const configurable = new EnumConfigurable({
            'enumToken': type.enumToken,
            'read': () => read() as any,
            'write': (value, configurable) => write(value as T, configurable),
        });

        for (const value of type.values) {
            configurable.add((value || '(empty)').toString(), value);
        }

        return configurable;
    }

    throw new Error(`Unknown property type: ${type}`);
}
