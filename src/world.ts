'use strict';

import { Subject } from 'rxjs';

import WatchableObjectSet from './collections/watchable-object-set';
import ObjectSet from './collections/object-set';
import Entity from './entity';
import { WorldEvent } from './events/world-event';
import EntityRemoved from './events/entity-removed';

export default class World {

    readonly events: Subject<WorldEvent>;
    readonly entities: WatchableObjectSet<Entity>;

    private readonly reusableRemoveEvent = new EntityRemoved();

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

    cycle(elapsed: number) {
        this.entities.forEach((entity) => {
            entity.cycle(elapsed);
        });

        this.entities.forEach((entity) => {
            entity.postCycle();
        });
    }

    addEvent(event: WorldEvent) {
        event.apply(this);
        this.events.next(event);
    }

    entity(entityId: string) {
        return this.entities.getByKey(entityId);
    }

};
