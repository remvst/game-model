import {
    PropertyConstraints,
    PropertyType,
} from "../../../src/properties/property-constraints";
import TraitRegistry, {
    traitRegistryEntry,
} from "../../../src/registry/trait-registry";
import PackedAutomaticTraitSerializer from "../../../src/serialization/packed/packed-automatic-trait-serializer";
import SerializationOptions from "../../../src/serialization/serialization-options";
import { TraitSerializer } from "../../../src/serialization/serializer";
import Trait from "../../../src/trait";

describe("the packed trait serializer", () => {
    class TestTrait extends Trait {
        static readonly key: string = "testtrait";
        readonly key: string = TestTrait.key;

        stringProp: string | null = "hello";
        stringArrayProp = ["hello", "world"];

        entityIdProp = "zee-id";
        entityIdArrayProp = ["zee", "id"];

        numberProp = 123;
        numberArrayProp = [456, 789];

        boolProp = false;
        boolArrayProp = [false, true];

        compositeProp = { id: "someid", delay: 123 };
        compositeArrayProp = [{ id: "someid", delay: 123 }];
    }

    let registry: TraitRegistry;
    let serializer: TraitSerializer<TestTrait, any>;

    beforeEach(() => {
        registry = new TraitRegistry();

        const compositeType = PropertyType.composite(
            new Map<string, PropertyConstraints<any>>([
                ["id", PropertyType.id()],
                ["delay", PropertyType.num()],
            ]),
        );

        registry.add(
            traitRegistryEntry<TestTrait>((builder) => {
                builder.traitClass(TestTrait);

                builder.simpleProp("stringProp", PropertyType.str());
                builder.simpleProp(
                    "stringArrayProp",
                    PropertyType.list(PropertyType.str()),
                );

                builder.simpleProp("entityIdProp", PropertyType.str());
                builder.simpleProp(
                    "entityIdArrayProp",
                    PropertyType.list(PropertyType.id()),
                );

                builder.simpleProp("boolProp", PropertyType.bool());
                builder.simpleProp(
                    "boolArrayProp",
                    PropertyType.list(PropertyType.bool()),
                );

                builder.simpleProp("numberProp", PropertyType.num());
                builder.simpleProp(
                    "numberArrayProp",
                    PropertyType.list(PropertyType.num()),
                );

                builder.simpleProp("compositeProp", compositeType);
                builder.simpleProp(
                    "compositeArrayProp",
                    PropertyType.list(compositeType),
                );
            }),
        );

        const entry = registry.entry(TestTrait.key)!;
        serializer = new PackedAutomaticTraitSerializer(entry);
    });

    it("can serialize then deserialize", () => {
        const trait = new TestTrait();
        expect(() =>
            serializer.serialize(trait, new SerializationOptions()),
        ).not.toThrow();
    });

    it("can serialize then deserialize and the properties will be accurate", () => {
        const trait = new TestTrait();
        trait.stringProp = "yoyo";
        trait.stringArrayProp = ["general", "kenobi"];

        trait.entityIdProp = "zee entity id";
        trait.entityIdArrayProp = ["zee", "entity", "id"];

        trait.numberProp = 12313124;
        trait.numberArrayProp = [1233, 456];

        trait.boolProp = false;
        trait.boolArrayProp = [true, false, true, false];

        trait.compositeProp = { id: "ha", delay: 1000 };
        trait.compositeArrayProp = [
            { id: "ha", delay: 1000 },
            { id: "ha", delay: 1000 },
        ];

        const serialized = serializer.serialize(
            trait,
            new SerializationOptions(),
        );
        const deserialized = serializer.deserialize(
            serialized,
            new SerializationOptions(),
        );

        expect(deserialized.stringProp).toEqual(trait.stringProp);
        expect(deserialized.stringArrayProp).toEqual(trait.stringArrayProp);
        expect(deserialized.numberProp).toEqual(trait.numberProp);
        expect(deserialized.numberArrayProp).toEqual(trait.numberArrayProp);
        expect(deserialized.boolProp).toEqual(trait.boolProp);
        expect(deserialized.boolArrayProp).toEqual(trait.boolArrayProp);
        expect(deserialized.entityIdProp).toEqual(trait.entityIdProp);
        expect(deserialized.entityIdArrayProp).toEqual(trait.entityIdArrayProp);
        expect(deserialized.compositeProp).toEqual(trait.compositeProp);
    });

    it("will work with nullables", () => {
        const trait = new TestTrait();
        trait.stringProp = null;

        const serialized = serializer.serialize(
            trait,
            new SerializationOptions(),
        );
        const deserialized = serializer.deserialize(
            serialized,
            new SerializationOptions(),
        );

        expect(deserialized.stringProp).toBe(trait.stringProp);
    });
});
