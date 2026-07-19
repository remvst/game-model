import { SpawnMapTrait } from "../../src/traits/spawn-map-trait";

describe("spawn map trait", () => {
    let spawnMap: SpawnMapTrait;

    beforeEach(() => {
        spawnMap = new SpawnMapTrait();
    });

    it("returns traits from the registered function", () => {
        const result: never[] = [];
        const func = jasmine.createSpy("func").and.returnValue(result);

        spawnMap.define("enemy", func);

        const position = { x: 1, y: 2 };
        const extra = { level: 3 };
        const traits = spawnMap.traitsFor("enemy", extra, position);

        expect(func).toHaveBeenCalledWith(extra, position);
        expect(traits).toBe(result);
    });

    it("throws when the spawn type is not registered", () => {
        expect(() =>
            spawnMap.traitsFor("unknown", {}, { x: 0, y: 0 }),
        ).toThrowError(/No definition for spawn type unknown/);
    });

    it("define is chainable", () => {
        const result = spawnMap.define("enemy", () => []);
        expect(result).toBe(spawnMap);
    });

    it("supports multiple registered types independently", () => {
        const enemyTraits: never[] = [];
        const bossTraits: never[] = [];

        spawnMap.define("enemy", () => enemyTraits);
        spawnMap.define("boss", () => bossTraits);

        expect(spawnMap.traitsFor("enemy", {}, { x: 0, y: 0 })).toBe(
            enemyTraits,
        );
        expect(spawnMap.traitsFor("boss", {}, { x: 0, y: 0 })).toBe(bossTraits);
    });
});
