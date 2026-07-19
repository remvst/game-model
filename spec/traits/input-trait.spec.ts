import { entity } from "../../src/entity";
import { InputTrait } from "../../src/traits/input-trait";
import { World } from "../../src/world";

describe("input trait", () => {
    let world: World;
    let inputTrait: InputTrait;

    beforeEach(() => {
        world = new World();
        inputTrait = new InputTrait();
        world.entities.add(entity([inputTrait]));
    });

    describe("getNum / setNum", () => {
        it("returns 0 by default", () => {
            expect(inputTrait.getNum("speed")).toBe(0);
        });

        it("returns the value after setNum", () => {
            inputTrait.setNum("speed", 42);
            expect(inputTrait.getNum("speed")).toBe(42);
        });

        it("returns 0 when trait is disabled", () => {
            inputTrait.setNum("speed", 42);
            inputTrait.enabled = false;
            expect(inputTrait.getNum("speed")).toBe(0);
        });

        it("returns the value again after re-enabling", () => {
            inputTrait.setNum("speed", 42);
            inputTrait.enabled = false;
            inputTrait.enabled = true;
            expect(inputTrait.getNum("speed")).toBe(42);
        });
    });

    describe("getBool / setBool", () => {
        it("returns false by default", () => {
            expect(inputTrait.getBool("jump")).toBeFalse();
        });

        it("returns true after setBool(true)", () => {
            inputTrait.setBool("jump", true);
            expect(inputTrait.getBool("jump")).toBeTrue();
        });

        it("returns false after setBool(false)", () => {
            inputTrait.setBool("jump", true);
            inputTrait.setBool("jump", false);
            expect(inputTrait.getBool("jump")).toBeFalse();
        });

        it("returns false when trait is disabled", () => {
            inputTrait.setBool("jump", true);
            inputTrait.enabled = false;
            expect(inputTrait.getBool("jump")).toBeFalse();
        });
    });

    it("tracks keys independently", () => {
        inputTrait.setNum("a", 1);
        expect(inputTrait.getNum("b")).toBe(0);
    });
});
