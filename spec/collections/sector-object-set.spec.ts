import { Rectangle } from "@remvst/geometry";
import SectorObjectSet from "../../src/collections/sector-object-set";

describe('a sector object set', () => {

    let set: SectorObjectSet<any>;

    beforeEach(() => {
        set = new SectorObjectSet(50);
    });

    it('can insert objects', () => {
        set.insert('myobj', new Rectangle(0, 0, 100, 100));
    });

    it('can query empty areas', () => {
        set.insert('myobj', new Rectangle(0, 0, 100, 100));

        const results = Array.from(set.query(new Rectangle(-10, -10, 5, 5)));
        expect(results).toEqual([]);
    });

    it('can query areas with objects', () => {
        set.insert('myobj', new Rectangle(0, 0, 100, 100));

        const results = Array.from(set.query(new Rectangle(0, 0, 10, 10)));
        expect(results).toEqual(['myobj']);
    });

    it('can sometimes return the same object multiple times', () => {
        set.insert('myobj', new Rectangle(0, 0, 100, 100));

        const results = Array.from(set.query(new Rectangle(0, 0, 50, 10)));
        expect(results).toEqual(['myobj', 'myobj']);
    });

    it('can make a non repeating query', () => {
        set.insert('myobj', new Rectangle(0, 0, 100, 100));

        const results = Array.from(set.query(new Rectangle(0, 0, 50, 10)));
        expect(results).toEqual(['myobj', 'myobj']);

        const nonRepeatingResults = Array.from(set.nonRepeatingQuery(new Rectangle(0, 0, 50, 10)));
        expect(nonRepeatingResults).toEqual(['myobj']);
    });

    it('can query areas with multiple objects', () => {
        set.insert('myobj', new Rectangle(5, 5, 10, 10));
        set.insert('myobj2', new Rectangle(20, 20, 10, 10));

        const results = Array.from(set.query(new Rectangle(0, 0, 10, 10)));
        expect(results).toEqual(['myobj', 'myobj2']);
    });
});
