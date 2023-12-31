import { EntityEvent } from "../events/entity-event";
import TriggerEvent from "../events/trigger-event";
import { PropertyType } from "../properties/property-constraints";
import { RegistryEntry, traitRegistryEntry } from "../registry/trait-registry";
import Trait from "../trait";
import { rectangleSurface } from "../trait-surface-provider";
import World from "../world";

export default class EventTriggerTrait extends Trait {
    static readonly key = "event-trigger";
    readonly key = EventTriggerTrait.key;

    private readonly containedEntityIds = new Set<string>();

    readonly disableChunking: boolean = true;

    constructor(
        public onEnterIds: string[] = [],
        public onExitIds: string[] = [],
        public radiusX: number = 10,
        public radiusY: number = 10,
        public triggerCount: number = 1,
        public triggerTrait: string = "player",
    ) {
        super();
    }

    cycle(_: number) {
        const world = this.entity!.world;
        if (!world) return;

        for (const entity of world.entities.bucket(this.triggerTrait)) {
            const newContained =
                Math.abs(entity.x - this.entity.x) <= this.radiusX &&
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

    private static readonly surfaceProvider = rectangleSurface(
        (trait: EventTriggerTrait, rectangle) => {
            rectangle.centerAround(
                trait.entity!.x,
                trait.entity!.y,
                trait.radiusX * 2,
                trait.radiusY * 2,
            );
        },
    );
    readonly surfaceProvider = EventTriggerTrait.surfaceProvider;

    static registryEntry(): RegistryEntry<EventTriggerTrait> {
        return traitRegistryEntry((builder) => {
            builder.traitClass(EventTriggerTrait);
            builder.category("scripting");
            builder.simpleProp(
                "onEnterIds",
                PropertyType.list(PropertyType.id()),
            );
            builder.simpleProp(
                "onExitIds",
                PropertyType.list(PropertyType.id()),
            );
            builder.simpleProp("radiusX", PropertyType.num(0, 100, 5));
            builder.simpleProp("radiusY", PropertyType.num(0, 100, 5));
            builder.simpleProp("triggerCount", PropertyType.num(-1, 50, 1));
            builder.simpleProp("triggerTrait", PropertyType.str());
        });
    }
}
