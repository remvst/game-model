import { TraitSerializer } from '../../src/serialization/serializer';
import { Trait, traitGetSet, TraitRegistry, PropertyType, PackedTraitSerializer } from "../../src";
import DualSupportTraitSerializer from '../../src/serialization/dual-support-trait-serializer';

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
        const trait = new TestTrait();
        const serialized = serializer.serialize(trait);
        expect(serialized).toEqual(packedSerializer.serialize(trait));
    });

    it('can deserialize from the packed serializer', () => {
        const trait = new TestTrait();
        trait.stringProp = 'yoyo';

        const serialized = packedSerializer.serialize(trait);
        const deserialized = serializer.deserialize(serialized);

        expect(deserialized.stringProp).toEqual(trait.stringProp);
    });

    it('can deserialize from the json serializer', () => {
        const trait = new TestTrait();
        trait.stringProp = 'yoyo';

        const serialized = jsonSerializer.serialize(trait);
        const deserialized = serializer.deserialize(serialized);

        expect(deserialized.stringProp).toEqual(trait.stringProp);
    });
});
