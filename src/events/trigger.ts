import { resolveIds } from '../adapt-id';
import Entity from '../entity';
import { PropertyType } from '../properties/property-constraints';
import { WorldEventRegistryEntry, worldEventRegistryEntry } from '../registry/world-event-registry';
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
        for (const entity of resolveIds(this.entityId, null, world)) {
            this.applyToEntity(entity);
        }
    }

    private applyToEntity(entity: Entity) {
        entity.addEvent(new TriggerEvent(this.triggererId));
    }

    static registryEntry(): WorldEventRegistryEntry<Trigger> {
        return worldEventRegistryEntry(builder => {
            builder.eventClass(Trigger);
            builder.category('scripting');
            builder.simpleProp('entityId', PropertyType.id());
            builder.simpleProp('triggererId', PropertyType.id());
        });
    }
}
