import { Subject } from 'rxjs';
import WatchableObjectSet from './collections/watchable-object-set';
import Entity from './entity';
import { WorldEvent } from './world-event';
export default class World {
    readonly events: Subject<WorldEvent>;
    readonly entities: WatchableObjectSet<Entity>;
    constructor();
    cycle(elapsed: number): void;
    addEvent(event: WorldEvent): void;
    entity(entityId: string): Entity | null;
}
