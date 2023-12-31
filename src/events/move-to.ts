import { Entity, PropertyType } from "..";
import { resolveIds } from "../adapt-id";
import { EntityProperties } from "../entity";
import {
    WorldEventRegistryEntry,
    worldEventRegistryEntry,
} from "../registry/world-event-registry";
import InterpolatorTrait from "../traits/interpolator-trait";
import World from "../world";
import { WorldEvent } from "./world-event";

export default class MoveTo implements WorldEvent {
    static readonly key = "move-to";
    readonly key = MoveTo.key;

    constructor(
        public entityId: string = "",
        public duration: number = 1,
        public targetEntityId: string = "",
    ) {}

    apply(world: World) {
        const targetEntity = world.entity(this.targetEntityId);
        if (!targetEntity) {
            return;
        }

        for (const entity of resolveIds(this.entityId, null, world)) {
            if (this.duration <= 0) {
                entity.position.x = targetEntity.position.x;
                entity.position.y = targetEntity.position.y;
                entity.position.z = targetEntity.position.z;
                continue;
            }

            if (entity.position.x !== targetEntity.position.x) {
                world.entities.add(
                    new Entity(undefined, [
                        new InterpolatorTrait(
                            this.entityId,
                            EntityProperties.x,
                            entity.position.x,
                            targetEntity.position.x,
                            this.duration,
                        ),
                    ]),
                );
            }

            if (entity.position.y !== targetEntity.position.y) {
                world.entities.add(
                    new Entity(undefined, [
                        new InterpolatorTrait(
                            this.entityId,
                            EntityProperties.y,
                            entity.position.y,
                            targetEntity.position.y,
                            this.duration,
                        ),
                    ]),
                );
            }

            if (entity.position.y !== targetEntity.position.y) {
                world.entities.add(
                    new Entity(undefined, [
                        new InterpolatorTrait(
                            this.entityId,
                            EntityProperties.z,
                            entity.position.z,
                            targetEntity.position.z,
                            this.duration,
                        ),
                    ]),
                );
            }
        }
    }

    static registryEntry(): WorldEventRegistryEntry<MoveTo> {
        return worldEventRegistryEntry((builder) => {
            builder.eventClass(MoveTo);
            builder.category("movement");
            builder.simpleProp("entityId", PropertyType.id());
            builder.simpleProp("targetEntityId", PropertyType.id());
            builder.simpleProp("duration", PropertyType.num(0, 200, 0.1));
        });
    }
}
