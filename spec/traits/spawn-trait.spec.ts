import { entity, Entity } from "../../src/entity";
import { TriggerEvent } from "../../src/events/trigger-event";
import { Trait } from "../../src/trait";
import { SpawnMapTrait } from "../../src/traits/spawn-map-trait";
import { SpawnTrait } from "../../src/traits/spawn-trait";
import { World } from "../../src/world";

describe("spawn trait", () => {
    class SpawnedTrait extends Trait {
        static readonly key = "spawned";
        readonly key = SpawnedTrait.key;
    }

    let world: World;
    let spawnMap: SpawnMapTrait;
    let spawner: Entity;
    let spawnTrait: SpawnTrait;

    beforeEach(() => {
        world = new World();

        spawnMap = new SpawnMapTrait();
        spawnMap.define("enemy", () => [new SpawnedTrait()]);
        world.entities.add(entity([spawnMap]));

        spawnTrait = new SpawnTrait("enemy", null, false, 1);
        spawner = entity([spawnTrait]);
        spawner.position.x = 10;
        spawner.position.y = 20;
        world.entities.add(spawner);
    });

    function cycleAndSpawn() {
        // First cycle: SpawnTrait fires TriggerEvent → DelayedActionTrait entity created
        // Second cycle: DelayedActionTrait fires → entity spawned
        world.cycle(1);
        world.cycle(1);
    }

    it("spawns an entity when triggered", () => {
        spawner.addEvent(new TriggerEvent(spawner.id));

        world.cycle(1);

        expect(Array.from(world.traitsOfType(SpawnedTrait)).length).toBe(1);
    });

    it("spawns entity at the spawner's position", () => {
        spawner.addEvent(new TriggerEvent(spawner.id));
        world.cycle(1);

        const spawned = Array.from(world.traitsOfType(SpawnedTrait))[0];
        expect(spawned.entity!.position.x).toBe(10);
        expect(spawned.entity!.position.y).toBe(20);
    });

    it("removes itself after spawning when spawnCount is 1", () => {
        spawner.addEvent(new TriggerEvent(spawner.id));
        world.cycle(1);

        expect(Array.from(world.traitsOfType(SpawnTrait)).length).toBe(0);
    });

    it("does not remove itself when spawnCount is greater than 1", () => {
        spawnTrait.spawnCount = 2;

        spawner.addEvent(new TriggerEvent(spawner.id));
        world.cycle(1);

        expect(Array.from(world.traitsOfType(SpawnTrait)).length).toBe(1);
        expect(spawnTrait.spawnCount).toBe(1);
    });

    it("auto-activates when autoActivate is true", () => {
        spawnTrait.autoActivate = true;

        cycleAndSpawn();

        expect(Array.from(world.traitsOfType(SpawnedTrait)).length).toBe(1);
    });

    it("does not spawn when autoActivate is false and no trigger", () => {
        spawnTrait.autoActivate = false;

        cycleAndSpawn();

        expect(Array.from(world.traitsOfType(SpawnedTrait)).length).toBe(0);
    });

    it("passes extra to the spawn function", () => {
        const spawnFunc = jasmine
            .createSpy("spawnFunc")
            .and.returnValue([new SpawnedTrait()]);
        spawnMap.define("special", spawnFunc);
        spawnTrait.type = "special";
        spawnTrait.extra = { power: 42 };

        spawner.addEvent(new TriggerEvent(spawner.id));
        world.cycle(1);

        expect(spawnFunc).toHaveBeenCalledWith(
            { power: 42 },
            jasmine.objectContaining({ x: 10, y: 20 }),
        );
    });

    it("throws when no SpawnMapTrait exists in the world", () => {
        const emptyWorld = new World();
        const loneSpawner = entity([new SpawnTrait("enemy")]);
        emptyWorld.entities.add(loneSpawner);

        expect(() => {
            loneSpawner.addEvent(new TriggerEvent(loneSpawner.id));
        }).toThrowError(/No spawn map entity/);
    });
});
