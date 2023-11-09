import World from "../../world";
import { WorldSetup } from "../all-serializers";
import SerializationOptions from "../serialization-options";
import { EntitySerializer, WorldSerializer } from "../serializer";
import { VerboseSerializedEntity } from "./verbose-entity-serializer";

export interface VerboseSerializedWorld {
    entities: VerboseSerializedEntity[];
}

export class VerboseWorldSerializer implements WorldSerializer<VerboseSerializedWorld> {

    worldSetup: WorldSetup = () => {};

    constructor(
        private readonly entitySerializer: EntitySerializer<VerboseSerializedEntity>,
    ) {

    }

    serialize(world: World, options: SerializationOptions): VerboseSerializedWorld {
        const entities: VerboseSerializedEntity[] = [];
        world.entities.forEach((entity) => {
            if (!options.shouldSerializeEntity(entity)) {
                return;
            }

            try {
                const serialized = this.entitySerializer.serialize(entity, options);
                entities.push(serialized);
            } catch (e) {
                // entity is not serializable, skip
            }
        });

        return { entities };
    }

    deserialize(serialized: VerboseSerializedWorld, options: SerializationOptions): World {
        const world = new World();
        this.worldSetup(world);

        serialized.entities.forEach(serializedEntity => {
            try {
                const entity = this.entitySerializer.deserialize(serializedEntity, options);
                world.entities.add(entity);
            } catch (e) {
                console.error('Failed to deserialize', JSON.stringify(serializedEntity), e);
            }
        });
        return world;
    }

}
