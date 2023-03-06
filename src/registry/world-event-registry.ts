import Entity from '../entity';
import World from '../world';
import { WorldEventSerializer } from '../serialization/serializer';
import { KeyProvider, PropertyRegistry, WorldEvent } from '..';
import { CompositeConfigurable, Configurable } from '@remvst/configurable';
import { AnySerialized } from '../serialization/serializer';
import { WorldEventProperty } from '../properties/properties';
import { propertyValueConfigurable } from '../configurable/property-value-configurable';
import AutomaticWorldEventSerializer from '../serialization/automatic-world-event-serializer';

export interface AutoWorldEventRegistryEntry<EventType extends WorldEvent> {
    readonly eventType: (new () => EventType) & KeyProvider;
    readonly category?: string;
    readjust?: (event: EventType, entity: Entity, triggererId: string) => void;
    properties?: WorldEventProperty<any>[];
}

export interface WorldEventRegistryEntry<EventType extends WorldEvent> {
    readonly key: string;
    readonly category?: string;
    newEvent(): EventType;
    serializer(entry: WorldEventRegistryEntry<EventType>): WorldEventSerializer<EventType, AnySerialized>;
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
                        property.type,
                        () => property.get(event),
                        (value) => property.set(event, value),
                    ));
                }
                return autoConfigurable;
            };
        }

        return this;
    }

    addAuto<T extends WorldEvent>(entry: AutoWorldEventRegistryEntry<T>): this {
        return this.add({
            key: entry.eventType.key,
            category: entry.category,
            newEvent: () => new entry.eventType(),
            serializer: (entry) => new AutomaticWorldEventSerializer(entry),
            properties: entry.properties,
        });
    }

    entry(key: string): WorldEventRegistryEntry<any> | null {
        return this.entries.get(key) || null;
    }

    keys(): Iterable<string> {
        return this.entries.keys();
    }
}
