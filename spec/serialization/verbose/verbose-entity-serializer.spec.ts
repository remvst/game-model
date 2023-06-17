import { Entity, EntitySerializer, SerializationOptions, TraitSerializer } from "../../../src";
import VerboseEntitySerializer from "../../../src/serialization/verbose/verbose-entity-serializer";

describe('the verbose entity serializer', () => {
    let traitSerializer: TraitSerializer<any, any>;
    let serializer: EntitySerializer<any>;

    beforeEach(() => {
        traitSerializer = {} as TraitSerializer<any, any>;

        serializer = new VerboseEntitySerializer(traitSerializer);
    });

    it('will skip ages if specified', () => {
        const entity = new Entity(undefined, []);
        entity.age = 22.345;

        const options = new SerializationOptions();
        options.includeEntityAges = false;

        const serialized = serializer.serialize(entity, options);
        const deserialized = serializer.deserialize(serialized, options);
        expect(deserialized.age).toBe(0);
    });

    it('will include ages if specified', () => {
        const entity = new Entity(undefined, []);
        entity.age = 22.345;

        const options = new SerializationOptions();
        options.includeEntityAges = true;

        const serialized = serializer.serialize(entity, options);
        const deserialized = serializer.deserialize(serialized, options);
        expect(deserialized.age).toBe(22.345);
    });
});
