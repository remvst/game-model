import {
    CompositeConfigurable,
    EnumConfigurable,
    NumberConfigurable,
} from "@remvst/configurable";
import { adaptId } from "../adapt-id";
import { Entity } from "../entity";
import { EntityEvent } from "../events/entity-event";
import { Remove } from "../events/remove";
import { TriggerEvent } from "../events/trigger-event";
import { WorldEvent } from "../events/world-event";
import { GameModelApp } from "../game-model-app";
import { KeyProvider } from "../key-provider";
import { EntityIdConstraints } from "../properties/property-constraints";
import { RegistryEntry } from "../registry/trait-registry";
import { SerializationOptions } from "../serialization/serialization-options";
import { AnySerialized, TraitSerializer } from "../serialization/serializer";
import { Trait } from "../trait";
import { World } from "../world";
import { DelayedActionTrait } from "./delayed-action-trait";

export class EventHolderTrait extends Trait {
    static readonly key = "event-holder";
    readonly key = EventHolderTrait.key;

    private readonly serializationOptions = new SerializationOptions();

    constructor(
        private readonly app: GameModelApp,
        public event: WorldEvent & KeyProvider,
        public delay: number,
        public triggerCount: number = 1,
    ) {
        super();
    }

    postBind(): void {
        super.postBind();
        this.entity.onEvent(TriggerEvent, (event, world) => {
            world.entities.add(
                new Entity(undefined, [
                    new DelayedActionTrait(this.delay, (world) => {
                        this.trigger(world, event.triggererId);
                    }),
                ]),
            );

            this.triggerCount--;
            if (this.triggerCount === 0) {
                this.entity.remove();
            }
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

    static registryEntry(app: GameModelApp): RegistryEntry<EventHolderTrait> {
        return {
            key: EventHolderTrait.key,
            category: "scripting",
            newTrait: () => new EventHolderTrait(app, new Remove(), 0, 1),
            serializer: () => new EventHolderSerializer(app),
            configurable: (trait: EventHolderTrait) => trait.configurable(app),
        };
    }

    private configurable(app: GameModelApp): CompositeConfigurable {
        const eventClass = (this.event as any).constructor;

        const registryEntry = app.worldEventRegistry.entry(this.event.key);

        return new CompositeConfigurable()
            .add(
                "eventType",
                new EnumConfigurable<string>({
                    read: () => eventClass.key,
                    write: (key, configurable) => {
                        this.event = app.worldEventRegistry
                            .entry(key)
                            .newEvent();
                        configurable.invalidate();
                    },
                }).addItems(
                    app.worldEventRegistry.keys(),
                    (key) => key,
                    (key) => app.worldEventRegistry.entry(key).category,
                ),
            )
            .add(
                "delay",
                new NumberConfigurable({
                    min: 0,
                    max: 30,
                    step: 0.1,
                    read: () => this.delay,
                    write: (delay) => (this.delay = delay),
                }),
            )
            .add(
                "triggerCount",
                new NumberConfigurable({
                    min: -1,
                    max: 20,
                    step: 1,
                    read: () => this.triggerCount,
                    write: (triggerCount) => (this.triggerCount = triggerCount),
                }),
            )
            .add(
                "event",
                registryEntry?.configurable
                    ? registryEntry.configurable(this.event, this.entity?.world)
                    : new CompositeConfigurable(),
            );
    }
}

interface Serialized extends AnySerialized {
    event: any;
    delay: number;
    triggerCount: number;
}

export class EventHolderSerializer
    implements TraitSerializer<EventHolderTrait, Serialized>
{
    constructor(private readonly app: GameModelApp) {}

    serialize(
        trait: EventHolderTrait,
        options: SerializationOptions,
    ): Serialized {
        return {
            event: this.app.serializers.verbose.worldEvent.serialize(
                trait.event,
                options,
            ),
            delay: trait.delay,
            triggerCount: trait.triggerCount,
        };
    }

    deserialize(
        serialized: Serialized,
        options: SerializationOptions,
    ): EventHolderTrait {
        const event = this.app.serializers.verbose.worldEvent.deserialize(
            serialized.event,
            options,
        );
        return new EventHolderTrait(
            this.app,
            event as WorldEvent & KeyProvider,
            serialized.delay || 0,
            isNaN(serialized.triggerCount) ? 1 : serialized.triggerCount,
        );
    }
}
