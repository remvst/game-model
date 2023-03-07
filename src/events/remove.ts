import { worldEventGetSet } from '../properties/properties';
import { PropertyType } from '../properties/property-constraints';
import { AutoWorldEventRegistryEntry } from '../registry/world-event-registry';
import World from '../world';
import { WorldEvent } from './world-event';

export default class Remove implements WorldEvent {
    static readonly key = 'remove';
    readonly key = Remove.key;

    constructor(public entityId: string = '') {
        
    }

    apply(world: World) {
        const entity = world.entity(this.entityId);
        if (entity) {
            entity.remove();
        }
    }

    static registryEntry(): AutoWorldEventRegistryEntry<Remove> {
        return {
            eventType: Remove,
            category: 'scripting',
            properties: [
                worldEventGetSet(Remove, 'entityId', PropertyType.id(), event => event.entityId, (event, entityId) => event.entityId = entityId),
            ],
        };
    }
}
