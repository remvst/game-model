import { EntityProperties } from './../entity';
import { Entity, InterpolatorTrait, vector3 } from "..";
import adaptId from "../adapt-id";
import { worldEventGetSet } from "../properties/properties";
import { PropertyType } from "../properties/property-constraints";
import { AutoWorldEventRegistryEntry } from "../registry/world-event-registry";
import World from "../world";
import { WorldEvent } from "./world-event";
import { Vector3 } from '../vector3';

export default class Shift implements WorldEvent {
    static readonly key = 'shift';
    readonly key = Shift.key;

    constructor(
        public entityId: string = '',
        public translation: Vector3 = vector3(),
        public duration: number = 1,
    ) {
    }

    apply(world: World) {
        const entity = world.entity(this.entityId);
        if (!entity) {
            return;
        }

        world.entities.add(new Entity(undefined, [
            new InterpolatorTrait(
                this.entityId,
                EntityProperties.y,
                entity.x,
                entity.x + this.translation.x,
                this.duration,
            ),
        ]));

        world.entities.add(new Entity(undefined, [
            new InterpolatorTrait(
                this.entityId,
                EntityProperties.y,
                entity.y,
                entity.y + this.translation.y,
                this.duration,
            ),
        ]));
    }

    static registryEntry(): AutoWorldEventRegistryEntry<Shift> {
        return {
            eventType: Shift,
            category: 'movement',
            readjust: (event, _, triggererId) => {
                event.entityId = adaptId(event.entityId, triggererId);
            },
            properties: [
                worldEventGetSet(Shift, 'entityId', PropertyType.id(), event => event.entityId, (event, entityId) => event.entityId = entityId),
                worldEventGetSet(Shift, 'duration', PropertyType.num(0, 120, 0.1), event => event.duration, (event, duration) => event.duration = duration),
                worldEventGetSet(Shift, 'translationX', PropertyType.num(-900, 900), event => event.translation.x, (event, translationX) => event.translation.x = translationX),
                worldEventGetSet(Shift, 'translationY', PropertyType.num(-900, 900), event => event.translation.y, (event, translationY) => event.translation.y = translationY),
            ],
        };
    }
}
