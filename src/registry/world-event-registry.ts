import Entity from '../entity';
import World from '../world';
import { TraitSerializer, WorldEventSerializer } from '../serialization/serializer';
import { GameModelApp, KeyProvider, PropertyConstraints, WorldEvent } from '..';
import { CompositeConfigurable, Configurable } from '@remvst/configurable';
import { AnySerialized } from '../serialization/serializer';
import { EntityPropertyType, Property, WorldEventProperty } from '../properties/properties';
import { propertyValueConfigurable } from '../configurable/property-value-configurable';
import AutomaticWorldEventSerializer from '../serialization/automatic-world-event-serializer';
import { Registry } from './registry';
import { TraitRegistryEntry } from './trait-registry';

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
    serializer(app: GameModelApp): WorldEventSerializer<EventType, AnySerialized>;
    readjust?: (event: EventType, world: World, entity: Entity, triggererId: string) => void;
    configurable?: (app: GameModelApp, event: EventType, world: World) => Configurable;
    properties?: WorldEventProperty<any>[];
}

export type AnyWorldEventRegistryEntry<EventType extends WorldEvent> =
    WorldEventRegistryEntry<EventType> |
    AutoWorldEventRegistryEntry<EventType>;

class WorldEventRegistryEntryBuilder<EventType extends WorldEvent & KeyProvider> {

    private _key: string = null;
    private _newEvent: () => EventType = null;
    private _category: string = null;
    private _serializer: (app: GameModelApp) => WorldEventSerializer<EventType, AnySerialized> = null;
    private _configurable: (app: GameModelApp, trait: EventType, world: World) => Configurable;
    private _readjust: (event: EventType, world: World, entity: Entity, triggererId: string) => void;
    private readonly _properties: WorldEventProperty<any>[] = [];

    constructor() {
        this.serializer((app: GameModelApp) => {
            const entry = app.worldEventRegistry.entry(this._key);
            return new AutomaticWorldEventSerializer(entry)
        });

        this.configurable((app: GameModelApp, event: EventType, world: World) => {
            const entry = app.worldEventRegistry.entry(this._key);
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
        });
    }

    eventClass(eventClass: (new () => EventType) & KeyProvider): void {
        this.key(eventClass.key);
        this.newEvent(() => new eventClass());
    }

    key(key: string) {
        this._key = key;
    }

    newEvent(newEvent: () => EventType) {
        this._newEvent = newEvent;
    }

    category(category: string): void {
        this._category = category;
    }

    property<PropertyType>(
        identifier: string,
        type: PropertyConstraints<PropertyType>,
        get: (event: EventType) => PropertyType,
        set: (event: EventType, value: PropertyType) => void,
    ): void {
        const eventKey = this._key;
        this._properties.push({
            identifier: eventKey + '.' + identifier,
            localIdentifier: identifier,
            type,
            get: (event) => get(event as EventType),
            set: (event, value) => set(event as EventType, value),
        });
    }

    simpleProp<Key extends string & keyof EventType, PropertyType extends EventType[Key]>(
        identifier: Key,
        type: PropertyConstraints<PropertyType>,
    ) {
        this.property(
            identifier,
            type,
            (trait) => trait[identifier],
            (trait, value) => trait[identifier] = value,
        );
    }

    serializer(serializer: (app: GameModelApp) => WorldEventSerializer<EventType, AnySerialized>) {
        this._serializer = serializer;
    }

    configurable(configurable: (app: GameModelApp, event: EventType, world: World) => Configurable) {
        this._configurable = configurable;
    }

    readjust(readjust: (event: EventType, world: World, entity: Entity, triggererId: string) => void) {
        this._readjust = readjust;
    }

    build(): WorldEventRegistryEntry<EventType> {
        return {
            key: this._key,
            category: this._category,
            newEvent: this._newEvent,
            serializer: this._serializer,
            properties: this._properties,
            configurable: this._configurable,
            readjust: this._readjust,
        };
    }
}

export function worldEventRegistryEntry<EventType extends WorldEvent & KeyProvider>(
    makeEntry: (builder: WorldEventRegistryEntryBuilder<EventType>) => void,
): WorldEventRegistryEntry<EventType> {
    const builder = new WorldEventRegistryEntryBuilder<EventType>();
    makeEntry(builder);
    return builder.build();
}

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
                serializer: (app) => {
                    const entry = app.worldEventRegistry.entry(autoEntry.eventType.key);
                    return new AutomaticWorldEventSerializer(entry);
                },
                properties: autoEntry.properties,
            });
        }

        if (this.entries.has(manualEntry.key)) {
            throw new Error(`Entry conflict for key ${manualEntry.key}`);
        }
        this.entries.set(manualEntry.key, manualEntry);

        // In case no configurable was defined, add a default one
        if (!manualEntry.configurable) {
            manualEntry.configurable = (app, event, world) => {
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
