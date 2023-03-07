import adaptId from '../adapt-id';
import Entity from '../entity';
import { worldEventGetSet } from '../properties/properties';
import { PropertyType } from '../properties/property-constraints';
import { AutoWorldEventRegistryEntry } from '../registry/world-event-registry';
import EntityGroupTrait from '../traits/entity-group-trait';
import World from '../world';
import TriggerEvent from './trigger-event';
import { WorldEvent } from './world-event';

export default class Trigger implements WorldEvent {

    static readonly key = 'trigger';
    readonly key = Trigger.key;

    constructor(
        public entityId: string = '',
        public triggererId: string = '',
    ) {

    }

    apply(world: World) {
        const holder = world.entity(this.entityId);
        if (!holder) {
            return;
        }

        this.applyToEntity(holder)
        
        const entityGroupTrait = holder.traitOfType(EntityGroupTrait);
        if (entityGroupTrait) {
            for (const entity of entityGroupTrait.entities(world)) {
                this.applyToEntity(entity);
            }
        }
    }

    private applyToEntity(entity: Entity) {
        entity.addEvent(new TriggerEvent(this.triggererId));
    }

    static registryEntry(): AutoWorldEventRegistryEntry<Trigger> {
        return {
            eventType: Trigger,
            category: 'scripting',
            readjust: (event, _, triggererId) => {
                event.triggererId = adaptId(event.triggererId, triggererId);
            },
            properties: [
                worldEventGetSet(Trigger, 'entityId', PropertyType.id(), event => event.entityId, (event, entityId) => event.entityId = entityId),
            ],
        };
    }
}