'use strict';

import { Subject } from 'rxjs';

import WatchableObjectSet from './collections/watchable-object-set';
import ObjectSet from './collections/object-set';
import Entity from './entity';
import Event from './event';

export default class World {

    readonly events: Subject<Event>;
    readonly entities: WatchableObjectSet<Entity>;

    constructor() {
        this.entities = new WatchableObjectSet(new ObjectSet(
            entity => entity.id,
            entity => entity.traits.map(trait => trait.key)
        ));
        this.entities.additions.subscribe(entity => entity.bind(this));
        this.entities.removals.subscribe(object => object.unbind());

        this.events = new Subject();
    }

    cycle(elapsed: number) {
        this.entities.forEach(entity => {
            entity.cycle(elapsed);
        });
    }

    addEvent(event: Event) {
        event.apply(this);
        this.events.next(event);
    }

    entity(entityId: string) {
        return this.entities.getByKey(entityId);
    }

};
