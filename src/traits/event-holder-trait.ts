import { CompositeConfigurable, EnumConfigurable, NumberConfigurable } from "@remvst/configurable";
import { Entity, RegistryEntry, WorldEventRegistry } from "..";
import { EntityEvent } from "../events/entity-event";
import Remove from "../events/remove";
import TriggerEvent from "../events/trigger-event";
import { WorldEvent } from "../events/world-event";
import GameModelApp from "../game-model-app";
import { KeyProvider } from "../key-provider";
import { CompositeSerializerMeta } from "../serialization/composite-serializer";
import { AnySerialized, TraitSerializer, WorldEventSerializer } from "../serialization/serializer";
import Trait from "../trait";
import World from "../world";
import DelayedActionTrait from "./delayed-action-trait";

export default class EventHolderTrait extends Trait {
    static readonly key = 'event-holder';
    readonly key = EventHolderTrait.key;

    constructor(
        private readonly worldEventRegistry: WorldEventRegistry,
        public event: WorldEvent & KeyProvider,
        public delay: number,
        public triggerCount: number = 1,
    ) {
        super();
    }

    processEvent(event: EntityEvent) {
        if (event instanceof TriggerEvent) {
            this.entity.world.entities.add(new Entity(undefined, [
                new DelayedActionTrait(
                    this.delay,
                    (world) => {
                        this.trigger(world, event.triggererId);
                    }
                )
            ]));

            this.triggerCount--;
            if (this.triggerCount === 0) {
                this.entity.remove();
            }
        }
    }

    private trigger(world: World, triggererId: string) {
        const registryEntry = this.worldEventRegistry.entry(this.event.key);
        const serializer = registryEntry.serializer(registryEntry);
        const copy = serializer.deserialize(serializer.serialize(this.event));
        if (registryEntry.readjust) {
            registryEntry.readjust(copy, this.entity, triggererId);
        }

        if (registryEntry.properties) {
            
        }

        world.addEvent(copy);
    }

    static registryEntry(app: GameModelApp): RegistryEntry<EventHolderTrait> {
        const { worldEventRegistry } = app; 
        const { worldEvent } = app.serializers; 
        return {
            key: EventHolderTrait.key,
            category: 'scripting',
            newTrait: () => new EventHolderTrait(worldEventRegistry, new Remove(), 0, 1),
            serializer: () => new EventHolderSerializer(worldEventRegistry, worldEvent),
            configurable: (trait: EventHolderTrait) => trait.configurable,
        };
    }

    get configurable(): CompositeConfigurable {
        const eventClass = (this.event as any).constructor;

        const registryEntry = this.worldEventRegistry.entry(this.event.key);

        return new CompositeConfigurable()
            .add('eventType', new EnumConfigurable<string>({
                'read': () => eventClass.key,
                'write': (key, configurable) => {
                    this.event = this.worldEventRegistry.entry(key).newEvent();
                    configurable.invalidate();
                }
            }).addItems(
                this.worldEventRegistry.keys(),
                key => key,
                key => this.worldEventRegistry.entry(key).category,
            ))
            .add('delay', new NumberConfigurable({
                'min': 0,
                'max': 30,
                'step': 0.1,
                'read': () => this.delay,
                'write': delay => this.delay = delay,
            }))
            .add('triggerCount', new NumberConfigurable({
                'min': -1,
                'max': 20,
                'step': 1,
                'read': () => this.triggerCount,
                'write': triggerCount => this.triggerCount = triggerCount,
            }))
            .add('event', registryEntry?.configurable 
                ? registryEntry.configurable(this.event, this.entity?.world) 
                : new CompositeConfigurable());
    }
}

interface Serialized extends AnySerialized {
    event: CompositeSerializerMeta;
    delay: number;
    triggerCount: number;
}

export class EventHolderSerializer implements TraitSerializer<EventHolderTrait, Serialized> {
    constructor(
        private readonly worldEventRegistry: WorldEventRegistry,
        private readonly eventSerializer: WorldEventSerializer<any, any>,
    ) {
        
    }

    serialize(trait: EventHolderTrait): Serialized {
        return {
            'event': this.eventSerializer.serialize(trait.event),
            'delay': trait.delay,
            'triggerCount': trait.triggerCount,
        };
    }

    deserialize(serialized: Serialized): EventHolderTrait {
        const event = this.eventSerializer.deserialize(serialized.event);
        return new EventHolderTrait(
            this.worldEventRegistry,
            event as WorldEvent & KeyProvider,
            serialized.delay || 0,
            isNaN(serialized.triggerCount) ? 1 : serialized.triggerCount,
        );
    }
}