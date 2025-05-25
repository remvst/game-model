import { Entity } from "../entity";
import { TriggerEvent } from "../events/trigger-event";
import { GameModelApp } from "../game-model-app";
import { PropertyType } from "../properties/property-constraints";
import {
    TraitRegistryEntry,
    traitRegistryEntry,
} from "../registry/trait-registry";
import { SerializationOptions } from "../serialization/serialization-options";
import { Trait } from "../trait";
import { World } from "../world";

export class ExpansionTrait extends Trait {
    static readonly key = "expansion";
    readonly key = ExpansionTrait.key;

    expansion = new World();

    addExpandedEntity(entity: Entity): void {
        this.expansion.entities.add(entity);

        entity.position.x = entity.position.x - this.entity.position.x;
        entity.position.y = entity.position.y - this.entity.position.y;
    }

    postBind(): void {
        super.postBind();
        this.entity.onEvent(TriggerEvent, (_, world) => this.expand(world));
    }

    expand(world: World): void {
        for (const entity of Array.from(this.expansion.entities.items())) {
            entity.remove();

            entity.position.x += this.entity.position.x;
            entity.position.y += this.entity.position.y;
            world.entities.add(entity);
        }

        this.entity.remove();
    }

    static registryEntry(
        app: GameModelApp,
    ): TraitRegistryEntry<ExpansionTrait> {
        return traitRegistryEntry((builder) => {
            builder.traitClass(ExpansionTrait);
            builder.property(
                "expansion",
                PropertyType.str(),
                (trait) => {
                    return JSON.stringify(
                        app.serializers.verbose.world.serialize(
                            trait.expansion,
                            new SerializationOptions(),
                        ),
                    );
                },
                (trait, serialized) => {
                    const parsed = JSON.parse(serialized);
                    trait.expansion = app.serializers.verbose.world.deserialize(
                        parsed,
                        new SerializationOptions(),
                    );
                },
            );
        });
    }
}
