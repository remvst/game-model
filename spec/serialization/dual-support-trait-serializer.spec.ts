import { TraitSerializer } from '../../src/serialization/serializer';
import { Trait, traitGetSet, TraitRegistry, PropertyType, PackedTraitSerializer } from "../../src";
import DualSupportTraitSerializer from '../../src/serialization/dual-support-trait-serializer';
import SerializationOptions, { SerializationType } from '../../src/serialization/serialization-options';

describe('the dual support trait serializer', () => {
    
    class TestTrait extends Trait {
        static readonly key: string = 'testtrait';
        readonly key: string = TestTrait.key;
        
        stringProp: string | null = 'hello';
    }

    let registry: TraitRegistry;
    let serializer: TraitSerializer<TestTrait, any>;
    let packedSerializer: TraitSerializer<TestTrait, any>;
    let jsonSerializer: TraitSerializer<TestTrait, any>;

    beforeEach(() => {
        registry = new TraitRegistry();

        registry.add({
            traitType: TestTrait,
            properties: [
                traitGetSet(TestTrait, 'stringProp', PropertyType.str(), (trait) => trait.stringProp, (trait, stringProp) => trait.stringProp = stringProp),
            ],
        });

        const entry = registry.entry(TestTrait.key)!;
        serializer = new DualSupportTraitSerializer(entry);
        packedSerializer = new PackedTraitSerializer(entry);
        jsonSerializer = new PackedTraitSerializer(entry);
    });

    it('will serialize everything as packed', () => {
        const options = new SerializationOptions();
        options.type = SerializationType.PACKED;

        const trait = new TestTrait();
        const serialized = serializer.serialize(trait, options);
        expect(serialized).toEqual(packedSerializer.serialize(trait, options));
    });

    it('will serialize everything as verbose', () => {
        const options = new SerializationOptions();
        options.type = SerializationType.VERBOSE;

        const trait = new TestTrait();
        const serialized = serializer.serialize(trait, options);
        expect(serialized).toEqual(jsonSerializer.serialize(trait, options));
    });

    it('can deserialize from the packed serializer', () => {
        const trait = new TestTrait();
        trait.stringProp = 'yoyo';

        const serialized = packedSerializer.serialize(trait, new SerializationOptions());
        const deserialized = serializer.deserialize(serialized);

        expect(deserialized.stringProp).toEqual(trait.stringProp);
    });

    it('can deserialize from the json serializer', () => {
        const trait = new TestTrait();
        trait.stringProp = 'yoyo';

        const serialized = jsonSerializer.serialize(trait, new SerializationOptions());
        const deserialized = serializer.deserialize(serialized);

        expect(deserialized.stringProp).toEqual(trait.stringProp);
    });
});
