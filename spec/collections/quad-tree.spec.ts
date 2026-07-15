import { Rectangle } from "@remvst/geometry";
import { QuadTree } from "../../src/collections/quad-tree";

function bounds(minX: number, minY: number, maxX: number, maxY: number): Rectangle {
    const r = new Rectangle();
    r.setBounds(minX, minY, maxX, maxY);
    return r;
}

function query(tree: QuadTree<string>, area: Rectangle): string[] {
    return Array.from(tree.query(area));
}

describe("QuadTree", () => {
    let tree: QuadTree<string>;
    const worldBounds = bounds(0, 0, 100, 100);

    beforeEach(() => {
        tree = new QuadTree();
        tree.reset(worldBounds);
    });

    it("returns nothing when empty", () => {
        expect(query(tree, bounds(0, 0, 100, 100))).toEqual([]);
    });

    it("returns an inserted item when queried with the same area", () => {
        tree.insert("a", bounds(10, 10, 20, 20));
        expect(query(tree, bounds(10, 10, 20, 20))).toContain("a");
    });

    it("returns an item whose area overlaps the query", () => {
        tree.insert("a", bounds(10, 10, 20, 20));
        expect(query(tree, bounds(15, 15, 30, 30))).toContain("a");
    });

    it("does not return an item outside the query area", () => {
        tree.insert("a", bounds(10, 10, 20, 20));
        expect(query(tree, bounds(50, 50, 60, 60))).not.toContain("a");
    });

    it("returns multiple items in the query area", () => {
        tree.insert("a", bounds(10, 10, 20, 20));
        tree.insert("b", bounds(15, 15, 25, 25));
        const result = query(tree, bounds(0, 0, 100, 100));
        expect(result).toContain("a");
        expect(result).toContain("b");
    });

    it("handles items that span multiple quadrants", () => {
        tree.insert("big", bounds(40, 40, 60, 60));
        expect(query(tree, bounds(45, 45, 55, 55))).toContain("big");
    });

    it("does not return items outside the world bounds", () => {
        tree.insert("a", bounds(10, 10, 20, 20));
        expect(query(tree, bounds(200, 200, 300, 300))).toEqual([]);
    });

    it("clears items on reset", () => {
        tree.insert("a", bounds(10, 10, 20, 20));
        tree.reset(worldBounds);
        expect(query(tree, bounds(0, 0, 100, 100))).toEqual([]);
    });

    it("works correctly after reset with new insertions", () => {
        tree.insert("a", bounds(10, 10, 20, 20));
        tree.reset(worldBounds);
        tree.insert("b", bounds(30, 30, 40, 40));
        const result = query(tree, bounds(0, 0, 100, 100));
        expect(result).not.toContain("a");
        expect(result).toContain("b");
    });

    it("handles more than 5 items in the same area, triggering a split", () => {
        for (let i = 0; i < 10; i++) {
            tree.insert(`item${i}`, bounds(10, 10, 20, 20));
        }
        const result = query(tree, bounds(10, 10, 20, 20));
        for (let i = 0; i < 10; i++) {
            expect(result).toContain(`item${i}`);
        }
    });

    it("reuses pooled nodes across resets without leaking state", () => {
        for (let i = 0; i < 10; i++) {
            tree.insert(`item${i}`, bounds(10 * i, 10 * i, 10 * i + 5, 10 * i + 5));
        }
        tree.reset(worldBounds);
        tree.insert("fresh", bounds(10, 10, 20, 20));
        const result = query(tree, bounds(0, 0, 100, 100));
        expect(result).toEqual(["fresh"]);
    });
});
