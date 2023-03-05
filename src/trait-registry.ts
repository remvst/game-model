import { Property, traitEnabledProperty } from './properties/properties';
import { Configurable, CompositeConfigurable } from '@remvst/configurable';
import { TraitSerializer, AnySerialized } from './serialization/serializer';
import Trait from "./trait";
import PropertyRegistry from './property-registry';
import { EntityProperties } from './entity';
import { propertyValueConfigurable } from './configurable/property-value-configurable';

export interface RegistryEntry<TraitType extends Trait> {
    readonly key: string;
    readonly category?: string;
    newTrait?(): TraitType;
    serializer?(): TraitSerializer<TraitType, AnySerialized>;
    configurable?: (trait: TraitType) => Configurable;
    properties?: Property<any>[];
}

export default class TraitRegistry {
    private readonly entries = new Map<string, RegistryEntry<any>>();
    readonly properties = new PropertyRegistry<Property<any>>();

    constructor() {
        this.properties.add(EntityProperties.x);
        this.properties.add(EntityProperties.y);
        this.properties.add(EntityProperties.z);
        this.properties.add(EntityProperties.angle);
    }

    add(entry: RegistryEntry<any>): this {
        if (this.entries.has(entry.key)) {
            throw new Error(`Entry conflict for key ${entry.key}`);
        }
        this.entries.set(entry.key, entry);

        const properties = entry.properties || [];
        properties.push(traitEnabledProperty(entry.key));

        // In case no configurable was defined, add a default one
        if (!entry.configurable) {
            entry.configurable = (trait: Trait) => {
                const autoConfigurable = new CompositeConfigurable();
                for (const property of properties) {
                    autoConfigurable.add(property.identifier, propertyValueConfigurable(
                        trait.entity!.world,
                        property.type,
                        () => property.get(trait.entity!),
                        (value) => property.set(trait.entity!, value),
                    ));
                }
                return autoConfigurable;
            };
        }

        for (const property of properties) {
            this.properties.add(property);
        }

        return this;
    }

    entry(key: string): RegistryEntry<any> | null {
        return this.entries.get(key) || null;
    }

    keys(): Iterable<string> {
        return this.entries.keys();
    }
}
