import { EntityIdConstraints, EntityRemoved, RegistryEntry, SerializationOptions, WorldEventRegistry } from "..";
import { EntityEvent } from "../events/entity-event";
import Remove from "../events/remove";
import { WorldEvent } from "../events/world-event";
import GameModelApp from "../game-model-app";
import { KeyProvider } from "../key-provider";
import { AnySerialized, TraitSerializer, WorldEventSerializer } from "../serialization/serializer";
import Trait from "../trait";
import World from "../world";
import adaptId from "../adapt-id";

export default class EventOnRemovalTrait extends Trait {
    static readonly key = 'event-on-removal';
    readonly key = EventOnRemovalTrait.key;

    private readonly serializationOptions = new SerializationOptions();

    constructor(
        private readonly worldEventRegistry: WorldEventRegistry,
        public event: WorldEvent & KeyProvider,
    ) {
        super();
    }

    processEvent(event: EntityEvent, world: World) {
        if (event instanceof EntityRemoved) {
            this.trigger(world, this.entity.id);
        }
    }

    private trigger(world: World, triggererId: string) {
        const registryEntry = this.worldEventRegistry.entry(this.event.key);
        const serializer = registryEntry.serializer(registryEntry);
        const copy = serializer.deserialize(serializer.serialize(this.event, this.serializationOptions), this.serializationOptions);
        if (registryEntry.properties) {
            for (const property of registryEntry.properties) {
                if (property.type instanceof EntityIdConstraints) {
                    let value = property.get(copy);
                    value = adaptId(value, triggererId, world);
                    property.set(copy, value);
                }
            }
        }

        if (registryEntry.readjust) {
            registryEntry.readjust(copy, world, this.entity, triggererId);
        }

        world.addEvent(copy);
    }

    static registryEntry(app: GameModelApp): RegistryEntry<EventOnRemovalTrait> {
        const { worldEventRegistry } = app; 
        const { worldEvent } = app.serializers; 
        return {
            key: EventOnRemovalTrait.key,
            category: 'scripting',
            newTrait: () => new EventOnRemovalTrait(worldEventRegistry, new Remove()),
            serializer: () => new EventOnRemovalSerializer(worldEventRegistry, worldEvent),
        };
    }
}

interface Serialized extends AnySerialized {
    event: any;
}

export class EventOnRemovalSerializer implements TraitSerializer<EventOnRemovalTrait, Serialized> {

    constructor(
        private readonly worldEventRegistry: WorldEventRegistry,
        private readonly eventSerializer: WorldEventSerializer<any, any>,
    ) {
        
    }

    serialize(trait: EventOnRemovalTrait, options: SerializationOptions): Serialized {
        return {
            'event': this.eventSerializer.serialize(trait.event, options),
        };
    }

    deserialize(serialized: Serialized, options: SerializationOptions): EventOnRemovalTrait {
        const event = this.eventSerializer.deserialize(serialized.event, options);
        return new EventOnRemovalTrait(
            this.worldEventRegistry,
            event as WorldEvent & KeyProvider,
        );
    }
}
