import { KeyProvider } from '../key-provider';
import { Trait } from "..";
import Entity from "../entity";
import { WorldEvent } from '../events/world-event';
import { PropertyConstraints, PropertyType } from './property-constraints';

export interface GenericProperty<OwnerType, ValueType> {
    readonly identifier: string;
    readonly type: PropertyConstraints;
    get(entity: OwnerType): ValueType;
    set(entity: OwnerType, value: ValueType): void;
}

export interface Property<ValueType> extends GenericProperty<Entity, ValueType> {}
export interface WorldEventProperty<ValueType> extends GenericProperty<WorldEvent, ValueType> {}

export function getSet<ValueType>(
    identifier: string,
    type: PropertyConstraints,
    get: (entity: Entity) => ValueType,
    set: (entity: Entity, value: ValueType) => void,
): Property<ValueType> {
    return { identifier, type, get, set };
}

export function traitGetSet<T extends Trait, ValueType>(
    traitType: (new (...params: any) => T) & KeyProvider,
    identifier: string,
    type: PropertyConstraints,
    get: (trait: T) => ValueType,
    set: (trait: T, value: ValueType) => void,
): Property<ValueType> {
    return {
        'identifier': traitType.key + '.' + identifier,
        type,
        'get': (entity) => get(entity.traitOfType(traitType) as T),
        'set': (entity, value) => set(entity.traitOfType(traitType) as T, value),
    };
}

export function worldEventGetSet<T extends WorldEvent, ValueType>(
    eventType: (new (...params: any) => T) & KeyProvider,
    identifier: string,
    type: PropertyConstraints,
    get: (event: T) => ValueType,
    set: (event: T, value: ValueType) => void,
): WorldEventProperty<ValueType> {
    return { 
        'identifier': eventType.key + '.' + identifier,
        type, 
        get, 
        set, 
    };
}

export function traitEnabledProperty(key: string) : Property<boolean> {
    return {
        'identifier': key + '.enabled',
        'type': PropertyType.bool(),
        'get': entity => entity.trait(key)!.enabled,
        'set': (entity, enabled) => entity.trait(key)!.enabled = enabled,
    };
}
