import { Entity } from "../../src/entity";
import {
    AllSerializers,
    WorldSetup,
    allSerializers,
} from "../../src/serialization/all-serializers";
import {
    SerializationOptions,
    SerializationType,
} from "../../src/serialization/serialization-options";
import { TraitSerializer } from "../../src/serialization/serializer";
import { Trait } from "../../src/trait";
import { World } from "../../src/world";

describe("allSerializers", () => {
    class TestTrait1 extends Trait {
        static readonly key: string = "testtrait1";
        readonly key: string = TestTrait1.key;
        constructor(readonly prop: string) {
            super();
        }
    }

    class TestTrait1Serializer
        implements TraitSerializer<TestTrait1, { prop: string }>
    {
        serialize(value: TestTrait1): { prop: string } {
            return { prop: value.prop };
        }
        deserialize(serialized: { prop: string }): TestTrait1 {
            return new TestTrait1(serialized.prop);
        }
    }

    class TestTrait2 extends Trait {
        readonly key: string = "testtrait2";
    }

    let serializationOptions: SerializationOptions;
    let serializers: AllSerializers;
    let worldSetup: WorldSetup;

    beforeEach(() => {
        worldSetup = jasmine.createSpy();
        serializers = allSerializers();
        serializationOptions = new SerializationOptions();

        serializers.packed.world.worldSetup = worldSetup;
        serializers.verbose.world.worldSetup = worldSetup;

        serializers.verbose.trait.add(
            TestTrait1.key,
            new TestTrait1Serializer(),
        );
    });

    it("can serialize an empty world", () => {
        const world = new World();
        const serialized = serializers.verbose.world.serialize(
            world,
            serializationOptions,
        );
        const deserialized = serializers.verbose.world.deserialize(
            serialized,
            serializationOptions,
        );

        expect(deserialized.entities.size).toBe(0);
    });

    it("can serialize a world with an entity", () => {
        const entity = new Entity("ent", []);

        const world = new World();
        world.entities.add(entity);

        const serialized = serializers.verbose.world.serialize(
            world,
            serializationOptions,
        );
        const deserialized = serializers.verbose.world.deserialize(
            serialized,
            serializationOptions,
        );

        expect(deserialized.entities.size).toBe(1);
        expect(Array.from(deserialized.entities.items())[0].id).toBe(entity.id);
        expect(worldSetup).toHaveBeenCalledWith(deserialized);
    });

    it("can serialize a world with an entity with a trait with the VERBOSE option", () => {
        const entity = new Entity("ent", [new TestTrait1("myprop")]);
        entity.traitOfType(TestTrait1)!.enabled = false;

        const world = new World();
        world.entities.add(entity);

        serializationOptions.type = SerializationType.VERBOSE;

        const serialized = serializers.verbose.world.serialize(
            world,
            serializationOptions,
        );
        const deserialized = serializers.verbose.world.deserialize(
            serialized,
            serializationOptions,
        );

        expect(deserialized.entities.size).toBe(1);

        const deserializedEntity = Array.from(deserialized.entities.items())[0];
        const traits = Array.from(deserializedEntity.traits.items());

        expect(deserializedEntity.id).toBe(entity.id);
        expect(deserializedEntity.traits.size).toBe(1);
        expect(traits.length).toBe(1);
        expect((traits[0] as TestTrait1).prop).toBe("myprop");
        expect((traits[0] as TestTrait1).enabled).toBe(false);
    });

    it("can serialize a world with an entity with the PACKED option", () => {
        const entity = new Entity("ent", [new TestTrait1("myprop")]);
        entity.traitOfType(TestTrait1)!.enabled = false;

        const world = new World();
        world.entities.add(entity);

        serializationOptions.type = SerializationType.PACKED;

        const serialized = serializers.verbose.world.serialize(
            world,
            serializationOptions,
        );
        const deserialized = serializers.verbose.world.deserialize(
            serialized,
            serializationOptions,
        );

        expect(deserialized.entities.size).toBe(1);

        const deserializedEntity = Array.from(deserialized.entities.items())[0];
        const traits = Array.from(deserializedEntity.traits.items());

        expect(deserializedEntity.id).toBe(entity.id);
        expect(deserializedEntity.traits.size).toBe(1);
        expect(traits.length).toBe(1);
        expect((traits[0] as TestTrait1).prop).toBe("myprop");
        expect((traits[0] as TestTrait1).enabled).toBe(false);
    });

    it("will skip entities with non-serializable traits", () => {
        const entity = new Entity("ent", [
            new TestTrait1("myprop"),
            new TestTrait2(),
        ]);

        const world = new World();
        world.entities.add(entity);

        const serialized = serializers.verbose.world.serialize(
            world,
            serializationOptions,
        );
        const deserialized = serializers.verbose.world.deserialize(
            serialized,
            serializationOptions,
        );

        expect(deserialized.entities.size).toBe(0);
    });
});
