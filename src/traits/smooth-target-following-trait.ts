import { Vector2, between } from "@remvst/geometry";
import { Entity } from "../entity";
import { PropertyType } from "../properties/property-constraints";
import {
    TraitRegistryEntry,
    traitRegistryEntry,
} from "../registry/trait-registry";
import { Trait } from "../trait";

export class SmoothTargetFollowingTrait extends Trait {
    static readonly key = "smooth-target-following";
    readonly key = SmoothTargetFollowingTrait.key;

    targetEntityIds: string[] = [];
    targetTraitKeys: string[] = [];
    minSpeed = 0;
    maxSpeed = Number.MAX_SAFE_INTEGER;
    reachTargetFactor = 0.2;
    reachTargetLastPosition = false;
    offset = new Vector2();

    private foundTarget = false;
    private readonly lastTargetPosition = new Vector2();

    private readonly reusableOutSpeed: Vector2 = new Vector2();

    get target(): Entity | null {
        for (const id of this.targetEntityIds) {
            const target = this.entity.world.entity(id);
            if (target) return target;
        }

        for (const traitKey of this.targetTraitKeys) {
            for (const targettedTrait of this.entity.world.entities.bucket(
                traitKey,
            ) || []) {
                return targettedTrait;
            }
        }

        return null;
    }

    private calculateSpeed(
        position: Vector2,
        targetPosition: Vector2,
        outSpeed: Vector2,
    ) {
        const diffX = Math.abs(targetPosition.x - position.x);
        const diffY = Math.abs(targetPosition.y - position.y);
        outSpeed.x = between(
            this.minSpeed,
            diffX / this.reachTargetFactor,
            this.maxSpeed,
        );
        outSpeed.y = between(
            this.minSpeed,
            diffY / this.reachTargetFactor,
            this.maxSpeed,
        );
    }

    cycle(elapsed: number) {
        const { target } = this;
        if (target) {
            this.foundTarget = true;
            this.lastTargetPosition.x = target.position.x + this.offset.x;
            this.lastTargetPosition.y = target.position.y + this.offset.y;
        }

        if (!this.foundTarget) return;
        if (!this.reachTargetLastPosition && !target) return;

        this.calculateSpeed(
            this.entity,
            this.lastTargetPosition,
            this.reusableOutSpeed,
        );

        this.entity.position.x += between(
            -elapsed * this.reusableOutSpeed.x,
            this.lastTargetPosition.x - this.entity.position.x,
            elapsed * this.reusableOutSpeed.x,
        );
        this.entity.position.y += between(
            -elapsed * this.reusableOutSpeed.y,
            this.lastTargetPosition.y - this.entity.position.y,
            elapsed * this.reusableOutSpeed.y,
        );
    }

    static registryEntry(): TraitRegistryEntry<SmoothTargetFollowingTrait> {
        return traitRegistryEntry((builder) => {
            builder.traitClass(SmoothTargetFollowingTrait);
            builder.simpleProp(
                "targetEntityIds",
                PropertyType.list(PropertyType.id()),
            );
            builder.simpleProp(
                "targetTraitKeys",
                PropertyType.list(PropertyType.str()),
            );
        });
    }
}
