import { Entity } from "../../src/entity";
import { Trigger } from "../../src/events/trigger";
import { TriggerEvent } from "../../src/events/trigger-event";
import { GameModelApp } from "../../src/game-model-app";
import { SerializationOptions } from "../../src/serialization/serialization-options";
import { World } from "../../src/world";

describe("move to event", () => {
    let app: GameModelApp;

    beforeEach(() => {
        app = new GameModelApp();
        app.worldEventRegistry.add(Trigger.registryEntry());
        app.finalize();
    });

    it("can be applied", () => {
        const event = new Trigger();
        event.entityId = "entityId";
        event.triggererId = "triggererId";

        const world = new World();

        const entity = new Entity("entityId", []);
        entity.position.x = 123;
        entity.position.y = 456;
        world.entities.add(entity);

        spyOn(entity, "addEvent").and.callThrough();

        world.addEvent(event);

        expect(entity.addEvent).toHaveBeenCalled();

        const entityEvent = (entity.addEvent as jasmine.Spy).calls.argsFor(
            0,
        )[0];
        expect(entityEvent).toBeInstanceOf(TriggerEvent);
        expect((entityEvent as TriggerEvent).triggererId).toBe("triggererId");
    });

    it("can be serialized", () => {
        const event = new Trigger();
        event.entityId = "ent";
        event.triggererId = "triggererid";

        const options = new SerializationOptions();
        const serialized = app.serializers.packed.worldEvent.serialize(
            event,
            options,
        );
        const deserialized = app.serializers.packed.worldEvent.deserialize(
            serialized,
            options,
        ) as unknown as Trigger;

        expect(deserialized.entityId).toBe(event.entityId);
        expect(deserialized.triggererId).toBe(event.triggererId);
    });
});
