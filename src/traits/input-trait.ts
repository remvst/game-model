import { PropertyType } from "../properties/property-constraints";
import { TraitRegistryEntry, traitRegistryEntry } from "../registry/trait-registry";
import { Trait } from "../trait";

export class InputTrait extends Trait {
    static readonly key = "input";
    readonly key = InputTrait.key;

    private nums = new Map<string, number>();

    getBool(key: string): boolean {
        return this.getNum(key) !== 0;
    }

    setBool(key: string, value: boolean) {
        this.setNum(key, value ? 1 : 0);
    }

    getNum(key: string): number {
        if (!this.enabled) return 0;
        return this.nums.get(key) ?? 0;
    }

    setNum(key: string, value: number) {
        this.nums.set(key, value);
    }

    static registryEntry(): TraitRegistryEntry<InputTrait> {
        return traitRegistryEntry<InputTrait>(builder => {
            builder.traitClass(InputTrait);
            builder.property("nums", PropertyType.json({}), trait => Object.fromEntries(trait.nums), (trait, nums) => {
                trait.nums = new Map(Object.entries(nums))
            });
        });
    }
}
