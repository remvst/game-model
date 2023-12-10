import { Vector2, between } from '@remvst/geometry';
import Entity from '../entity';
import Trait from '../trait';
import { TraitRegistryEntry, traitRegistryEntry } from '../registry/trait-registry';
import { PropertyType } from '../properties/property-constraints';

export default class TargetFollowingTrait extends Trait {
    static readonly key = 'target-following';
    readonly key = TargetFollowingTrait.key;

    targetEntityId: string | null = null;
    targetTraitKeys: string[];
    maxSpeed = 10;
    reachTargetFactor = 0.2;

    private readonly reusableOutSpeed: Vector2 = new Vector2();

    get target(): Entity | null {
        if (this.targetEntityId) {
            return this.entity.world.entity(this.targetEntityId);
        }

        for (const traitKey of this.targetTraitKeys) {
            for (const player of this.entity.world.entities.bucket(traitKey)) {
                return player;
            }
        }

        return null;
    }

    private calculateSpeed(position: Vector2, targetPosition: Vector2, outSpeed: Vector2) {
        const diffX = Math.abs(targetPosition.x - position.x);
        const diffY = Math.abs(targetPosition.y - position.y);
        outSpeed.x = Math.max(this.maxSpeed, diffX / this.reachTargetFactor);
        outSpeed.y = Math.max(this.maxSpeed, diffY / this.reachTargetFactor);
    }

    cycle(elapsed: number) {
        const { target } = this;
        if (target) {
            this.calculateSpeed(this.entity, target, this.reusableOutSpeed);

            this.entity.position.x += between(
                -elapsed * this.reusableOutSpeed.x,
                target.x - this.entity.position.x,
                elapsed * this.reusableOutSpeed.x,
            );
            this.entity.position.y += between(
                -elapsed * this.reusableOutSpeed.y,
                target.y - this.entity.position.y,
                elapsed * this.reusableOutSpeed.y,
            );
        }
    }

    static registryEntry(): TraitRegistryEntry<TargetFollowingTrait> {
        return traitRegistryEntry(builder => {
            builder.traitClass(TargetFollowingTrait);
            builder.simpleProp('targetEntityId', PropertyType.id());
            builder.simpleProp('targetTraitKeys', PropertyType.list(PropertyType.id()));
        });
    }
}
