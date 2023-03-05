import { EntityFilter, EntityFilters } from "../configurable/entity-filter";

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

    static enum<T>(values: T[]): PropertyConstraints {
        return new EnumConstraints(values);
    }
    
    static bool(): PropertyConstraints { return new BooleanConstraints(); }
    static str(): PropertyConstraints { return new StringConstraints(); }
    static color(): PropertyConstraints { return new ColorConstraints(); }
} 

export abstract class PropertyConstraints {
    abstract defaultValue(): any
}

export class NumberConstraints extends PropertyConstraints {
    constructor(
        readonly min?: number,
        readonly max?: number,
        readonly step?: number,
    ) {
        super();
    }

    defaultValue() {
        return this.min || 0;
    }
}

export class StringConstraints extends PropertyConstraints {
    defaultValue() {
        return '';
    }
}

export class BooleanConstraints extends PropertyConstraints {
    defaultValue() {
        return false;
    }
}

export class EntityIdConstraints extends PropertyConstraints {
    constructor(
        readonly filter: EntityFilter = EntityFilters.any(),
    ) {
        super();
    }

    defaultValue() {
        return '';
    }
}

export class ColorConstraints extends PropertyConstraints {
    defaultValue() {
        return 0xff0000;
    }
}

export class ListConstraints extends PropertyConstraints {
    constructor(readonly itemType: PropertyConstraints) {
        super();
    }

    defaultValue() {
        return [];
    }
}

export class EnumConstraints<T> extends PropertyConstraints {
    constructor(readonly values: T[]) {
        super();
    }

    defaultValue() {
        return this.values[0];
    }
}
