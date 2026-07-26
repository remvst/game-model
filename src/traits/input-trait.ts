import { PropertyType } from "../properties/property-constraints";
import { TraitRegistryEntry } from "../registry/trait-registry";
import {
    DefinitionsOfProps,
    SimpleTrait,
    simpleTraitRegistryEntry,
} from "./simple-trait";

export class InputTrait extends SimpleTrait<{ nums: Record<string, number> }> {
    static readonly key = "input";
    readonly key = InputTrait.key;

    definitions(): DefinitionsOfProps<InputTrait["props"]> {
        return {
            nums: PropertyType.json<Record<string, number>>({}),
        };
    }

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
        return simpleTraitRegistryEntry(InputTrait);
    }
}
