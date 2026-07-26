import { PropertyType } from "../properties/property-constraints";
import { RegistryEntry } from "../registry/trait-registry";
import {
    DefinitionsOfProps,
    SimpleTrait,
    simpleTraitRegistryEntry,
} from "./simple-trait";

export class PositionBindingTrait extends SimpleTrait<{
    followedId: string;
    followerIds: string[];
    absolute: boolean;
    removeWhenIrrelevant: boolean;
}> {
    static readonly key = "position-binding";
    readonly key = PositionBindingTrait.key;
    readonly disableChunking = true;

    definitions(): DefinitionsOfProps<PositionBindingTrait["props"]> {
        return {
            followedId: PropertyType.id(),
            followerIds: PropertyType.list(PropertyType.id()),
            absolute: PropertyType.bool(),
            removeWhenIrrelevant: PropertyType.bool(),
        };
    }

    cycle(_: number) {
        const followed = this.entity?.world?.entity(this.props.followedId);
        if (!followed) {
            if (this.props.removeWhenIrrelevant) {
                this.entity!.remove();
            }

            return;
        }

        let hasFollower = false;
        for (const followerId of this.props.followerIds) {
            const follower = this.entity!.world!.entity(followerId);
            if (!follower) {
                continue;
            }

            hasFollower = true;

            if (this.props.absolute) {
                follower.x = followed.x;
                follower.y = followed.y;
            } else {
                follower.x += followed.cycleVelocity.x;
                follower.y += followed.cycleVelocity.y;
            }
        }

        if (!hasFollower && this.props.removeWhenIrrelevant) {
            this.entity!.remove();
        }
    }

    static registryEntry(): RegistryEntry<PositionBindingTrait> {
        return simpleTraitRegistryEntry(PositionBindingTrait, (builder) => {
            builder.category("movement");
        });
    }
}
