import { Property, traitEnabledProperty } from '../properties/properties';
import { Configurable, CompositeConfigurable } from '@remvst/configurable';
import { TraitSerializer, AnySerialized } from '../serialization/serializer';
import Trait from "../trait";
import PropertyRegistry from './property-registry';
import { EntityProperties } from '../entity';
import { propertyValueConfigurable } from '../configurable/property-value-configurable';
import { KeyProvider } from '../key-provider';
import AutomaticTraitSerializer from '../serialization/automatic-trait-serializer';

export interface RegistryEntry<TraitType extends Trait> {
    readonly key: string;
    readonly category?: string;
    newTrait?(): TraitType;
    serializer?(entry: RegistryEntry<TraitType>): TraitSerializer<TraitType, AnySerialized>;
    configurable?: (trait: TraitType) => Configurable;
    properties?: Property<any>[];
}

export interface AutoRegistryEntry<TraitType extends Trait> {
    readonly traitType: (new () => TraitType) & KeyProvider,
    readonly properties: Property<any>[],
    readonly category?: string,
}

export type AnyRegistryEntry<TraitType extends Trait> = RegistryEntry<TraitType> | AutoRegistryEntry<TraitType>;

export default class TraitRegistry {
    private readonly entries = new Map<string, RegistryEntry<any>>();
    readonly properties = new PropertyRegistry<Property<any>>();

    constructor() {
        this.properties.add(EntityProperties.x);
        this.properties.add(EntityProperties.y);
        this.properties.add(EntityProperties.z);
        this.properties.add(EntityProperties.angle);
    }

    add<T extends Trait>(entry: AnyRegistryEntry<T>): RegistryEntry<T> {
        const autoEntry = entry as AutoRegistryEntry<T>;
        const manualEntry = entry as RegistryEntry<T>;

        if (autoEntry.traitType) {
            return this.add({
                key: autoEntry.traitType.key,
                category: autoEntry.category,
                newTrait: () => new autoEntry.traitType(),
                serializer: (autoEntry) => new AutomaticTraitSerializer(autoEntry),
                properties: autoEntry.properties,
            });
        }

        if (this.entries.has(manualEntry.key)) {
            throw new Error(`Entry conflict for key ${manualEntry.key}`);
        }
        this.entries.set(manualEntry.key, manualEntry);

        const properties = manualEntry.properties || [];
        properties.push(traitEnabledProperty(manualEntry.key));

        // In case no configurable was defined, add a default one
        if (!manualEntry.configurable) {
            manualEntry.configurable = (trait: Trait) => {
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

        return manualEntry;
    }

    entry(key: string): RegistryEntry<any> | null {
        return this.entries.get(key) || null;
    }

    keys(): Iterable<string> {
        return this.entries.keys();
    }
}
