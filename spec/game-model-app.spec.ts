import { Remove } from "../src/events/remove";
import { GameModelApp } from "../src/game-model-app";
import { PropertyType } from "../src/properties/property-constraints";
import { traitRegistryEntry } from "../src/registry/trait-registry";
import { Trait } from "../src/trait";
import { CameraTrait } from "../src/traits/camera-trait";
import { DependencyTrait } from "../src/traits/dependency-trait";

describe("game model app", () => {
    it("has a different hash if it has different events", () => {
        const app1 = new GameModelApp();
        app1.worldEventRegistry.add(Remove.registryEntry());
        app1.finalize();

        const app2 = new GameModelApp();
        app2.finalize();

        expect(app1.hash).not.toEqual(app2.hash);
    });

    it("has the same hash if it has the same events", () => {
        const app1 = new GameModelApp();
        app1.worldEventRegistry.add(Remove.registryEntry());
        app1.finalize();

        const app2 = new GameModelApp();
        app2.worldEventRegistry.add(Remove.registryEntry());
        app2.finalize();

        expect(app1.hash).toEqual(app2.hash);
    });

    it("has a different hash if it has different traits", () => {
        const app1 = new GameModelApp();
        app1.traitRegistry.add(CameraTrait.registryEntry());
        app1.finalize();

        const app2 = new GameModelApp();
        app2.finalize();

        expect(app1.hash).not.toEqual(app2.hash);
    });

    it("has the same hash if it has the same traits", () => {
        const app1 = new GameModelApp();
        app1.traitRegistry.add(CameraTrait.registryEntry());
        app1.finalize();

        const app2 = new GameModelApp();
        app2.traitRegistry.add(CameraTrait.registryEntry());
        app2.finalize();

        expect(app1.hash).toEqual(app2.hash);
    });

    it("has the same hash if it has the same traits even if ordered differently", () => {
        const app1 = new GameModelApp();
        app1.traitRegistry.add(CameraTrait.registryEntry());
        app1.traitRegistry.add(DependencyTrait.registryEntry());
        app1.finalize();

        const app2 = new GameModelApp();
        app2.traitRegistry.add(DependencyTrait.registryEntry());
        app2.traitRegistry.add(CameraTrait.registryEntry());
        app2.finalize();

        expect(app1.hash).toEqual(app2.hash);
    });

    it("has a different hash if trait properties are defined in different order", () => {
        class TraitV1 extends Trait {
            static readonly key = "mytrait";
            readonly key = TraitV1.key;

            foo: string = "";
            bar: string = "";

            static registryEntry() {
                return traitRegistryEntry<TraitV1>((builder) => {
                    builder.traitClass(TraitV1);
                    builder.simpleProp("foo", PropertyType.str());
                    builder.simpleProp("bar", PropertyType.str());
                });
            }
        }

        class TraitV2 extends Trait {
            static readonly key = "mytrait";
            readonly key = TraitV2.key;

            foo: string = "";
            bar: string = "";

            static registryEntry() {
                return traitRegistryEntry<TraitV2>((builder) => {
                    builder.traitClass(TraitV2);
                    builder.simpleProp("bar", PropertyType.str());
                    builder.simpleProp("foo", PropertyType.str());
                });
            }
        }

        const app1 = new GameModelApp();
        app1.traitRegistry.add(TraitV1.registryEntry());
        app1.finalize();

        const app2 = new GameModelApp();
        app2.traitRegistry.add(TraitV2.registryEntry());
        app2.finalize();

        expect(app1.hash).not.toEqual(app2.hash);
    });
});
