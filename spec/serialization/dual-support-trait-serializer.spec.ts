import { TraitSerializer } from '../../src/serialization/serializer';
import { Trait, traitGetSet, TraitRegistry, PropertyType } from "../../src";
import SerializationOptions, { SerializationType } from '../../src/serialization/serialization-options';
import PackedAutomaticTraitSerializer from '../../src/serialization/packed/packed-automatic-trait-serializer';
import VerboseAutomaticTraitSerializer from '../../src/serialization/verbose/verbose-automatic-trait-serializer';
import DualSupportTraitSerializer from '../../src/serialization/dual/dual-support-trait-serializer';

describe('the dual support trait serializer', () => {
    
    class TestTrait extends Trait {
        static readonly key: string = 'testtrait';
        readonly key: string = TestTrait.key;
        
        stringProp: string | null = 'hello';
    }

    let registry: TraitRegistry;
    let serializer: TraitSerializer<TestTrait, any>;
    let packed: TraitSerializer<TestTrait, any>;
    let verbose: TraitSerializer<TestTrait, any>;

    beforeEach(() => {
        registry = new TraitRegistry();

        registry.add({
            traitType: TestTrait,
            properties: [
                traitGetSet(TestTrait, 'stringProp', PropertyType.str(), (trait) => trait.stringProp, (trait, stringProp) => trait.stringProp = stringProp),
            ],
        });

        const entry = registry.entry(TestTrait.key)!;
        packed = new PackedAutomaticTraitSerializer(entry);
        verbose = new VerboseAutomaticTraitSerializer(entry);
        serializer = new DualSupportTraitSerializer(verbose, packed);
    });

    it('will serialize everything as packed', () => {
        const options = new SerializationOptions();
        options.type = SerializationType.PACKED;

        const trait = new TestTrait();
        const serialized = serializer.serialize(trait, options);
        expect(serialized).toEqual(packed.serialize(trait, options));
    });

    it('will serialize everything as verbose', () => {
        const options = new SerializationOptions();
        options.type = SerializationType.VERBOSE;

        const trait = new TestTrait();
        const serialized = serializer.serialize(trait, options);
        expect(serialized).toEqual(verbose.serialize(trait, options));
    });

    it('can deserialize from the packed serializer', () => {
        const trait = new TestTrait();
        trait.stringProp = 'yoyo';

        const options = new SerializationOptions();
        options.type = SerializationType.PACKED;

        const serialized = packed.serialize(trait, options);
        const deserialized = serializer.deserialize(serialized, options);

        expect(deserialized.stringProp).toEqual(trait.stringProp);
    });

    it('can deserialize from the json serializer', () => {
        const trait = new TestTrait();
        trait.stringProp = 'yoyo';

        const options = new SerializationOptions();
        options.type = SerializationType.VERBOSE;

        const serialized = verbose.serialize(trait, options);
        const deserialized = serializer.deserialize(serialized, options);

        expect(deserialized.stringProp).toEqual(trait.stringProp);
    });
});
