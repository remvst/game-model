import { Subject } from 'rxjs';
import WatchableObjectSet from './collections/watchable-object-set';
import Entity from './entity';
import { WorldEvent } from './events/world-event';
import Trait from './trait';
import SectorObjectSet from './collections/sector-object-set';
import { KeyProvider } from './key-provider';
export default class World {
    readonly events: Subject<WorldEvent>;
    readonly entities: WatchableObjectSet<Entity>;
    private readonly reusableRemoveEvent;
    private readonly sectorSets;
    constructor();
    sectorSet(key: string, sectorSize: number): SectorObjectSet<Entity>;
    private resetSectors;
    cycle(elapsed: number): void;
    addEvent(event: WorldEvent): void;
    entity(entityId: string): Entity | null;
    traitsOfType<T extends Trait>(keyProvider: (new (...params: any) => T) & KeyProvider): Iterable<T>;
}
