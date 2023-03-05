import { KeyProvider } from './key-provider';
import { Trait } from ".";
import Entity from "./entity";

export interface Property<ValueType> {
    readonly identifier: string;
    readonly type: PropertyType;
    get(entity: Entity): ValueType;
    set(entity: Entity, value: ValueType): void;
    constraints?: PropertyConstraints;
}

export enum PropertyType {
    NUMBER,
    BOOLEAN,
    STRING,
    COLOR,
    ENTITY_ID,
}

export class NumberPropertyConstraints {
    constructor(
        readonly min?: number,
        readonly max?: number,
        readonly step?: number,
    ) {

    }
}

export type PropertyConstraints = NumberPropertyConstraints;

export function getSet<ValueType>(
    identifier: string,
    type: PropertyType,
    get: (entity: Entity) => ValueType,
    set: (entity: Entity, value: ValueType) => void,
    constraints?: PropertyConstraints,
): Property<ValueType> {
    return { identifier, type, get, set, constraints };
}

export function traitGetSet<T extends Trait, ValueType>(
    traitType: (new (...params: any) => T) & KeyProvider,
    identifier: string,
    type: PropertyType,
    get: (trait: T) => ValueType,
    set: (trait: T, value: ValueType) => void,
    constraints?: PropertyConstraints,
): Property<ValueType> {
    return {
        'identifier': traitType.key + '.' + identifier,
        'type': type,
        'get': (entity) => get(entity.traitOfType(traitType) as T),
        'set': (entity, value) => set(entity.traitOfType(traitType) as T, value),
        constraints,
    };
}

export function traitEnabledProperty(key: string) : Property<boolean> {
    return {
        'identifier': key + '.enabled',
        'type': PropertyType.BOOLEAN,
        'get': entity => entity.trait(key)!.enabled,
        'set': (entity, enabled) => entity.trait(key)!.enabled = enabled,
    };
}
