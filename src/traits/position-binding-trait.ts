import { traitGetSet } from "../properties/properties";
import { PropertyType } from "../properties/property-constraints";
import { AutoRegistryEntry } from "../registry/trait-registry";
import Trait from "../trait";

export default class PositionBindingTrait extends Trait {
    static readonly key = 'position-binding';
    readonly key = PositionBindingTrait.key;
    readonly disableChunking = true;

    constructor(
        public followedId: string = '',
        public followerIds: string[] = [],
        public absolute: boolean = false,
        public removeWhenIrrelevant: boolean = false,
    ) {
        super();
    }

    cycle(_: number) {
        const followed = this.entity?.world?.entity(this.followedId);
        if (!followed) {
            if (this.removeWhenIrrelevant) {
                this.entity!.remove();
            }

            return;
        }

        let hasFollower = false;
        for (const followerId of this.followerIds) {
            const follower = this.entity!.world!.entity(followerId);
            if (!follower) {
                continue;
            }

            hasFollower = true;

            if (this.absolute) {
                follower.x = followed.x;
                follower.y = followed.y;
            } else {
                follower.x += followed.cycleVelocity.x;
                follower.y += followed.cycleVelocity.y;
            }
        }

        if (!hasFollower && this.removeWhenIrrelevant) {
            this.entity!.remove();
        }
    }

    static registryEntry(): AutoRegistryEntry<PositionBindingTrait> {
        return {
            traitType: PositionBindingTrait,
            category: 'movement',
            properties: [
                traitGetSet(PositionBindingTrait, 'followedId', PropertyType.id(), (trait) => trait.followedId, (trait, followedId) => trait.followedId = followedId),
                traitGetSet(PositionBindingTrait, 'followerIds', PropertyType.list(PropertyType.id()), (trait) => trait.followerIds, (trait, followerIds) => trait.followerIds = followerIds),
                traitGetSet(PositionBindingTrait, 'absolute', PropertyType.bool(), (trait) => trait.absolute, (trait, absolute) => trait.absolute = absolute),
                traitGetSet(PositionBindingTrait, 'removeWhenIrrelevant', PropertyType.bool(), (trait) => trait.removeWhenIrrelevant, (trait, removeWhenIrrelevant) => trait.removeWhenIrrelevant = removeWhenIrrelevant),
            ],
        };
    }
};
