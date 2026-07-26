import { entity } from "../../src/entity";
import { PropertyType } from "../../src/properties/property-constraints";
import {
    DefinitionsOfProps,
    SimpleTrait,
    simpleTraitRegistryEntry,
} from "../../src/traits/simple-trait";

type MyProps = {
    name: string;
    count: number;
    enabled: boolean;
} & Record<string, any>;

class MyTrait extends SimpleTrait<MyProps> {
    static readonly key = "my";
    readonly key = MyTrait.key;

    definitions(): DefinitionsOfProps<MyProps> {
        return {
            name: PropertyType.str(),
            count: PropertyType.num(0, 100),
            enabled: PropertyType.bool(),
        };
    }
}

describe("SimpleTrait", () => {
    it("fills default values when no props are passed", () => {
        const trait = new MyTrait();
        expect(trait.props.name).toBe("");
        expect(trait.props.count).toBe(0);
        expect(trait.props.enabled).toBe(false);
    });

    it("uses provided prop values", () => {
        const trait = new MyTrait({ name: "hero", count: 5, enabled: true });
        expect(trait.props.name).toBe("hero");
        expect(trait.props.count).toBe(5);
        expect(trait.props.enabled).toBe(true);
    });

    it("fills missing props with defaults when only partial props are passed", () => {
        const trait = new MyTrait({ name: "hero" });
        expect(trait.props.name).toBe("hero");
        expect(trait.props.count).toBe(0);
        expect(trait.props.enabled).toBe(false);
    });

    it("starts with empty volatiles", () => {
        const trait = new MyTrait();
        expect(trait.volatiles).toEqual({});
    });

    it("is queriable", () => {
        const trait = new MyTrait();
        expect(trait.queriable).toBe(true);
    });
});

describe("simpleTraitRegistryEntry", () => {
    it("registers a property for each definition", () => {
        const entry = simpleTraitRegistryEntry(MyTrait);
        const identifiers = entry.properties!.map((p) => p.localIdentifier);
        expect(identifiers).toContain("name");
        expect(identifiers).toContain("count");
        expect(identifiers).toContain("enabled");
    });

    it("property identifiers are prefixed with the trait key", () => {
        const entry = simpleTraitRegistryEntry(MyTrait);
        for (const prop of entry.properties!) {
            expect(prop.identifier).toBe(
                `${MyTrait.key}.${prop.localIdentifier}`,
            );
        }
    });

    it("getter reads the current prop value via the entity", () => {
        const entry = simpleTraitRegistryEntry(MyTrait);
        const trait = new MyTrait({ name: "test", count: 7, enabled: true });
        const e = entity([trait]);

        const nameProp = entry.properties!.find(
            (p) => p.localIdentifier === "name",
        )!;
        const countProp = entry.properties!.find(
            (p) => p.localIdentifier === "count",
        )!;
        const enabledProp = entry.properties!.find(
            (p) => p.localIdentifier === "enabled",
        )!;

        expect(nameProp.get(e)).toBe("test");
        expect(countProp.get(e)).toBe(7);
        expect(enabledProp.get(e)).toBe(true);
    });

    it("setter updates the prop via the entity", () => {
        const entry = simpleTraitRegistryEntry(MyTrait);
        const trait = new MyTrait({ name: "before" });
        const e = entity([trait]);

        const nameProp = entry.properties!.find(
            (p) => p.localIdentifier === "name",
        )!;
        nameProp.set(e, "after");

        expect(trait.props.name).toBe("after");
    });

    it("registers the correct trait key", () => {
        const entry = simpleTraitRegistryEntry(MyTrait);
        expect(entry.key).toBe(MyTrait.key);
    });

    it("newTrait creates an instance with default props", () => {
        const entry = simpleTraitRegistryEntry(MyTrait);
        const trait = entry.newTrait!() as MyTrait;
        expect(trait.props.name).toBe("");
        expect(trait.props.count).toBe(0);
        expect(trait.props.enabled).toBe(false);
    });
});
