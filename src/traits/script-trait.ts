import { Entity } from "..";
import { EntityEvent } from "../events/entity-event";
import Trigger from "../events/trigger";
import TriggerEvent from "../events/trigger-event";
import { PropertyType, PropertyConstraints } from "../properties/property-constraints";
import { RegistryEntry, traitRegistryEntry } from "../registry/trait-registry";
import Trait from "../trait";
import World from "../world";
import DelayedActionTrait from './delayed-action-trait';

interface ScriptStep {
    triggerEntityId: string;
    delay: number;
}

export default class ScriptTrait extends Trait {
    static readonly key = 'script';
    readonly key = ScriptTrait.key;

    steps: ScriptStep[] = [];
    triggerCount: number = 1;

    processEvent(event: EntityEvent, world: World) {
        if (event instanceof TriggerEvent) {
            for (const step of this.steps) {
                world.entities.add(new Entity(undefined, [
                    new DelayedActionTrait(
                        step.delay,
                        (world) => world.addEvent(new Trigger(step.triggerEntityId, event.triggererId!)),
                    )
                ]));
            }

            this.triggerCount--;
            if (this.triggerCount === 0) {
                this.entity?.remove();
            }
        }
    }

    static registryEntry(): RegistryEntry<ScriptTrait> {
        const stepType = PropertyType.composite(new Map<string, PropertyConstraints<any>>([
            ['triggerEntityId', PropertyType.id()],
            ['delay', PropertyType.num()],
        ]));

        return traitRegistryEntry(builder => {
            builder.traitClass(ScriptTrait);
            builder.category('scripting');
            builder.property('triggerCount', PropertyType.num(-1, 100, 1), trait => trait.triggerCount, (trait, triggerCount) => trait.triggerCount = triggerCount);
            builder.property('steps', PropertyType.list(stepType), trait => trait.steps, (trait, steps) => trait.steps = steps);
        });
    }
}
