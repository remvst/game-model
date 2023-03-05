import Entity from '../entity';
import World from '../world';
import { WorldEventSerializer } from '../serialization/serializer';
import { PropertyRegistry, WorldEvent } from '..';
import { CompositeConfigurable, Configurable } from '@remvst/configurable';
import { AnySerialized } from '../serialization/serializer';
import { WorldEventProperty } from '../properties';
import { propertyValueConfigurable } from '../configurable-utils';

export interface WorldEventRegistryEntry<EventType extends WorldEvent> {
    readonly key: string;
    readonly category?: string;
    newEvent(): EventType;
    serializer(): WorldEventSerializer<EventType, AnySerialized>;
    readjust?: (event: EventType, entity: Entity, triggererId: string) => void;
    configurable?: (event: EventType, world: World) => Configurable;
    properties?: WorldEventProperty<any>[];
}

export default class WorldEventRegistry {
    private readonly entries = new Map<string, WorldEventRegistryEntry<any>>();
    readonly properties = new PropertyRegistry<WorldEventProperty<any>>();

    add<T extends WorldEvent>(entry: WorldEventRegistryEntry<T>): this {
        if (this.entries.has(entry.key)) {
            throw new Error(`Entry conflict for key ${entry.key}`);
        }
        this.entries.set(entry.key, entry);

        // In case no configurable was defined, add a default one
        if (!entry.configurable) {
            entry.configurable = (event, world) => {
                const autoConfigurable = new CompositeConfigurable();
                for (const property of entry.properties || []) {
                    autoConfigurable.add(property.identifier, propertyValueConfigurable(
                        world,
                        property,
                        () => property.get(event),
                        (value) => property.set(event, value),
                    ));
                }
                return autoConfigurable;
            };
        }

        return this;
    }

    entry(key: string): WorldEventRegistryEntry<any> | null {
        return this.entries.get(key) || null;
    }

    keys(): Iterable<string> {
        return this.entries.keys();
    }
}
