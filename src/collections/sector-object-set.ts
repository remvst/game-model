import { Rectangle } from "@remvst/geometry";
import { QuadTree } from "@remvst/optimization";

export class SectorObjectSet<ObjectType> {
    readonly area = new Rectangle();
    private readonly tree = new QuadTree<ObjectType>();

    version = -1;

    insert(object: ObjectType, area: Rectangle) {
        this.tree.insert(object, area);
    }

    *nonRepeatingQuery(area: Rectangle): Iterable<ObjectType> {
        yield* this.query(area); // Tree already guarantees non-repeating results
    }

    *query(area: Rectangle): Iterable<ObjectType> {
        yield* this.tree.query(area);
    }

    clear() {
        this.version = -1;
        this.tree.reset(this.area);
    }
}
