import { Rectangle } from "@remvst/geometry";
import { SectorObjectSet } from "../../src/collections/sector-object-set";

describe("a sector object set", () => {
    let set: SectorObjectSet<any>;

    beforeEach(() => {
        set = new SectorObjectSet();
        set.area.setBounds(-1000, -1000, 1000, 1000);
        set.clear();
    });

    it("can insert objects", () => {
        set.insert("myobj", new Rectangle(0, 0, 100, 100));
    });

    it("can query empty areas", () => {
        set.insert("myobj", new Rectangle(0, 0, 100, 100));

        const results = Array.from(set.query(new Rectangle(-10, -10, 5, 5)));
        expect(results).toEqual([]);
    });

    it("can query areas with objects", () => {
        set.insert("myobj", new Rectangle(0, 0, 100, 100));

        const results = Array.from(set.query(new Rectangle(0, 0, 10, 10)));
        expect(results).toEqual(["myobj"]);
    });

    it("does not return the same object multiple times", () => {
        set.insert("myobj", new Rectangle(0, 0, 100, 100));

        const results = Array.from(set.query(new Rectangle(0, 0, 50, 10)));
        expect(results).toEqual(["myobj"]);
    });

    it("non repeating query returns same results as query", () => {
        set.insert("myobj", new Rectangle(0, 0, 100, 100));

        const results = Array.from(set.query(new Rectangle(0, 0, 50, 10)));
        const nonRepeatingResults = Array.from(
            set.nonRepeatingQuery(new Rectangle(0, 0, 50, 10)),
        );
        expect(nonRepeatingResults).toEqual(results);
    });

    it("can query areas with multiple objects", () => {
        set.insert("myobj", new Rectangle(5, 5, 10, 10));
        set.insert("myobj2", new Rectangle(20, 20, 10, 10));

        const results = Array.from(set.query(new Rectangle(0, 0, 100, 100)));
        expect(results).toContain("myobj");
        expect(results).toContain("myobj2");
    });
});
