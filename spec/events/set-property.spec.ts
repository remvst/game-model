import { Entity, EntityProperties } from "../../src/entity";
import { SetProperty } from "../../src/events/set-property";
import { GameModelApp } from "../../src/game-model-app";
import { SerializationOptions } from "../../src/serialization/serialization-options";
import { World } from "../../src/world";

describe("set property event", () => {
    let app: GameModelApp;

    beforeEach(() => {
        app = new GameModelApp();
        app.worldEventRegistry.add(SetProperty.registryEntry(app));
        app.finalize();
    });

    it("can be applied", () => {
        const event = new SetProperty("entityId", EntityProperties.x, 123);

        const world = new World();

        const entity = new Entity("entityId", []);
        world.entities.add(entity);

        world.addEvent(event);

        expect(entity.position.x).toBe(123);
    });

    it("can be serialized", () => {
        const event = new SetProperty("entityId", EntityProperties.x, 123);
        expect(event.entityId).toBe("entityId");
        expect(event.property).toBe(EntityProperties.x);
        expect(event.value).toBe(123);

        const options = new SerializationOptions();
        const serialized = app.serializers.verbose.worldEvent.serialize(
            event,
            options,
        );
        const deserialized = app.serializers.verbose.worldEvent.deserialize(
            serialized,
            options,
        ) as SetProperty;

        expect(deserialized.entityId).toBe(event.entityId);
        expect(deserialized.property).toBe(event.property);
        expect(deserialized.value).toBe(event.value);
    });
});
