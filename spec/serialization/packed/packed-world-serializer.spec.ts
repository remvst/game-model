import {
    EncoderSequence,
    Entity,
    EntitySerializer,
    SerializationOptions,
    SerializationType,
    World,
} from "../../../src";
import { PackedWorldSerializer } from "../../../src/serialization/packed/packed-world-serializer";

describe("packed world serializer", () => {
    let entitySerializer: EntitySerializer<EncoderSequence>;
    let serializer: PackedWorldSerializer;
    let options: SerializationOptions;

    beforeEach(() => {
        entitySerializer = {
            serialize: jasmine.createSpy().and.callFake((entity) => entity.id),
            deserialize: jasmine
                .createSpy()
                .and.callFake(() => new Entity(undefined, [])),
            getId: () => { throw new Error(); }
        };

        serializer = new PackedWorldSerializer(entitySerializer);

        options = new SerializationOptions();
        options.type = SerializationType.PACKED;
    });

    it("can serialize and deserialize a subset of entities", () => {
        const world = new World();
        const ent1 = new Entity("ent1", []);
        const ent2 = new Entity("ent2", []);
        world.entities.add(ent1);
        world.entities.add(ent2);

        options.shouldSerializeEntity = (entity) => entity === ent1;

        const serialized = serializer.serialize(world, options);
        const deserialized = serializer.deserialize(serialized, options);

        expect(deserialized.entities.size).toBe(1);

        expect(entitySerializer.serialize).toHaveBeenCalledWith(ent1, options);
        expect(entitySerializer.serialize).not.toHaveBeenCalledWith(
            ent2,
            options,
        );
    });
});
