import { Entity } from "../../src/entity";
import { ChangePerformed } from "../../src/events/change-performed";
import { World } from "../../src/world";
import { GameModelApp } from "./../../src/game-model-app";
import { CameraTrait } from "./../../src/traits/camera-trait";
import { ScriptTrait } from "./../../src/traits/script-trait";
import { UndoRedoManager } from "./../../src/util/undo-redo-manager";

describe("the undo/redo manager", () => {
    let app: GameModelApp;
    let world: World;
    let undoRedoManager: UndoRedoManager;

    beforeEach(() => {
        app = new GameModelApp();
        app.traitRegistry.add(new ScriptTrait());
        app.finalize();

        world = new World();

        undoRedoManager = new UndoRedoManager(world, app);
    });

    it("does not prevent the world from cycling", () => {
        const entity1 = new Entity(undefined, []);
        world.entities.add(entity1);

        const entity2 = new Entity(undefined, []);
        undoRedoManager.transaction(() => {
            world.entities.add(entity2);
            world.cycle(1);
        });

        expect(world.entities.size).toBe(2);
        expect(world.entity(entity1.id)).toBe(entity1);
        expect(world.entity(entity2.id)).toBe(entity2);
    });

    it("can undo an entity creation", () => {
        const entity1 = new Entity(undefined, []);
        world.entities.add(entity1);
        expect(world.entities.size).toBe(1);

        undoRedoManager.undo();

        expect(world.entities.size).toBe(0);
    });

    it("can undo an entity removal", () => {
        const entity1 = new Entity(undefined, []);
        world.entities.add(entity1);
        expect(world.entities.size).toBe(1);

        world.entities.remove(entity1);
        expect(world.entities.size).toBe(0);

        undoRedoManager.undo();
        expect(world.entities.size).toBe(1);
    });

    it("can redo an entity creation", () => {
        const entity1 = new Entity(undefined, []);
        world.entities.add(entity1);
        expect(world.entities.size).toBe(1);

        undoRedoManager.undo();
        undoRedoManager.redo();

        expect(world.entities.size).toBe(1);
        expect(world.entity(entity1.id)).toBeTruthy();
    });

    it("can undo/redo multiple entity creations", () => {
        const entity1 = new Entity(undefined, []);
        world.entities.add(entity1);

        const entity2 = new Entity(undefined, []);
        world.entities.add(entity2);

        expect(world.entities.size).toBe(2);

        undoRedoManager.undo();
        undoRedoManager.undo();
        expect(world.entities.size).toBe(0);

        undoRedoManager.redo();
        undoRedoManager.redo();
        expect(world.entities.size).toBe(2);
    });

    it("can undo/redo multiple entity creations as a transaction", () => {
        undoRedoManager.transaction(() => {
            world.entities.add(new Entity(undefined, []));
            world.entities.add(new Entity(undefined, []));
        });

        expect(world.entities.size).toBe(2);

        undoRedoManager.undo();
        expect(world.entities.size).toBe(0);

        undoRedoManager.redo();
        expect(world.entities.size).toBe(2);
    });

    it("can undo/redo multiple entity property changes as a transaction", () => {
        const entity1 = new Entity(undefined, []);
        world.entities.add(entity1);

        const entity2 = new Entity(undefined, []);
        world.entities.add(entity2);

        undoRedoManager.transaction(() => {
            entity1.position.x = 123;
            entity2.position.x = 456;
            world.addEvent(new ChangePerformed());
        });

        expect(world.entity(entity1.id)!.position.x).toBe(123);
        expect(world.entity(entity2.id)!.position.x).toBe(456);

        undoRedoManager.undo();
        expect(world.entity(entity1.id)!.position.x).toBe(0);
        expect(world.entity(entity2.id)!.position.x).toBe(0);

        undoRedoManager.redo();
        expect(world.entity(entity1.id)!.position.x).toBe(123);
        expect(world.entity(entity2.id)!.position.x).toBe(456);
    });

    it("does not save the same state twice", () => {
        const entity1 = new Entity(undefined, []);
        world.entities.add(entity1);

        const entity2 = new Entity(undefined, []);
        world.entities.add(entity2);

        undoRedoManager.transaction(() => {
            entity1.position.x = 123;
            entity2.position.x = 456;
            world.addEvent(new ChangePerformed());
        });

        undoRedoManager.transaction(() => {
            world.addEvent(new ChangePerformed());
        });

        undoRedoManager.undo();
        expect(world.entity(entity1.id)!.position.x).toBe(0);
        expect(world.entity(entity2.id)!.position.x).toBe(0);
    });

    it("can trim the undo stack", () => {
        undoRedoManager.maxStackSize = 1;

        undoRedoManager.transaction(() => {
            world.entities.add(new Entity(undefined, []));
        });
        undoRedoManager.transaction(() => {
            world.entities.add(new Entity(undefined, []));
        });

        expect(world.entities.size).toBe(2);

        undoRedoManager.undo();
        expect(world.entities.size).toBe(1);

        undoRedoManager.undo();
        expect(world.entities.size).toBe(1);
    });

    it("does not explode when redoing when there is nothing to redo", () => {
        undoRedoManager.transaction(() => {
            world.entities.add(new Entity(undefined, []));
        });
        undoRedoManager.transaction(() => {
            world.entities.add(new Entity(undefined, []));
        });

        undoRedoManager.redo();
        undoRedoManager.redo();
        expect(world.entities.size).toBe(2);
    });

    it("does not affect non-serializable entities", () => {
        undoRedoManager.transaction(() => {
            world.entities.add(new Entity(undefined, []));
        });
        undoRedoManager.transaction(() => {
            world.entities.add(new Entity(undefined, [new CameraTrait()]));
        });

        undoRedoManager.undo();
        expect(world.entities.size).toBe(1);
        expect(world.entities.bucketSize(CameraTrait.key)).toBe(1);
    });

    it("is not affected by transactions that don't contain any changes", () => {
        undoRedoManager.transaction(() => {
            world.entities.add(new Entity(undefined, []));
        });
        undoRedoManager.transaction(() => {});

        undoRedoManager.undo();
        expect(world.entities.size).toBe(0);
    });

    it("handles nested transactions as one single transaction", () => {
        undoRedoManager.transaction(() => {
            world.entities.add(new Entity(undefined, []));
            undoRedoManager.transaction(() => {
                world.entities.add(new Entity(undefined, []));
            });
        });
        expect(world.entities.size).toBe(2);
        undoRedoManager.undo();
        expect(world.entities.size).toBe(0);
    });
});
