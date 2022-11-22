import Entity from '../entity';
import World from '../world';
import { WorldEventSerializer } from '../serialization/serializer';
import { WorldEvent } from '..';
import { Configurable } from '@remvst/configurable';
import { AnySerialized } from '../serialization/serializer';

export interface WorldEventRegistryEntry<EventType extends WorldEvent> {
    readonly key: string;
    newEvent(): EventType;
    serializer(): WorldEventSerializer<EventType, AnySerialized>;
    readjust?: (event: EventType, entity: Entity, triggererId: string) => void;
    configurable?: (event: EventType, world: World) => Configurable;
}

export default class WorldEventRegistry {
    private readonly entries = new Map<string, WorldEventRegistryEntry<any>>();

    add<T extends WorldEvent>(entry: WorldEventRegistryEntry<T>): this {
        if (this.entries.has(entry.key)) {
            throw new Error(`Entry conflict for key ${entry.key}`);
        }
        this.entries.set(entry.key, entry);
        return this;
    }

    entry(key: string): WorldEventRegistryEntry<any> | null {
        return this.entries.get(key) || null;
    }

    keys(): Iterable<string> {
        return this.entries.keys();
    }
}
