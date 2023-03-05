import { EntityFilter, EntityFilters } from "../configurable/entity-filter";

export class PropertyType {
    static num(min?: number, max?: number, step?: number) { 
        return new NumberConstraints(min, max, step); 
    }

    static id(filter: EntityFilter = EntityFilters.any()) { 
        return new EntityIdConstraints(filter); 
    }

    static list<T>(itemType: PropertyConstraints<T>) { 
        return new ListConstraints(itemType); 
    }

    static enum<T>(values: T[], enumToken: any) {
        return new EnumConstraints(values, enumToken);
    }

    static composite(properties: Map<string, PropertyConstraints<any>>) {
        return new CompositeConstraints(properties);
    }
    
    static bool() { return new BooleanConstraints(); }
    static str() { return new StringConstraints(); }
    static color() { return new ColorConstraints(); }
} 

export abstract class PropertyConstraints<T> {
    abstract defaultValue(): T;
    abstract convert(value: any): T;
}

export class NumberConstraints extends PropertyConstraints<number> {
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

    convert(value: any): number {
        return parseFloat(value) || this.min || 0;
    }
}

export class StringConstraints extends PropertyConstraints<string> {
    defaultValue() {
        return '';
    }

    convert(value: any): string {
        return value ? value.toString() : '';
    }
}

export class BooleanConstraints extends PropertyConstraints<boolean> {
    defaultValue() {
        return false;
    }

    convert(value: any) {
        return !!value;
    }
}

export class EntityIdConstraints extends PropertyConstraints<string> {
    constructor(
        readonly filter: EntityFilter = EntityFilters.any(),
    ) {
        super();
    }

    defaultValue() {
        return '';
    }

    convert(value: any): string {
        return value ? value.toString() : '';
    }
}

export class ColorConstraints extends PropertyConstraints<number> {
    defaultValue() {
        return 0xff0000;
    }

    convert(value: any) {
        return parseInt(value) || 0;
    }
}

export class ListConstraints<T> extends PropertyConstraints<T[]> {
    constructor(readonly itemType: PropertyConstraints<T>) {
        super();
    }

    defaultValue() {
        return [];
    }

    convert(value: any) {
        return Array.isArray(value) ? value.map((item) => this.itemType.convert(item)) : [];
    }
}

export class EnumConstraints<T> extends PropertyConstraints<T> {
    constructor(
        readonly values: T[], 
        readonly enumToken?: any,
    ) {
        super();
    }

    defaultValue() {
        return this.values[0];
    }

    convert(value: any) {
        return this.values.indexOf(value) >= 0 ? value : this.defaultValue();
    }
}

export class CompositeConstraints extends PropertyConstraints<any> {
    constructor(readonly properties: Map<string, PropertyConstraints<any>>) {
        super();
    }

    defaultValue() {
        const res: any = {};
        for (const [key, type] of this.properties.entries()) {
            res[key] = type.defaultValue();
        }
        return res;
    }

    convert(_: any) {
        return this.defaultValue();
    }
}
