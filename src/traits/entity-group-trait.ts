import { isBetween } from "@remvst/geometry";
import { Entity } from "../entity";
import { EntityEvent } from "../events/entity-event";
import { Trigger } from "../events/trigger";
import { PropertyType } from "../properties/property-constraints";
import { RegistryEntry } from "../registry/trait-registry";
import { World } from "../world";
import {
    DefinitionsOfProps,
    SimpleTrait,
    simpleTraitRegistryEntry,
} from "./simple-trait";

export class EntityGroupTrait extends SimpleTrait<{
    traits: string[];
    radiusX: number;
    radiusY: number;
    onRelevantTriggerEntityId: string;
    onIrrelevantTriggerEntityId: string;
}> {
    static readonly key = "entity-group";
    readonly key = EntityGroupTrait.key;
    readonly disableChunking = true;

    private relevant: boolean | null = null;

    definitions(): DefinitionsOfProps<EntityGroupTrait["props"]> {
        return {
            traits: PropertyType.list(PropertyType.str()),
            radiusX: PropertyType.num(0, 400, 5),
            radiusY: PropertyType.num(0, 400, 5),
            onRelevantTriggerEntityId: PropertyType.id(),
            onIrrelevantTriggerEntityId: PropertyType.id(),
        };
    }

    *entities(world: World): Iterable<Entity> {
        for (const trait of this.props.traits) {
            if (this.props.radiusX === 0 || this.props.radiusY === 0) {
                for (const entity of world.entities.bucket(trait) || []) {
                    yield entity;
                }
            } else {
                for (const entity of world.entities.bucket(trait) || []) {
                    if (
                        isBetween(
                            this.entity!.x - this.props.radiusX,
                            entity.x,
                            this.entity!.x + this.props.radiusX,
                        ) &&
                        isBetween(
                            this.entity!.y - this.props.radiusY,
                            entity.y,
                            this.entity!.y + this.props.radiusY,
                        )
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
        if (
            !this.props.onIrrelevantTriggerEntityId &&
            !this.props.onRelevantTriggerEntityId
        ) {
            return;
        }

        const previousRelevant = this.relevant;
        this.relevant = this.isRelevant(this.entity!.world!);
        if (this.relevant !== previousRelevant && previousRelevant !== null) {
            const id = this.relevant
                ? this.props.onRelevantTriggerEntityId
                : this.props.onIrrelevantTriggerEntityId;
            this.entity!.world!.addEvent(new Trigger(id, this.entity!.id));
        }
    }

    static registryEntry(): RegistryEntry<EntityGroupTrait> {
        return simpleTraitRegistryEntry(EntityGroupTrait, (builder) => {
            builder.category("scripting");
        });
    }
}
