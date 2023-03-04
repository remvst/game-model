import { Property, traitEnabledProperty } from './properties';
import { Configurable } from '@remvst/configurable';
import { TraitSerializer, AnySerialized } from './serialization/serializer';
import Trait from "./trait";
import PropertyRegistry from './property-registry';

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
    readonly properties = new PropertyRegistry();

    add(entry: RegistryEntry<any>): this {
        if (this.entries.has(entry.key)) {
            throw new Error(`Entry conflict for key ${entry.key}`);
        }
        this.entries.set(entry.key, entry);

        const properties = entry.properties || [];
        properties.push(traitEnabledProperty(entry.key));

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
