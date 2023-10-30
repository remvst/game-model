import Entity from '../entity';
import World from '../world';
import { WorldEventSerializer } from '../serialization/serializer';
import { KeyProvider, PropertyRegistry, WorldEvent } from '..';
import { CompositeConfigurable, Configurable } from '@remvst/configurable';
import { AnySerialized } from '../serialization/serializer';
import { WorldEventProperty } from '../properties/properties';
import { propertyValueConfigurable } from '../configurable/property-value-configurable';
import AutomaticWorldEventSerializer from '../serialization/automatic-world-event-serializer';
import { Registry } from './registry';

export interface AutoWorldEventRegistryEntry<EventType extends WorldEvent> {
    readonly eventType: (new () => EventType) & KeyProvider;
    readonly category?: string;
    readjust?: (event: EventType, world: World, entity: Entity, triggererId: string) => void;
    properties?: WorldEventProperty<any>[];
}

export interface WorldEventRegistryEntry<EventType extends WorldEvent> {
    readonly key: string;
    readonly category?: string;
    newEvent(): EventType;
    serializer(entry: WorldEventRegistryEntry<EventType>): WorldEventSerializer<EventType, AnySerialized>;
    readjust?: (event: EventType, world: World, entity: Entity, triggererId: string) => void;
    configurable?: (event: EventType, world: World) => Configurable;
    properties?: WorldEventProperty<any>[];
}

export type AnyWorldEventRegistryEntry<EventType extends WorldEvent> =
    WorldEventRegistryEntry<EventType> |
    AutoWorldEventRegistryEntry<EventType>;

export default class WorldEventRegistry implements Registry<WorldEventRegistryEntry<any>> {
    private readonly entries = new Map<string, WorldEventRegistryEntry<any>>();

    add<T extends WorldEvent>(entry: AnyWorldEventRegistryEntry<T>) {
        const autoEntry = entry as AutoWorldEventRegistryEntry<T>;
        const manualEntry = entry as WorldEventRegistryEntry<T>;

        if (autoEntry.eventType) {
            return this.add({
                key: autoEntry.eventType.key,
                category: autoEntry.category,
                newEvent: () => new autoEntry.eventType(),
                serializer: (autoEntry) => new AutomaticWorldEventSerializer(autoEntry),
                properties: autoEntry.properties,
            });
        }

        if (this.entries.has(manualEntry.key)) {
            throw new Error(`Entry conflict for key ${manualEntry.key}`);
        }
        this.entries.set(manualEntry.key, manualEntry);

        // In case no configurable was defined, add a default one
        if (!manualEntry.configurable) {
            manualEntry.configurable = (event, world) => {
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

        return manualEntry;
    }

    entry(key: string): WorldEventRegistryEntry<any> | null {
        return this.entries.get(key) || null;
    }

    keys(): Iterable<string> {
        return this.entries.keys();
    }
}
