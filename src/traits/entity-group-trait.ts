import { EntityEvent } from "../events/entity-event";
import Trigger from "../events/trigger";
import { RegistryEntry, traitRegistryEntry } from "../registry/trait-registry";
import Trait from "../trait";
import World from "../world";
import Entity from "../entity";
import { PropertyType } from "../properties/property-constraints";
import { isBetween } from "@remvst/geometry";

export default class EntityGroupTrait extends Trait {

    static readonly key = 'entity-group';
    readonly key = EntityGroupTrait.key;
    readonly disableChunking = true;

    private relevant: boolean | null = null;

    constructor(
        public traits: string[] = [],
        public radiusX: number = 0,
        public radiusY: number = 0,
        public onRelevantTriggerEntityId: string = '',
        public onIrrelevantTriggerEntityId: string = '',
    ) {
        super();
    }

    * entities(world: World): Iterable<Entity> {
        for (const trait of this.traits) {
            if (this.radiusX === 0 || this.radiusY === 0) {
                for (const entity of world.entities.bucket(trait)) {
                    yield entity;
                }
            } else {
                for (const entity of  world.entities.bucket(trait)) {
                    if (
                        isBetween(this.entity!.x - this.radiusX, entity.x, this.entity!.x + this.radiusX) &&
                        isBetween(this.entity!.y - this.radiusY, entity.y, this.entity!.y + this.radiusY)
                    ) {
                        yield entity;
                    }
                }
            }
        }
    }

    private isRelevant(world: World): boolean {
        for (const _ of this.entities(world)) {
            return true;
        }

        return false;
    }

    processEvent(event: EntityEvent, world: World): void {
        for (const entity of this.entities(world)) {
            entity.addEvent(event);
        }
    }

    cycle(): void {
        if (!this.onIrrelevantTriggerEntityId && !this.onRelevantTriggerEntityId) {
            return;
        }

        const previousRelevant = this.relevant;
        this.relevant = this.isRelevant(this.entity!.world!);
        if (this.relevant !== previousRelevant && previousRelevant !== null) {
            const id = this.relevant ? this.onRelevantTriggerEntityId : this.onIrrelevantTriggerEntityId;
            this.entity!.world!.addEvent(new Trigger(id, this.entity!.id));
        }
    }

    static registryEntry(): RegistryEntry<EntityGroupTrait> {
        return traitRegistryEntry(builder => {
            builder.traitClass(EntityGroupTrait);
            builder.category('scripting');
            builder.simpleProp('traits', PropertyType.list(PropertyType.str()));
            builder.simpleProp('radiusX', PropertyType.num(0, 400, 5));
            builder.simpleProp('radiusY', PropertyType.num(0, 400, 5));
            builder.simpleProp('onRelevantTriggerEntityId', PropertyType.id());
            builder.simpleProp('onIrrelevantTriggerEntityId', PropertyType.id());
        });
    }
}
