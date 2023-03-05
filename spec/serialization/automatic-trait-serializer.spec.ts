import { TraitSerializer } from './../../src/serialization/serializer';
import { Trait, traitGetSet, TraitRegistry, PropertyType, AutomaticTraitSerializer } from "../../src";

describe('the automatic trait serializer', () => {
    
    class TestTrait extends Trait {
        static readonly key: string = 'testtrait';
        readonly key: string = TestTrait.key;
        
        stringProp = 'hello';
        stringArrayProp = ['hello', 'world'];

        entityIdProp = 'zee-id';
        entityIdArrayProp = ['zee', 'id'];

        numberProp = 123;
        numberArrayProp = [456, 789];

        boolProp = false;
        boolArrayProp = [false, true];
    }

    let registry: TraitRegistry;
    let serializer: TraitSerializer<TestTrait, any>;

    beforeEach(() => {
        registry = new TraitRegistry();

        registry.add({
            key: TestTrait.key,
            newTrait: () => new TestTrait(),
            properties: [
                traitGetSet(TestTrait, 'stringProp', PropertyType.str(), (trait) => trait.stringProp, (trait, stringProp) => trait.stringProp = stringProp),
                traitGetSet(TestTrait, 'stringArrayProp', PropertyType.list(PropertyType.str()), (trait) => trait.stringArrayProp, (trait, stringArrayProp) => trait.stringArrayProp = stringArrayProp),

                traitGetSet(TestTrait, 'entityIdProp', PropertyType.str(), (trait) => trait.entityIdProp, (trait, entityIdProp) => trait.entityIdProp = entityIdProp),
                traitGetSet(TestTrait, 'entityIdArrayProp', PropertyType.list(PropertyType.id()), (trait) => trait.entityIdArrayProp, (trait, entityIdArrayProp) => trait.entityIdArrayProp = entityIdArrayProp),

                traitGetSet(TestTrait, 'boolProp', PropertyType.bool(), (trait) => trait.boolProp, (trait, boolProp) => trait.boolProp = boolProp),
                traitGetSet(TestTrait, 'boolArrayProp', PropertyType.list(PropertyType.bool()), (trait) => trait.boolArrayProp, (trait, boolArrayProp) => trait.boolArrayProp = boolArrayProp),

                traitGetSet(TestTrait, 'numberProp', PropertyType.num(), (trait) => trait.numberProp, (trait, numberProp) => trait.numberProp = numberProp),
                traitGetSet(TestTrait, 'numberArrayProp', PropertyType.list(PropertyType.num()), (trait) => trait.numberArrayProp, (trait, numberArrayProp) => trait.numberArrayProp = numberArrayProp),
            ],
            serializer: (entry) => new AutomaticTraitSerializer(entry),
        });

        const entry = registry.entry(TestTrait.key);
        serializer = entry!.serializer!(entry!);
    });

    it('can serialize then deserialize', () => {
        const trait = new TestTrait();
        expect(() => serializer.serialize(trait)).not.toThrow();
    });

    it('can serialize then deserialize and the properties will be accurate', () => {
        const trait = new TestTrait();
        trait.stringProp = 'yoyo'
        trait.stringArrayProp = ['general', 'kenobi'];

        trait.entityIdProp = 'zee entity id';
        trait.entityIdArrayProp = ['zee', 'entity', 'id'];

        trait.numberProp = 12313124;
        trait.numberArrayProp = [1233, 456];

        trait.boolProp = false;
        trait.boolArrayProp = [true, false, true, false];

        const serialized = serializer.serialize(trait);
        const deserialized = serializer.deserialize(serialized);

        expect(deserialized.stringProp).toEqual(trait.stringProp);
        expect(deserialized.stringArrayProp).toEqual(trait.stringArrayProp);
        expect(deserialized.numberProp).toEqual(trait.numberProp);
        expect(deserialized.numberArrayProp).toEqual(trait.numberArrayProp);
        expect(deserialized.boolProp).toEqual(trait.boolProp);
        expect(deserialized.boolArrayProp).toEqual(trait.boolArrayProp);
        expect(deserialized.entityIdProp).toEqual(trait.entityIdProp);
        expect(deserialized.entityIdArrayProp).toEqual(trait.entityIdArrayProp);
    });
});
