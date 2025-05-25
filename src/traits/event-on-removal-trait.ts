import { adaptId } from "../adapt-id";
import { EntityRemoved } from "../events/entity-removed";
import { Remove } from "../events/remove";
import { WorldEvent } from "../events/world-event";
import { GameModelApp } from "../game-model-app";
import { KeyProvider } from "../key-provider";
import { EntityIdConstraints } from "../properties/property-constraints";
import { RegistryEntry } from "../registry/trait-registry";
import { SerializationOptions } from "../serialization/serialization-options";
import {
    AnySerialized,
    TraitSerializer,
    WorldEventSerializer,
} from "../serialization/serializer";
import { Trait } from "../trait";
import { World } from "../world";

export class EventOnRemovalTrait extends Trait {
    static readonly key = "event-on-removal";
    readonly key = EventOnRemovalTrait.key;

    private readonly serializationOptions = new SerializationOptions();

    constructor(
        private readonly app: GameModelApp,
        public event: WorldEvent & KeyProvider,
    ) {
        super();
    }

    postBind(): void {
        super.postBind();
        this.entity.onEvent(EntityRemoved, (event, world) => {
            this.trigger(world, this.entity.id);
        });
    }

    private trigger(world: World, triggererId: string) {
        const registryEntry = this.app.worldEventRegistry.entry(this.event.key);
        const serializer = registryEntry.serializer(this.app);
        const copy = serializer.deserialize(
            serializer.serialize(this.event, this.serializationOptions),
            this.serializationOptions,
        );
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

    static registryEntry(
        app: GameModelApp,
    ): RegistryEntry<EventOnRemovalTrait> {
        const { worldEvent } = app.serializers.verbose;
        return {
            key: EventOnRemovalTrait.key,
            category: "scripting",
            newTrait: () => new EventOnRemovalTrait(app, new Remove()),
            serializer: () => new EventOnRemovalSerializer(app, worldEvent),
        };
    }
}

interface Serialized extends AnySerialized {
    event: any;
}

export class EventOnRemovalSerializer
    implements TraitSerializer<EventOnRemovalTrait, Serialized>
{
    constructor(
        private readonly app: GameModelApp,
        private readonly eventSerializer: WorldEventSerializer<any, any>,
    ) {}

    serialize(
        trait: EventOnRemovalTrait,
        options: SerializationOptions,
    ): Serialized {
        return {
            event: this.eventSerializer.serialize(trait.event, options),
        };
    }

    deserialize(
        serialized: Serialized,
        options: SerializationOptions,
    ): EventOnRemovalTrait {
        const event = this.eventSerializer.deserialize(
            serialized.event,
            options,
        );
        return new EventOnRemovalTrait(
            this.app,
            event as WorldEvent & KeyProvider,
        );
    }
}
