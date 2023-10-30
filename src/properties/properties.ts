import { KeyProvider } from '../key-provider';
import { Trait } from "..";
import Entity from "../entity";
import { WorldEvent } from '../events/world-event';
import { PropertyConstraints, PropertyType } from './property-constraints';

export interface GenericProperty<OwnerType, ValueType> {
    readonly identifier: string;
    readonly localIdentifier?: string;
    readonly type: PropertyConstraints<ValueType>;
    get(entity: OwnerType): ValueType;
    set(entity: OwnerType, value: ValueType): void;
}

export enum EntityPropertyType {
    GENERAL_ENTITY,
    GENERAL_TRAIT,
    SPECIFIC_TRAIT,
}

export interface Property<ValueType> extends GenericProperty<Entity, ValueType> {
    readonly entityPropertyType: EntityPropertyType;
}

export interface WorldEventProperty<ValueType> extends GenericProperty<WorldEvent, ValueType> {}

export function getSet<ValueType>(
    identifier: string,
    type: PropertyConstraints<ValueType>,
    get: (entity: Entity) => ValueType,
    set: (entity: Entity, value: ValueType) => void,
): Property<ValueType> {
    return {
        identifier,
        entityPropertyType: EntityPropertyType.GENERAL_ENTITY,
        type,
        get,
        set,
    };
}

export function traitGetSet<T extends Trait, ValueType>(
    traitType: (new (...params: any) => T) & KeyProvider,
    identifier: string,
    type: PropertyConstraints<ValueType>,
    get: (trait: T) => ValueType,
    set: (trait: T, value: ValueType) => void,
): Property<ValueType> {
    return {
        identifier: traitType.key + '.' + identifier,
        localIdentifier: identifier,
        entityPropertyType: EntityPropertyType.SPECIFIC_TRAIT,
        type,
        get: (entity) => get(entity.traitOfType(traitType) as T),
        set: (entity, value) => set(entity.traitOfType(traitType) as T, value),
    };
}

export function worldEventGetSet<T extends WorldEvent, ValueType>(
    eventType: (new (...params: any) => T) & KeyProvider,
    identifier: string,
    type: PropertyConstraints<ValueType>,
    get: (event: T) => ValueType,
    set: (event: T, value: ValueType) => void,
): WorldEventProperty<ValueType> {
    return {
        identifier: eventType.key + '.' + identifier,
        localIdentifier: identifier,
        type,
        get,
        set,
    };
}

export function traitEnabledProperty(key: string): Property<boolean> {
    return {
        identifier: key + '.enabled',
        localIdentifier: 'enabled',
        type: PropertyType.bool(),
        entityPropertyType: EntityPropertyType.GENERAL_TRAIT,
        get: entity => entity.trait(key)!.enabled,
        set: (entity, enabled) => entity.trait(key)!.enabled = enabled,
    };
}
