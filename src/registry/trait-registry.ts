import { EntityPropertyType, Property, traitEnabledProperty } from '../properties/properties';
import { Configurable, CompositeConfigurable } from '@remvst/configurable';
import { TraitSerializer, AnySerialized } from '../serialization/serializer';
import Trait from "../trait";
import PropertyRegistry from './property-registry';
import { EntityProperties } from '../entity';
import { propertyValueConfigurable } from '../configurable/property-value-configurable';
import { KeyProvider } from '../key-provider';
import VerboseAutomaticTraitSerializer from '../serialization/verbose/verbose-automatic-trait-serializer';
import PackedAutomaticTraitSerializer from '../serialization/packed/packed-automatic-trait-serializer';
import DualSupportTraitSerializer from '../serialization/dual/dual-support-trait-serializer';
import { Registry } from './registry';
import { PropertyConstraints } from '../properties/property-constraints';

export interface TraitRegistryEntry<TraitType extends Trait> {
    readonly key: string;
    readonly category?: string;
    newTrait?(): TraitType;
    serializer?(entry: TraitRegistryEntry<TraitType>): TraitSerializer<TraitType, AnySerialized>;
    configurable?: (trait: TraitType) => Configurable;
    properties?: Property<any>[];
}

export type RegistryEntry<TraitType extends Trait> = TraitRegistryEntry<TraitType>;

export interface AutoRegistryEntry<TraitType extends Trait> {
    readonly traitType: (new () => TraitType) & KeyProvider,
    readonly properties?: Property<any>[],
    readonly category?: string,
}

export type AnyTraitRegistryEntry<TraitType extends Trait> = 
    TraitRegistryEntry<TraitType> |
    AutoRegistryEntry<TraitType>;

interface TraitRegistryEntryBuilder<TraitType extends Trait & KeyProvider> {
    newTrait(newTrait: () => TraitType): void;
    traitClass(traitClass: (new () => TraitType) & KeyProvider): void;
    key(key: string): void;
    category(category: string): void;
    property<PropertyType>(
        identifier: string,
        type: PropertyConstraints<PropertyType>,
        read: (trait: TraitType) => PropertyType,
        write: (trait: TraitType, value: PropertyType) => void,
    ): void;
    serializer(serializer: (entry: TraitRegistryEntry<TraitType>) => TraitSerializer<TraitType, AnySerialized>): void;
    build(): TraitRegistryEntry<TraitType>;
}

class TraitRegistryEntryBuilderImpl<TraitType extends Trait & KeyProvider> implements TraitRegistryEntryBuilder<TraitType> {

    private _key: string = null;
    private _newTrait: () => TraitType = null;
    private _category: string = null;
    private _serializer: (entry: TraitRegistryEntry<TraitType>) => TraitSerializer<TraitType, AnySerialized> = null;
    private readonly _properties: any[] = [];

    constructor() {
        this.serializer((entry: TraitRegistryEntry<TraitType>) => new DualSupportTraitSerializer<TraitType>(
            new VerboseAutomaticTraitSerializer(entry),
            new PackedAutomaticTraitSerializer(entry),
        ));
    }

    traitClass(traitClass: (new () => TraitType) & KeyProvider): void {
        this.key(traitClass.key);
        this.newTrait(() => new traitClass());
    }

    key(key: string) {
        this._key = key;
    }

    newTrait(newTrait: () => TraitType) {
        this._newTrait = newTrait;
    }

    category(category: string): void {
        this._category = category;
    }

    property<PropertyType>(
        identifier: string, 
        type: PropertyConstraints<PropertyType>,
        get: (trait: TraitType) => PropertyType, 
        set: (trait: TraitType, value: PropertyType) => void,
    ): void {
        const traitKey = this._key;
        this._properties.push({
            identifier: traitKey + '.' + identifier,
            localIdentifier: identifier,
            entityPropertyType: EntityPropertyType.SPECIFIC_TRAIT,
            type,
            get: (entity) => get(entity.trait(traitKey) as TraitType),
            set: (entity, value) => set(entity.trait(traitKey) as TraitType, value),
        });
    }

    serializer(serializer: (entry: TraitRegistryEntry<TraitType>) => TraitSerializer<TraitType, AnySerialized>) {
        this._serializer = serializer;
    }

    build(): TraitRegistryEntry<TraitType> {
        return {
            key: this._key,
            category: this._category,
            newTrait: this._newTrait,
            serializer: this._serializer,
            properties: this._properties,
        };
    }
}

export function traitRegistryEntry<TraitType extends Trait>(
    makeEntry: (builder: TraitRegistryEntryBuilder<TraitType>) => void,
): TraitRegistryEntry<TraitType> {
    const builder = new TraitRegistryEntryBuilderImpl<TraitType>();
    makeEntry(builder);
    return builder.build();
}

export default class TraitRegistry implements Registry<AnyTraitRegistryEntry<any>> {
    private readonly entries = new Map<string, TraitRegistryEntry<any>>();
    readonly properties = new PropertyRegistry<Property<any>>();

    constructor() {
        this.properties.add(EntityProperties.x);
        this.properties.add(EntityProperties.y);
        this.properties.add(EntityProperties.z);
        this.properties.add(EntityProperties.angle);
    }

    add<T extends Trait>(entry: AnyTraitRegistryEntry<T>): AnyTraitRegistryEntry<T> {
        const autoEntry = entry as AutoRegistryEntry<T>;
        const manualEntry = entry as TraitRegistryEntry<T>;

        if (autoEntry.traitType) {
            return this.add({
                key: autoEntry.traitType.key,
                category: autoEntry.category,
                newTrait: () => new autoEntry.traitType(),
                serializer: (entry) => new DualSupportTraitSerializer<T>(
                    new VerboseAutomaticTraitSerializer(entry),
                    new PackedAutomaticTraitSerializer(entry),
                ),
                properties: autoEntry.properties || [],
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
    }

    entry(key: string): TraitRegistryEntry<any> | null {
        return this.entries.get(key) || null;
    }

    keys(): Iterable<string> {
        return this.entries.keys();
    }
}
