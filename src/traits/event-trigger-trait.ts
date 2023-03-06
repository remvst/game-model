import { CompositeConfigurable } from "@remvst/configurable";
import { Rectangle } from "@remvst/geometry";
import EntityIdConfigurable from "../configurable/entity-id-configurable";
import { EntityEvent } from "../events/entity-event";
import TriggerEvent from "../events/trigger-event";
import { traitGetSet } from "../properties/properties";
import { PropertyType } from "../properties/property-constraints";
import { AutoRegistryEntry } from "../registry/trait-registry";
import Trait from "../trait";
import { rectangleSurface } from "../trait-surface-provider";
import World from "../world";

export default class EventTriggerTrait extends Trait {
    static readonly key = 'event-trigger';
    readonly key = EventTriggerTrait.key;

    private readonly containedEntityIds = new Set<string>();

    constructor(
        public onEnterIds: string[] = [],
        public onExitIds: string[] = [],
        public radiusX: number = 10,
        public radiusY: number = 10,
        public triggerCount: number = 1,
        public triggerTrait: string = 'player',
    ) {
        super();
    }

    cycle(_: number) {
        const world = this.entity!.world;
        if (!world) return;

        for (const entity of world.entities.bucket(this.triggerTrait)) {
            const newContained = Math.abs(entity.x - this.entity.x) <= this.radiusX &&
                Math.abs(entity.y - this.entity.y) <= this.radiusY;

            const previousContained = this.containedEntityIds.has(entity.id);
            
            if (previousContained === newContained) {
                continue;
            }

            if (newContained) {
                this.containedEntityIds.add(entity.id);
                this.onEnter(entity.id, world);
            } else {
                this.containedEntityIds.delete(entity.id);
                this.onExit(entity.id);
            }
        }
    }

    private onEnter(triggererId: string, world: World) {
        for (const id of this.onEnterIds) {
            const entity = world.entity(id);
            if (entity) {
                entity.addEvent(new TriggerEvent(triggererId));
            }
        }

        this.triggerCount--;
        if (this.triggerCount === 0) {
            this.entity.remove();
        }
    }

    private onExit(triggererId: string) {
        for (const id of this.onExitIds) {
            const entity = this.entity.world.entity(id);
            if (entity) {
                entity.addEvent(new TriggerEvent(triggererId));
            }
        }
    }

    processEvent(event: EntityEvent, world: World) {
        if (event instanceof TriggerEvent) {
            this.onEnter(event.triggererId, world);
        }
    }

    private static readonly surfaceProvider = rectangleSurface((trait: EventTriggerTrait, rectangle) => {
        rectangle.centerAround(trait.entity!.x, trait.entity!.y, trait.radiusX * 2, trait.radiusY * 2);
    });
    readonly surfaceProvider = EventTriggerTrait.surfaceProvider;

    static registryEntry(): AutoRegistryEntry<EventTriggerTrait> {
        return {
            traitType: EventTriggerTrait,
            category: 'scripting',
            properties: [
                traitGetSet(EventTriggerTrait, 'onEnterIds', PropertyType.list(PropertyType.id()), (trait) => trait.onEnterIds, (trait, onEnterIds) => trait.onEnterIds = onEnterIds),
                traitGetSet(EventTriggerTrait, 'onExitIds', PropertyType.list(PropertyType.id()), (trait) => trait.onExitIds, (trait, onExitIds) => trait.onExitIds = onExitIds),
                traitGetSet(EventTriggerTrait, 'radiusX', PropertyType.num(0, 100, 5), (trait) => trait.radiusX, (trait, radiusX) => trait.radiusX = radiusX),
                traitGetSet(EventTriggerTrait, 'radiusY', PropertyType.num(0, 100, 5), (trait) => trait.radiusY, (trait, radiusY) => trait.radiusY = radiusY),
                traitGetSet(EventTriggerTrait, 'triggerCount', PropertyType.num(-1, 50, 1), (trait) => trait.triggerCount, (trait, triggerCount) => trait.triggerCount = triggerCount),
                traitGetSet(EventTriggerTrait, 'triggerTrait', PropertyType.str(), (trait) => trait.triggerTrait, (trait, triggerTrait) => trait.triggerTrait = triggerTrait),
            ],
        };
    }
}
