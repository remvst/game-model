import {
    Entity,
    GameModelApp,
    ScriptTrait,
    SerializationOptions,
} from "../../src";

describe("script trait", () => {
    let app: GameModelApp;

    beforeEach(() => {
        app = new GameModelApp();
        app.traitRegistry.add(ScriptTrait.registryEntry());
        app.finalize();
    });

    it("can be serialized", () => {
        const trait = new ScriptTrait();
        trait.triggerCount = 99;
        trait.steps = [
            { delay: 123, triggerEntityId: "entity123" },
            { delay: 456, triggerEntityId: "entity456" },
        ];

        const entity = new Entity(undefined, [trait]);

        const options = new SerializationOptions();
        const serialized = app.serializers.verbose.entity.serialize(
            entity,
            options,
        );
        const deserialized = app.serializers.verbose.entity.deserialize(
            serialized,
            options,
        );

        expect(deserialized.id).toBe(entity.id);
        expect(deserialized.age).toBe(entity.age);
        expect(deserialized.position.x).toBe(entity.position.x);
        expect(deserialized.position.y).toBe(entity.position.y);

        const traitCopy = deserialized.traitOfType(ScriptTrait);
        expect(traitCopy?.steps).toEqual(trait.steps);
        expect(traitCopy?.triggerCount).toEqual(trait.triggerCount);
    });
});
