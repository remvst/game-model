import { Entity } from "../entity";
import { TriggerEvent } from "../events/trigger-event";
import { PropertyType } from "../properties/property-constraints";
import {
    TraitRegistryEntry,
    traitRegistryEntry,
} from "../registry/trait-registry";
import { Trait } from "../trait";
import { rectangleSurface } from "../trait-surface-provider";
import { firstItem } from "../util/first";
import { firstAvailableId } from "../util/first-available-id";
import { World } from "../world";
import { SpawnExtra, SpawnMapTrait } from "./spawn-map-trait";

export type SpawnType = string;

export class SpawnTrait extends Trait {
    static readonly key = "spawn";
    readonly key = SpawnTrait.key;

    private static readonly surfaceProvider = rectangleSurface(
        (trait, rect) => {
            rect.centerAround(trait.entity!.x, trait.entity!.y, 0, 0);
        },
    );
    readonly surfaceProvider = SpawnTrait.surfaceProvider;

    extra: SpawnExtra = {};

    constructor(
        public type: SpawnType = "",
        public spawnedEntityId: string | null = null,
        public autoActivate: boolean = true,
        public spawnCount: number = 1,
    ) {
        super();
    }

    postBind(): void {
        super.postBind();

        this.entity!.onEvent(TriggerEvent, (event, world) => {
            if (this.spawnCount <= 0) return;
            this.spawn(world, event);
        });
    }

    cycle(_: number) {
        if (this.autoActivate && this.spawnCount > 0) {
            this.entity!.addEvent(new TriggerEvent(this.entity!.id));
        }
    }

    private createEntity(world: World): Entity {
        const spawnMapTrait = firstItem(world.traitsOfType(SpawnMapTrait));
        if (!spawnMapTrait) throw new Error("No spawn map entity");

        const id = firstAvailableId(
            world,
            this.spawnedEntityId || this.entity!.id,
        );
        const entity = new Entity(
            id,
            spawnMapTrait.traitsFor(
                this.type,
                this.extra,
                this.entity!.position,
            ),
        );
        entity.x = this.entity!.position.x;
        entity.y = this.entity!.position.y;
        entity.z = this.entity!.position.z;
        return entity;
    }

    private spawn(world: World, event: TriggerEvent) {
        this.spawnCount--;
        if (this.spawnCount === 0) {
            this.entity?.remove();
        }

        const entity = this.createEntity(world);
        world.entities.add(entity);
    }

    static registryEntry(): TraitRegistryEntry<SpawnTrait> {
        return traitRegistryEntry((builder) => {
            builder.traitClass(SpawnTrait);
            builder.simpleProp("type", PropertyType.str());
            builder.simpleProp("spawnedEntityId", PropertyType.id());
            builder.simpleProp("autoActivate", PropertyType.bool());
            builder.simpleProp("spawnCount", PropertyType.num(-1, 60, 1));
            builder.property(
                "extra",
                PropertyType.str(),
                (trait) => JSON.stringify(trait.extra),
                (trait, extra) => (trait.extra = JSON.parse(extra)),
            );
        });
    }
}
