import { Configurable, EnumConfigurable } from "@remvst/configurable";
import { Property } from "..";
import PropertyRegistry from "../registry/property-registry";

export function anyProperty(opts: {
    propertyRegistry: PropertyRegistry<Property<any>>;
    filter: (property: Property<any>) => boolean;
    read: () => Property<any>;
    write: (value: Property<any>, configurable: Configurable) => void;
}): Configurable {
    const configurable = new EnumConfigurable<Property<any>>({
        read: opts.read,
        write: opts.write,
    });

    for (const identifier of opts.propertyRegistry.keys()) {
        const split = identifier.split(".");
        const category = split.length > 0 ? split[0] : "";

        const property = opts.propertyRegistry.entry(identifier)!;
        if (!opts.filter(property)) {
            continue;
        }

        configurable.category(category).add(identifier, property);
    }

    return configurable;
}
