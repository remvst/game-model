import { Rectangle } from "@remvst/geometry";

class Item<T> {
    object!: T;
    readonly area = new Rectangle();
}

export class QuadTree<T> {
    private readonly nodePool: QuadTreeNode<T>[] = [];
    private readonly itemPool: Item<T>[] = [];

    private root: QuadTreeNode<T> = this.getNode();

    maxNodeSize = 5;

    reset(bounds: Rectangle) {
        for (const node of this.browse(this.root)) {
            for (const item of node.items) {
                this.itemPool.push(item);
            }

            node.northWest = null;
            node.northEast = null;
            node.southWest = null;
            node.southEast = null;
            node.items.length = 0;

            this.nodePool.push(node);
        }

        this.root = this.getNode();
        this.root.area.copy(bounds);
    }

    insert(object: T, area: Rectangle) {
        this.root?.insert(object, area);
    }

    *query(area: Rectangle): Iterable<T> {
        yield* this.root.query(area);
    }

    private getItem(): Item<T> {
        return this.itemPool.pop() || new Item();
    }

    private getNode(): QuadTreeNode<T> {
        const node =
            this.nodePool.pop() ||
            new QuadTreeNode(
                () => this.getNode(),
                () => this.getItem(),
                (item) => this.itemPool.push(item),
            );
        node.maxSize = this.maxNodeSize;
        return node;
    }

    private *browse(node: QuadTreeNode<T> | null): Iterable<QuadTreeNode<T>> {
        if (!node) return;
        yield* this.browse(node.northWest);
        yield* this.browse(node.northEast);
        yield* this.browse(node.southWest);
        yield* this.browse(node.southEast);
        yield node;
    }
}

class QuadTreeNode<T> {
    readonly area = new Rectangle();

    maxSize = 5;

    constructor(
        private readonly createNode: () => QuadTreeNode<T>,
        private createItem: () => Item<T>,
        private poolItem: (item: Item<T>) => void,
    ) {}

    northWest: QuadTreeNode<T> | null = null;
    northEast: QuadTreeNode<T> | null = null;
    southWest: QuadTreeNode<T> | null = null;
    southEast: QuadTreeNode<T> | null = null;

    items: Item<T>[] = [];

    insert(object: T, area: Rectangle) {
        if (!this.area.intersects(area)) {
            return;
        }

        if (!this.northEast) {
            // No children yet
            if (this.items.length < this.maxSize) {
                const item = this.createItem();
                item.object = object;
                item.area.copy(area);
                this.items.push(item);
            } else {
                // Split!
                this.northWest = this.createNode();
                this.northWest.area.setBounds(
                    this.area.minX,
                    this.area.minY,
                    this.area.midX,
                    this.area.midY,
                );

                this.northEast = this.createNode();
                this.northEast.area.setBounds(
                    this.area.midX,
                    this.area.minY,
                    this.area.maxX,
                    this.area.midY,
                );

                this.southWest = this.createNode();
                this.southWest.area.setBounds(
                    this.area.minX,
                    this.area.midY,
                    this.area.midX,
                    this.area.maxY,
                );

                this.southEast = this.createNode();
                this.southEast.area.setBounds(
                    this.area.midX,
                    this.area.midY,
                    this.area.maxX,
                    this.area.maxY,
                );

                const items = this.items.slice();
                this.items.length = 0;

                for (const item of items) {
                    const { object, area } = item;
                    this.insert(object, area);
                    this.poolItem(item);
                }

                this.insert(object, area);
            }
            return;
        }

        const inNorthWest = this.northWest?.area.intersects(area) ? 1 : 0;
        const inNorthEast = this.northEast?.area.intersects(area) ? 1 : 0;
        const inSouthWest = this.southWest?.area.intersects(area) ? 1 : 0;
        const inSouthEast = this.southEast?.area.intersects(area) ? 1 : 0;

        const count = inNorthWest + inNorthEast + inSouthWest + inSouthEast;

        if (count === 1) {
            if (inNorthWest) this.northWest?.insert(object, area);
            if (inNorthEast) this.northEast?.insert(object, area);
            if (inSouthWest) this.southWest?.insert(object, area);
            if (inSouthEast) this.southEast?.insert(object, area);
        } else {
            const item = this.createItem();
            item.object = object;
            item.area.copy(area);
            this.items.push(item);
        }
    }

    *query(area: Rectangle): Iterable<T> {
        if (!this.area.intersects(area)) {
            return;
        }

        for (const item of this.items) {
            if (!item.area.intersects(area)) continue;
            yield item.object;
        }

        if (this.northWest) yield* this.northWest.query(area);
        if (this.northEast) yield* this.northEast.query(area);
        if (this.southWest) yield* this.southWest.query(area);
        if (this.southEast) yield* this.southEast.query(area);
    }
}
