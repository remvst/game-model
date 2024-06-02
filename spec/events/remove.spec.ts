import Entity from "../../src/entity";
import Remove from "../../src/events/remove";
import GameModelApp from "../../src/game-model-app";
import SerializationOptions from "../../src/serialization/serialization-options";
import World from "../../src/world";

describe("remove event", () => {
    let app: GameModelApp;

    beforeEach(() => {
        app = new GameModelApp();
        app.worldEventRegistry.add(Remove.registryEntry());
        app.finalize();
    });

    it("can be applied", () => {
        const event = new Remove("entityId");
        const world = new World();
        const entity = new Entity("entityId", []);
        world.entities.add(entity);

        world.addEvent(event);

        expect(entity.world).toBe(null);
    });

    it("can be serialized", () => {
        const event = new Remove();
        event.entityId = "ent";
        const options = new SerializationOptions();
        const serialized = app.serializers.packed.worldEvent.serialize(
            event,
            options,
        );
        const deserialized = app.serializers.packed.worldEvent.deserialize(
            serialized,
            options,
        ) as Remove;

        expect(deserialized.entityId).toBe(event.entityId);
    });
});
