import { Entity } from "../../src/entity";
import { GameModelApp } from "../../src/game-model-app";
import { SerializationOptions } from "../../src/serialization/serialization-options";
import { DependencyTrait } from "../../src/traits/dependency-trait";

describe("dependency trait", () => {
    let app: GameModelApp;

    beforeEach(() => {
        app = new GameModelApp();
        app.traitRegistry.add(DependencyTrait.registryEntry());
        app.finalize();
    });

    it("can be serialized", () => {
        const trait = new DependencyTrait();
        trait.dependerIds = ["depender1", "depender2"];
        trait.dependsOnIds = ["dependsOn1", "dependsOn2"];

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

        const traitCopy = deserialized.traitOfType(DependencyTrait);
        expect(traitCopy?.dependerIds).toEqual(trait.dependerIds);
        expect(traitCopy?.dependsOnIds).toEqual(trait.dependsOnIds);
    });
});
