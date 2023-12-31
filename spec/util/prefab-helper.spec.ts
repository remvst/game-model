import { Entity, GameModelApp, PrefabHelper, Vector2, World } from "../../src";

describe("the prefab helper", () => {
    let app: GameModelApp;
    let helper: PrefabHelper;

    beforeEach(() => {
        app = new GameModelApp();
        app.finalize();

        helper = new PrefabHelper(app);
    });

    it("can create a prefab from a few entities", () => {
        const entity1 = new Entity(undefined, []);
        const entity2 = new Entity(undefined, []);
        const entity3 = new Entity(undefined, []);

        const originWorld = new World();
        originWorld.entities.add(entity1);
        originWorld.entities.add(entity2);
        originWorld.entities.add(entity3);

        const prefab = helper.makePrefab(originWorld, [entity1, entity2]);
        expect(prefab).toBeTruthy();
    });

    it("can create a prefab from a few entities and then instantiate", () => {
        const entity1 = new Entity(undefined, []);
        const entity2 = new Entity(undefined, []);
        const entity3 = new Entity(undefined, []);

        const originWorld = new World();
        originWorld.entities.add(entity1);
        originWorld.entities.add(entity2);
        originWorld.entities.add(entity3);

        const prefab = helper.makePrefab(originWorld, [entity1, entity2]);

        const newEntities = helper.instantiatePrefab(
            prefab,
            originWorld,
            null,
            5,
        );
        expect(newEntities.length).toBe(2);

        for (const entity of newEntities) {
            expect(originWorld.entity(entity.id)).toBeTruthy();
        }
    });

    it("can create a prefab at a specific position", () => {
        const entity1 = new Entity(undefined, []);
        const entity2 = new Entity(undefined, []);

        entity1.position.x = -20;
        entity1.position.y = -20;
        entity2.position.x = 20;
        entity2.position.y = 20;

        const originWorld = new World();
        originWorld.entities.add(entity1);
        originWorld.entities.add(entity2);

        const prefab = helper.makePrefab(originWorld, [entity1, entity2]);

        const newEntities = helper.instantiatePrefab(
            prefab,
            originWorld,
            new Vector2(40, 20),
            5,
        );
        expect(newEntities.length).toBe(2);

        const [entity1Copy, entity2Copy] = newEntities;

        expect(entity1Copy.position.x).toBe(entity1.position.x + 40);
        expect(entity1Copy.position.y).toBe(entity1.position.y + 20);

        expect(entity2Copy.position.x).toBe(entity2.position.x + 40);
        expect(entity2Copy.position.y).toBe(entity2.position.y + 20);
    });
});
