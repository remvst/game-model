import { TraitSerializer, AnySerialized } from './serialization/serializer';
import Trait from "./trait";
export interface RegistryEntry<TraitType extends Trait> {
    readonly key: string;
    newTrait(): TraitType;
    serializer(): TraitSerializer<TraitType, AnySerialized>;
}
export default class TraitRegistry {
    private readonly entries;
    add(entry: RegistryEntry<any>): this;
    entry(key: string): RegistryEntry<any> | null;
    keys(): Iterable<string>;
}
