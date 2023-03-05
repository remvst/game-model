import Entity from "../entity";

export type EntityFilter = (entity: Entity) => boolean;

export class EntityFilters {
    static and(...filters: EntityFilter[]): EntityFilter {
        return (entity: Entity) => {
            for (const filter of filters) {
                if (!filter(entity)) {
                    return false;
                }
            }
            return true;
        };
    }
    
    static or(...filters: EntityFilter[]): EntityFilter {
        return (entity: Entity) => {
            for (const filter of filters) {
                if (filter(entity)) {
                    return true;
                }
            }
            return false;
        };
    }
    
    static trait(key: string): EntityFilter {
        return (entity: Entity) => !!entity.trait(key);
    }
    
    static id(id: string): EntityFilter {
        return (entity: Entity) => entity.id === id;
    }
    
    static not(filter: EntityFilter): EntityFilter {
        return (entity: Entity) => !filter(entity);
    }

    static any(): EntityFilter {
        return () => true;
    }
}

export const MINIMUM_ENTITY_SELECTION_FILTER = EntityFilters.any();

