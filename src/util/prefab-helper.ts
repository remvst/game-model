import Entity from "../entity";
import GameModelApp from "../game-model-app";
import SerializationOptions from "../serialization/serialization-options";
import Vector2 from "../vector2";
import World from "../world";
import duplicateEntities from "./duplicate-entities";
import { repositionEntities } from "./reposition-entities";

export interface SerializedPrefab {
    entities: any[];
}

export default class PrefabHelper {

    constructor(private readonly app: GameModelApp) {

    }

    makePrefab(world: World, entities: Entity[]): SerializedPrefab {
        const ids = new Set(entities.map((entity) => entity.id));

        const options = new SerializationOptions();
        options.includeEntityAges = false;
        options.shouldSerializeEntity = (entity) => ids.has(entity.id);

        return this.app.serializers.verbose.world.serialize(world, options);
    }

    instantiatePrefab(
        prefab: SerializedPrefab,
        world: World,
        atPosition: Vector2 | null,
        precision: number,
    ): Entity[] {
        const prefabWorld = this.app.serializers.verbose.world.deserialize(prefab, new SerializationOptions());

        const entities = duplicateEntities(
            prefabWorld.entities.items(),
            world,
            this.app.serializers.verbose.entity,
            this.app.traitRegistry,
        );

        if (atPosition) repositionEntities(entities, atPosition, precision);

        for (const entity of entities) {
            world.entities.add(entity);
        }

        return entities;
    }
}
