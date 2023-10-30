import { EntityProperties } from './../entity';
import { Entity, InterpolatorTrait, vector3 } from "..";
import { PropertyType } from "../properties/property-constraints";
import { WorldEventRegistryEntry, worldEventRegistryEntry } from "../registry/world-event-registry";
import World from "../world";
import { WorldEvent } from "./world-event";
import { Vector3 } from '../vector3';
import { resolveIds } from '../adapt-id';

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
        for (const entity of resolveIds(this.entityId, null, world)) {
            if (this.translation.x) {
                world.entities.add(new Entity('movx', [
                    new InterpolatorTrait(
                        this.entityId,
                        EntityProperties.x,
                        entity.x,
                        entity.x + this.translation.x,
                        this.duration,
                    ),
                ]));
            }

            if (this.translation.y) {
                world.entities.add(new Entity('movy', [
                    new InterpolatorTrait(
                        this.entityId,
                        EntityProperties.y,
                        entity.y,
                        entity.y + this.translation.y,
                        this.duration,
                    ),
                ]));
            }
        }
    }

    static registryEntry(): WorldEventRegistryEntry<Shift> {
        return worldEventRegistryEntry(builder => {
            builder.eventClass(Shift);
            builder.category('movement');
            builder.simpleProp('entityId', PropertyType.id());
            builder.simpleProp('duration', PropertyType.num(0, 120, 0.1));
            builder.simpleProp('translation', PropertyType.vec2());
        });
    }
}
