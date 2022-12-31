import { Subject } from 'rxjs';

import WatchableObjectSet from './collections/watchable-object-set';
import ObjectSet from './collections/object-set';
import Entity from './entity';
import { WorldEvent } from './events/world-event';
import EntityRemoved from './events/entity-removed';
import Trait from './trait';
import SectorObjectSet from './collections/sector-object-set';
import { KeyProvider  } from './key-provider';
import { CyclePerformanceTracker } from './performance-tracker';

type EntityRelevanceProvider = (entity: Entity) => boolean;

export default class World {

    readonly events: Subject<WorldEvent>;
    readonly entities: WatchableObjectSet<Entity>;

    private readonly reusableRemoveEvent = new EntityRemoved();
    private readonly sectorSets = new Map<string, SectorObjectSet<Entity>>();

    cyclePerformanceTracker: CyclePerformanceTracker | null = null;
    entityRelevanceProvider: EntityRelevanceProvider = () => true;

    constructor() {
        this.entities = new WatchableObjectSet(new ObjectSet(
            entity => entity.id,
            entity => entity.traits.map(trait => trait.key)
        ));
        this.entities.additions.subscribe(entity => entity.bind(this));
        this.entities.removals.subscribe(entity => {
            entity.addEvent(this.reusableRemoveEvent);
            entity.unbind();
        });

        this.events = new Subject();
    }

    defineSectorSet(key: string, sectorSize: number) {
        if (this.sectorSets.has(key)) {
            return;
        }
        const sectorSet = new SectorObjectSet<Entity>(sectorSize);
        this.sectorSets.set(key, sectorSet);
    }

    sectorSet(key: string): SectorObjectSet<Entity> | null {
        return this.sectorSets.get(key) || null;
    }

    private resetSectors() {
        for (const set of this.sectorSets.values()) {
            set.clear();
        }
    }

    cycle(elapsed: number) {
        this.resetSectors();
        for (const entity of this.entities.items()) {
            entity.preCycle();
        }
        for (const entity of this.entities.items()) {
            if (this.entityRelevanceProvider(entity)) {
                entity.cycle(elapsed);
            }
        }
        for (const entity of this.entities.items()) {
            if (this.entityRelevanceProvider(entity)) {
                entity.postCycle();
            }
        }
    }

    addEvent(event: WorldEvent) {
        event.apply(this);
        this.events.next(event);
    }

    entity(entityId: string) {
        return this.entities.getByKey(entityId);
    }

    * traitsOfType<T extends Trait>(keyProvider: (new (...params: any) => T) & KeyProvider): Iterable<T> {
        const key = keyProvider.key;
        if (!key) {
            throw new Error('Provided trait type does not have a statically defined key');
        }
        for (const value of this.entities.bucket(key)) {
            yield value.traitOfType(keyProvider)!;
        }
    }
};
