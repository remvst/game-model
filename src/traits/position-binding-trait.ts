import { PropertyType } from "../properties/property-constraints";
import { RegistryEntry, traitRegistryEntry } from "../registry/trait-registry";
import { Trait } from "../trait";

export class PositionBindingTrait extends Trait {
    static readonly key = "position-binding";
    readonly key = PositionBindingTrait.key;
    readonly disableChunking = true;

    constructor(
        public followedId: string = "",
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

    static registryEntry(): RegistryEntry<PositionBindingTrait> {
        return traitRegistryEntry((builder) => {
            builder.traitClass(PositionBindingTrait);
            builder.category("movement");
            builder.simpleProp("followedId", PropertyType.id());
            builder.simpleProp(
                "followerIds",
                PropertyType.list(PropertyType.id()),
            );
            builder.simpleProp("absolute", PropertyType.bool());
            builder.simpleProp("removeWhenIrrelevant", PropertyType.bool());
        });
    }
}
