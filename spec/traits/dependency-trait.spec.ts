import { DependencyTrait, Entity, GameModelApp, SerializationOptions } from "../../src";

describe('dependency trait', () => {
    let app: GameModelApp;

    beforeEach(() => {
        app = new GameModelApp();
        app.traitRegistry.add(DependencyTrait.registryEntry());
        app.finalize();
    });

    fit('can be serialized', () => {
        const trait = new DependencyTrait();
        trait.dependerIds = ['depender1', 'depender2'];
        trait.dependsOnIds = ['dependsOn1', 'dependsOn2'];

        const entity = new Entity(undefined, [trait]);

        const options = new SerializationOptions();
        const serialized = app.serializers.entity.serialize(entity, options);
        const deserialized = app.serializers.entity.deserialize(serialized, options);

        expect(deserialized.id).toBe(entity.id);
        expect(deserialized.age).toBe(entity.age);
        expect(deserialized.position.x).toBe(entity.position.x);
        expect(deserialized.position.y).toBe(entity.position.y);

        const traitCopy = deserialized.traitOfType(DependencyTrait);
        expect(traitCopy?.dependerIds).toEqual(trait.dependerIds);
        expect(traitCopy?.dependsOnIds).toEqual(trait.dependsOnIds);
    });
});