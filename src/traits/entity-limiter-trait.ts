import { Entity } from "../entity";
import { PropertyType } from "../properties/property-constraints";
import { TraitRegistryEntry } from "../registry/trait-registry";
import {
    DefinitionsOfProps,
    SimpleTrait,
    simpleTraitRegistryEntry,
} from "./simple-trait";

export class EntityLimiterTrait extends SimpleTrait<{
    targetTraitKey: string;
    maxEntities: number;
}> {
    static readonly key = "entity-limiter";
    readonly key = EntityLimiterTrait.key;

    readonly disableChunking = true;

    definitions(): DefinitionsOfProps<EntityLimiterTrait["props"]> {
        return {
            targetTraitKey: PropertyType.str(),
            maxEntities: PropertyType.num(),
        };
    }

    cycle(): void {
        if (
            this.world!.entities.bucketSize(this.props.targetTraitKey) <
            this.props.maxEntities
        ) {
            return;
        }

        let oldest: Entity | null = null;
        for (const entity of this.world!.entities.bucket(
            this.props.targetTraitKey,
        )) {
            if (!oldest || entity.age > oldest.age) {
                oldest = entity;
            }
        }

        oldest?.remove();
    }

    static registryEntry(): TraitRegistryEntry<EntityLimiterTrait> {
        return simpleTraitRegistryEntry(EntityLimiterTrait);
    }
}
