import { Entity } from "../entity";
import { TriggerEvent } from "../events/trigger-event";
import { PropertyType } from "../properties/property-constraints";
import { TraitRegistryEntry } from "../registry/trait-registry";
import { firstItem } from "../util/first";
import { firstAvailableId } from "../util/first-available-id";
import { World } from "../world";
import {
    DefinitionsOfProps,
    SimpleTrait,
    simpleTraitRegistryEntry,
} from "./simple-trait";
import { SpawnExtra, SpawnMapTrait } from "./spawn-map-trait";

export type SpawnType = string;

export class SpawnTrait extends SimpleTrait<{
    type: string;
    spawnedEntityId: string;
    extra: SpawnExtra;
    autoActivate: boolean;
    spawnCount: number;
}> {
    static readonly key = "spawn";
    readonly key = SpawnTrait.key;

    definitions(): DefinitionsOfProps<SpawnTrait["props"]> {
        return {
            type: PropertyType.str(),
            spawnedEntityId: PropertyType.str(),
            extra: PropertyType.json<SpawnExtra>({}),
            autoActivate: PropertyType.bool(),
            spawnCount: PropertyType.num(),
        };
    }

    postBind(): void {
        super.postBind();

        this.entity!.onEvent(TriggerEvent, (_, world) => {
            if (this.props.spawnCount <= 0) return;
            this.spawn(world);
        });
    }

    cycle(_: number) {
        if (this.props.autoActivate && this.props.spawnCount > 0) {
            this.entity!.addEvent(new TriggerEvent(this.entity!.id));
        }
    }

    private createEntity(world: World): Entity {
        const spawnMapTrait = firstItem(world.traitsOfType(SpawnMapTrait));
        if (!spawnMapTrait) throw new Error("No spawn map entity");

        const id = firstAvailableId(
            world,
            this.props.spawnedEntityId || this.entity!.id,
        );
        const entity = new Entity(
            id,
            spawnMapTrait.traitsFor(
                this.props.type,
                this.props.extra,
                this.entity!.position,
            ),
        );
        entity.x = this.entity!.position.x;
        entity.y = this.entity!.position.y;
        entity.z = this.entity!.position.z;
        return entity;
    }

    private spawn(world: World) {
        this.props.spawnCount--;
        if (this.props.spawnCount === 0) {
            this.entity?.remove();
        }

        const entity = this.createEntity(world);
        world.entities.add(entity);
    }

    static registryEntry(): TraitRegistryEntry<SpawnTrait> {
        return simpleTraitRegistryEntry(SpawnTrait);
    }
}
