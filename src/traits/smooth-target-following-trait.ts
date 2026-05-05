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
    reachTargetMultiplier = new Vector2(0.2, 0.2);
    reachTargetLastPosition = false;
    offset = new Vector2();
    snapRadius = new Vector2();

    private foundTarget = false;
    private readonly lastTargetPosition = new Vector2();

    private readonly reusableOutSpeed: Vector2 = new Vector2();

    get reachTargetFactor() {
        return this.reachTargetMultiplier.x;
    }

    set reachTargetFactor(factor: number) {
        this.reachTargetMultiplier.x = factor;
        this.reachTargetMultiplier.y = factor;
    }

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
        outSpeed.x =
            between(
                this.minSpeed,
                diffX / this.reachTargetMultiplier.x,
                this.maxSpeed,
            ) || 0;
        outSpeed.y =
            between(
                this.minSpeed,
                diffY / this.reachTargetMultiplier.y,
                this.maxSpeed,
            ) || 0;
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

        // Snap if reachTargetMultiplier is zero or lower
        if (this.reachTargetMultiplier.x <= 0)
            this.entity.position.x = this.lastTargetPosition.x;
        if (this.reachTargetMultiplier.y <= 0)
            this.entity.position.y = this.lastTargetPosition.y;

        // Snap if within snap radius
        if (
            Math.abs(this.lastTargetPosition.x - this.entity.position.x) <=
            this.snapRadius.x
        ) {
            this.entity.position.x = this.lastTargetPosition.x;
        }
        if (
            Math.abs(this.lastTargetPosition.y - this.entity.position.y) <=
            this.snapRadius.y
        ) {
            this.entity.position.y = this.lastTargetPosition.y;
        }

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
            builder.property(
                "reachTargetMultiplierX",
                PropertyType.num(),
                (t) => t.reachTargetMultiplier.x,
                (t, x) => (t.reachTargetMultiplier.x = x),
            );
            builder.property(
                "reachTargetMultiplierY",
                PropertyType.num(),
                (t) => t.reachTargetMultiplier.y,
                (t, y) => (t.reachTargetMultiplier.y = y),
            );
            builder.simpleProp("reachTargetLastPosition", PropertyType.bool());
            builder.simpleProp("minSpeed", PropertyType.num());
            builder.simpleProp("maxSpeed", PropertyType.num());
            builder.property(
                "offsetX",
                PropertyType.num(),
                (t) => t.offset.x,
                (t, x) => (t.offset.x = x),
            );
            builder.property(
                "offsetY",
                PropertyType.num(),
                (t) => t.offset.y,
                (t, y) => (t.offset.y = y),
            );
            builder.property(
                "snapRadiusX",
                PropertyType.num(),
                (t) => t.snapRadius.x,
                (t, x) => (t.snapRadius.x = x),
            );
            builder.property(
                "snapRadiusY",
                PropertyType.num(),
                (t) => t.snapRadius.y,
                (t, y) => (t.snapRadius.y = y),
            );
        });
    }
}
