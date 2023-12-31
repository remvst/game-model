import { CompositeConfigurable, Configurable } from "@remvst/configurable";
import { propertyValueConfigurable } from "../configurable/property-value-configurable";
import GameModelApp from "../game-model-app";
import { KeyProvider } from "../key-provider";
import {
    EntityPropertyType,
    Property,
    traitEnabledProperty,
} from "../properties/properties";
import { PropertyConstraints } from "../properties/property-constraints";
import DualSupportTraitSerializer from "../serialization/dual/dual-support-trait-serializer";
import PackedAutomaticTraitSerializer from "../serialization/packed/packed-automatic-trait-serializer";
import { AnySerialized, TraitSerializer } from "../serialization/serializer";
import VerboseAutomaticTraitSerializer from "../serialization/verbose/verbose-automatic-trait-serializer";
import Trait from "../trait";
import { Registry } from "./registry";

export interface TraitRegistryEntry<TraitType extends Trait> {
    readonly key: string;
    readonly category?: string;
    newTrait?(): TraitType;
    serializer?(app: GameModelApp): TraitSerializer<TraitType, AnySerialized>;
    configurable?: (trait: TraitType) => Configurable;
    properties?: Property<any>[];
}

export type RegistryEntry<TraitType extends Trait> =
    TraitRegistryEntry<TraitType>;

export interface AutoRegistryEntry<TraitType extends Trait> {
    readonly traitType: (new () => TraitType) & KeyProvider;
    readonly properties?: Property<any>[];
    readonly category?: string;
}

export type AnyTraitRegistryEntry<TraitType extends Trait> =
    | TraitRegistryEntry<TraitType>
    | AutoRegistryEntry<TraitType>;

class TraitRegistryEntryBuilder<TraitType extends Trait & KeyProvider> {
    private _key: string = null;
    private _newTrait: () => TraitType = null;
    private _category: string = null;
    private _serializer: (
        app: GameModelApp,
    ) => TraitSerializer<TraitType, AnySerialized> = null;
    private _configurable: (trait: TraitType) => Configurable;
    private readonly _properties: Property<any>[] = [];

    constructor() {
        this.serializer((app: GameModelApp) => {
            const entry = app.traitRegistry.entry(this._key);
            return new DualSupportTraitSerializer<TraitType>(
                new VerboseAutomaticTraitSerializer(entry),
                new PackedAutomaticTraitSerializer(entry),
            );
        });

        this.configurable((trait: TraitType) => {
            const autoConfigurable = new CompositeConfigurable();
            for (const property of this._properties) {
                autoConfigurable.add(
                    property.identifier,
                    propertyValueConfigurable(
                        trait.entity!.world,
                        property.type,
                        () => property.get(trait.entity!),
                        (value) => property.set(trait.entity!, value),
                    ),
                );
            }
            return autoConfigurable;
        });
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
            identifier: traitKey + "." + identifier,
            localIdentifier: identifier,
            entityPropertyType: EntityPropertyType.SPECIFIC_TRAIT,
            type,
            get: (entity) => get(entity.trait(traitKey) as TraitType),
            set: (entity, value) =>
                set(entity.trait(traitKey) as TraitType, value),
        });
    }

    simpleProp<
        Key extends string & keyof TraitType,
        PropertyType extends TraitType[Key],
    >(identifier: Key, type: PropertyConstraints<PropertyType>) {
        this.property(
            identifier,
            type,
            (trait) => trait[identifier],
            (trait, value) => (trait[identifier] = value),
        );
    }

    serializer(
        serializer: (
            app: GameModelApp,
        ) => TraitSerializer<TraitType, AnySerialized>,
    ) {
        this._serializer = serializer;
    }

    configurable(configurable: (trait: TraitType) => Configurable) {
        this._configurable = configurable;
    }

    build(): TraitRegistryEntry<TraitType> {
        return {
            key: this._key,
            category: this._category,
            newTrait: this._newTrait,
            serializer: this._serializer,
            properties: this._properties,
            configurable: this._configurable,
        };
    }
}

export function traitRegistryEntry<TraitType extends Trait>(
    makeEntry: (builder: TraitRegistryEntryBuilder<TraitType>) => void,
): TraitRegistryEntry<TraitType> {
    const builder = new TraitRegistryEntryBuilder<TraitType>();
    makeEntry(builder);
    return builder.build();
}

export default class TraitRegistry
    implements Registry<AnyTraitRegistryEntry<any>>
{
    private readonly entries = new Map<string, TraitRegistryEntry<any>>();

    add<T extends Trait>(
        entry: AnyTraitRegistryEntry<T>,
    ): AnyTraitRegistryEntry<T> {
        const autoEntry = entry as AutoRegistryEntry<T>;
        const manualEntry = entry as TraitRegistryEntry<T>;

        if (autoEntry.traitType) {
            return this.add(
                traitRegistryEntry<T>((builder) => {
                    builder.traitClass(autoEntry.traitType);
                    builder.category(autoEntry.category);

                    for (const property of autoEntry.properties || []) {
                        builder.property(
                            property.localIdentifier,
                            property.type,
                            (trait) => property.get(trait.entity),
                            (trait, value) => property.set(trait.entity, value),
                        );
                    }
                }),
            );
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
                    autoConfigurable.add(
                        property.identifier,
                        propertyValueConfigurable(
                            trait.entity!.world,
                            property.type,
                            () => property.get(trait.entity!),
                            (value) => property.set(trait.entity!, value),
                        ),
                    );
                }
                return autoConfigurable;
            };
        }
    }

    entry(key: string): TraitRegistryEntry<any> | null {
        return this.entries.get(key) || null;
    }

    keys(): Iterable<string> {
        return this.entries.keys();
    }
}
