import { TraitSerializer, AnySerialized } from './serialization/serializer';
import Trait from "./trait";

export interface RegistryEntry<TraitType extends Trait> {
    readonly key: string;
    newTrait(): TraitType;
    serializer(): TraitSerializer<TraitType, AnySerialized>;
}

export default class TraitRegistry {
    private readonly entries = new Map<string, RegistryEntry<any>>();

    add(entry: RegistryEntry<any>): this {
        if (this.entries.has(entry.key)) {
            throw new Error(`Entry conflict for key ${entry.key}`);
        }
        this.entries.set(entry.key, entry);
        return this;
    }

    entry(key: string): RegistryEntry<any> | null {
        return this.entries.get(key) || null;
    }

    keys(): Iterable<string> {
        return this.entries.keys();
    }
}
