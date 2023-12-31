"use strict";

import { Entity, Trait, World } from "../src/index";

describe("a trait", () => {
    class Trait1 extends Trait {
        readonly key = "trait1";
        trait2: Trait2 | null = null;

        postBind() {
            this.trait2 = this.dependency<Trait2>("trait2");
        }
    }

    class Trait2 extends Trait {
        readonly key = "trait2";
        trait1: Trait1 | null = null;

        postBind() {
            this.trait1 = this.dependency<Trait1>("trait1");
        }
    }

    let world: World;

    beforeEach(() => {
        world = {
            defineSectorSet: jasmine.createSpy(),
        } as any;
    });

    it("can have a dependency on another trait", () => {
        const trait1 = new Trait1();
        const trait2 = new Trait2();

        const entity = new Entity(undefined, [trait1, trait2]);
        entity.bind(world);

        expect(trait1.trait2).toBe(trait2);
        expect(trait2.trait1).toBe(trait1);
    });

    it("throws an error if a dependency isn't satisfied", () => {
        const entity = new Entity(undefined, [new Trait1()]);
        expect(() => entity.bind(world)).toThrow();
    });

    it("cycles if enabled and entity has a world", () => {
        const trait1 = new Trait1();
        const trait2 = new Trait2();

        const entity = new Entity(undefined, [trait1, trait2]);

        spyOn(trait1, "cycle");

        trait1.enabled = false;
        trait1.maybeCycle(123);
        expect(trait1.cycle).not.toHaveBeenCalled();

        trait1.enabled = true;
        trait1.maybeCycle(456);
        expect(trait1.cycle).not.toHaveBeenCalled();

        entity.bind(world);
        trait1.maybeCycle(789);
        expect(trait1.cycle).toHaveBeenCalledWith(789);
    });
});
