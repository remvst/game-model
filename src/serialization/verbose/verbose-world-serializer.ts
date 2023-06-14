import World from "../../world";
import { WorldSetup } from "../json-serializers";
import SerializationOptions from "../serialization-options";
import { AnySerialized, EntitySerializer, WorldSerializer } from "../serializer";

export interface JsonSerializedWorld {
    entities: AnySerialized[];
}

export class VerboseWorldSerializer implements WorldSerializer<JsonSerializedWorld> {
    constructor(
        private readonly entitySerializer: EntitySerializer<AnySerialized>,
        public worldSetup: WorldSetup,
    ) {

    }

    serialize(world: World, options: SerializationOptions): JsonSerializedWorld {
        const entities: AnySerialized[] = [];
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

    deserialize(serialized: JsonSerializedWorld, options: SerializationOptions): World {
        const world = new World();
        this.worldSetup(world);

        serialized.entities.forEach(serializedEntity => {
            try {
                const entity = this.entitySerializer.deserialize(serializedEntity, options);
                world.entities.add(entity);
            } catch (e) {
                console.error('Failed to deserialize', serializedEntity, e);
            }
        });
        return world;
    }

}
