import { EntityFilter, EntityFilters } from './configurable/entity-filter';
import { KeyProvider } from './key-provider';
import { Trait } from ".";
import Entity from "./entity";
import { WorldEvent } from './events/world-event';

export interface GenericProperty<OwnerType, ValueType> {
    readonly identifier: string;
    readonly type: PropertyConstraints;
    get(entity: OwnerType): ValueType;
    set(entity: OwnerType, value: ValueType): void;
}

export interface Property<ValueType> extends GenericProperty<Entity, ValueType> {}
export interface WorldEventProperty<ValueType> extends GenericProperty<WorldEvent, ValueType> {}

export class PropertyType {
    static num(min?: number, max?: number, step?: number): PropertyConstraints { 
        return new NumberConstraints(min, max, step); 
    }

    static id(filter: EntityFilter = EntityFilters.any()): PropertyConstraints { 
        return new EntityIdConstraints(filter); 
    }

    static list(itemType: PropertyConstraints): PropertyConstraints { 
        return new ListConstraints(itemType); 
    }
    
    static bool(): PropertyConstraints { return new BooleanConstraints(); }
    static str(): PropertyConstraints { return new StringConstraints(); }
    static color(): PropertyConstraints { return new ColorConstraints(); }
} 

export abstract class PropertyConstraints {
    validate(value: any) {}
}

export class NumberConstraints extends PropertyConstraints {
    constructor(
        readonly min?: number,
        readonly max?: number,
        readonly step?: number,
    ) {
        super();
    }
}

export class StringConstraints extends PropertyConstraints {

}

export class BooleanConstraints extends PropertyConstraints {

}

export class EntityIdConstraints extends PropertyConstraints {
    constructor(
        readonly filter: EntityFilter = EntityFilters.any(),
    ) {
        super();
    }
}

export class ColorConstraints extends PropertyConstraints {

}

export class ListConstraints extends PropertyConstraints {
    constructor(readonly itemType: PropertyConstraints) {
        super();
    }
}

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
