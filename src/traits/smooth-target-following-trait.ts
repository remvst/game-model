import { Vector2, between } from "@remvst/geometry";
import Entity from "../entity";
import { PropertyType } from "../properties/property-constraints";
import {
    TraitRegistryEntry,
    traitRegistryEntry,
} from "../registry/trait-registry";
import Trait from "../trait";

export default class SmoothTargetFollowingTrait extends Trait {
    static readonly key = "smooth-target-following";
    readonly key = SmoothTargetFollowingTrait.key;

    targetEntityIds: string[] = [];
    targetTraitKeys: string[] = [];
    maxSpeed = 10;
    reachTargetFactor = 0.2;
    reachTargetLastPosition = false;

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
            )) {
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
        outSpeed.x = Math.max(this.maxSpeed, diffX / this.reachTargetFactor);
        outSpeed.y = Math.max(this.maxSpeed, diffY / this.reachTargetFactor);
    }

    cycle(elapsed: number) {
        const { target } = this;
        if (target) {
            this.foundTarget = this.reachTargetLastPosition;
            this.lastTargetPosition.x = target.position.x;
            this.lastTargetPosition.y = target.position.y;
        }

        if (!this.foundTarget) return;

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
