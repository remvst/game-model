import {
    Entity,
    PropertyType,
    Trait,
    TraitRegistryEntry,
    traitRegistryEntry,
} from "@remvst/game-model";

export class EntityLimiterTrait extends Trait {
    static readonly key = "entity-limiter";
    readonly key = EntityLimiterTrait.key;

    readonly disableChunking = true;

    constructor(
        public targetTraitKey: string = "",
        public maxEntities: number = 10,
    ) {
        super();
    }

    cycle(): void {
        if (
            this.world!.entities.bucketSize(this.targetTraitKey) <
            this.maxEntities
        ) {
            return;
        }

        let oldest: Entity | null = null;
        for (const entity of this.world!.entities.bucket(this.targetTraitKey)) {
            if (!oldest || entity.age > oldest.age) {
                oldest = entity;
            }
        }

        oldest?.remove();
    }

    static registryEntry(): TraitRegistryEntry<EntityLimiterTrait> {
        return traitRegistryEntry((builder) => {
            builder.traitClass(EntityLimiterTrait);
            builder.simpleProp("targetTraitKey", PropertyType.str());
            builder.simpleProp("maxEntities", PropertyType.num(1, 1000, 1));
        });
    }
}
