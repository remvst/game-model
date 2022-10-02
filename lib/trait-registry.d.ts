import { Configurable } from '@remvst/configurable';
import { TraitSerializer, AnySerialized } from './serialization/serializer';
import Trait from "./trait";
export interface RegistryEntry<TraitType extends Trait> {
    readonly key: string;
    newTrait(): TraitType;
    serializer?(): TraitSerializer<TraitType, AnySerialized>;
    configurable?: (trait: TraitType) => Configurable;
}
export default class TraitRegistry {
    private readonly entries;
    add(entry: RegistryEntry<any>): this;
    entry(key: string): RegistryEntry<any> | null;
    keys(): Iterable<string>;
}
