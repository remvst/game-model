import { Subject } from "rxjs";

import { Rectangle } from "@remvst/geometry";
import { ChunkedEntitySet } from "./chunked-entity-set";
import { ObjectSet } from "./collections/object-set";
import { SectorObjectSet } from "./collections/sector-object-set";
import { WatchableObjectSet } from "./collections/watchable-object-set";
import { Entity } from "./entity";
import { EntityRemoved } from "./events/entity-removed";
import { WorldEvent } from "./events/world-event";
import { KeyProvider } from "./key-provider";
import {
    Authority,
    AuthorityType,
    LocalAuthority,
} from "./multiplayer/authority";
import { CyclePerformanceTracker } from "./performance-tracker";
import { Trait } from "./trait";

const REUSABLE_RECT = new Rectangle();

export class World {
    readonly events: Subject<WorldEvent>;
    readonly entities: WatchableObjectSet<Entity>;

    readonly chunked: ChunkedEntitySet;

    private readonly reusableRemoveEvent = new EntityRemoved();
    private readonly sectorSets = new Map<string, SectorObjectSet<Entity>>();

    private cycleCount = 0;

    cyclePerformanceTracker: CyclePerformanceTracker | null = null;
    isEntityEnabled: (entity: Entity) => boolean = () => true;
    entityTimeFactorProvider: (entity: Entity) => number = () => 1;

    authority: Authority = new LocalAuthority();

    constructor() {
        this.entities = new WatchableObjectSet(
            new ObjectSet(
                (entity) => entity.id,
                (entity) => entity.traits.map((trait) => trait.key),
            ),
        );
        this.entities.allowAddition = (entity) => {
            switch (this.authority.entityAuthority(entity)) {
                case AuthorityType.NONE:
                case AuthorityType.FORWARD:
                    return false;
                case AuthorityType.FULL:
                case AuthorityType.LOCAL:
                    return true;
            }
        };
        this.entities.additions.subscribe((entity) => entity.bind(this));
        this.entities.removals.subscribe((entity) => {
            entity.addEvent(this.reusableRemoveEvent);
            entity.unbind();
        });

        this.chunked = new ChunkedEntitySet(this.entities);

        this.events = new Subject();
    }

    defineSectorSet(key: string) {
        if (this.sectorSets.has(key)) {
            return;
        }
        const sectorSet = new SectorObjectSet<Entity>();
        this.sectorSets.set(key, sectorSet);
    }

    sectorSet(key: string): SectorObjectSet<Entity> | null {
        const sectorSet = this.sectorSets.get(key);
        if (!sectorSet) return null;

        // Make sure the sector set is up to date
        if (sectorSet.version !== this.cycleCount) {
            // Make sure the sector's area is reset
            sectorSet.area.setBounds(0, 0, 1, 1);

            // Update the size of the sector set
            let i = 0;
            for (const entity of this.entities.bucket(key)) {
                const trait = entity.trait(key)!;
                trait.surfaceProvider.surface(trait, REUSABLE_RECT);
                if (i === 0) {
                    sectorSet.area.copy(REUSABLE_RECT);
                } else {
                    sectorSet.area.combineBounds(REUSABLE_RECT);
                }
                i++;
            }

            sectorSet.clear();
            sectorSet.version = this.cycleCount;

            for (const entity of this.entities.bucket(key)) {
                entity.trait(key)!.makeQueriable(sectorSet);
            }
        }

        return sectorSet;
    }

    cycle(elapsed: number) {
        this.cycleCount++;

        // this.resetSectors();
        this.chunked.update();

        for (const entity of this.entities.items()) {
            entity.preCycle();
        }
        for (const entity of Array.from(this.chunked.entities.items())) {
            if (!this.isEntityEnabled(entity)) continue;
            entity.cycle(elapsed);
        }
        for (const entity of this.chunked.entities.items()) {
            if (!this.isEntityEnabled(entity)) continue;
            entity.postCycle();
        }
    }

    addEvent(event: WorldEvent, authority: Authority = this.authority) {
        switch (authority.worldEventAuthority(event)) {
            case AuthorityType.NONE:
                return;
            case AuthorityType.FULL:
            case AuthorityType.LOCAL:
            case AuthorityType.FORWARD:
                break;
        }

        event.apply(this);
        this.events.next(event);
    }

    entity(entityId: string) {
        return this.entities.getByKey(entityId);
    }

    *traitsOfType<T extends Trait>(
        keyProvider: (new (...params: any) => T) & KeyProvider,
    ): Iterable<T> {
        const key = keyProvider.key;
        if (!key) {
            throw new Error(
                "Provided trait type does not have a statically defined key",
            );
        }
        for (const value of this.entities.bucket(key)) {
            yield value.traitOfType(keyProvider)!;
        }
    }
}
