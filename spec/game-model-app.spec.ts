import { CameraTrait, DependencyTrait, GameModelApp, Remove } from "../src";

describe('game model app', () => {
    it('has a different hash if it has different events', () => {
        const app1 = new GameModelApp();
        app1.worldEventRegistry.add(Remove.registryEntry());
        app1.finalize();

        const app2 = new GameModelApp();
        app2.finalize();

        expect(app1.hash).not.toEqual(app2.hash);
    });

    it('has the same hash if it has the same events', () => {
        const app1 = new GameModelApp();
        app1.worldEventRegistry.add(Remove.registryEntry());
        app1.finalize();

        const app2 = new GameModelApp();
        app2.worldEventRegistry.add(Remove.registryEntry());
        app2.finalize();

        expect(app1.hash).toEqual(app2.hash);
    });

    it('has a different hash if it has different traits', () => {
        const app1 = new GameModelApp();
        app1.traitRegistry.add(CameraTrait.registryEntry());
        app1.finalize();

        const app2 = new GameModelApp();
        app2.finalize();

        expect(app1.hash).not.toEqual(app2.hash);
    });

    it('has the same hash if it has the same traits', () => {
        const app1 = new GameModelApp();
        app1.traitRegistry.add(CameraTrait.registryEntry());
        app1.finalize();

        const app2 = new GameModelApp();
        app2.traitRegistry.add(CameraTrait.registryEntry());
        app2.finalize();

        expect(app1.hash).toEqual(app2.hash);
    });

    it('has the same hash if it has the same traits even if ordered differently', () => {
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
});
