import { Rectangle } from "@remvst/geometry";
import ObjectSet from "./collections/object-set";
import Entity from "./entity";
import { isBetween } from "./math";
import WatchableObjectSet from "./collections/watchable-object-set";

const REUSABLE_GEOMETRY_AREA = new Rectangle();

export default class Chunked {

    readonly entities = new WatchableObjectSet(new ObjectSet<Entity>(
        entity => entity.id,
        entity => entity.traits.map(trait => trait.key)
    ));

    private readonly visible = new Rectangle();
    private readonly chunk = new Rectangle();

    onChunkUpdated: () => void;

    visibleRectangleProvider: (
        visible: Rectangle, 
    ) => void = (rect) => rect.update(
        Number.MIN_SAFE_INTEGER / 2, 
        Number.MIN_SAFE_INTEGER / 2, 
        Number.MAX_SAFE_INTEGER, 
        Number.MAX_SAFE_INTEGER,
    );

    constructor(private readonly worldEntities: WatchableObjectSet<Entity>) {
        this.worldEntities.additions.subscribe((entity) => this.onEntityAdded(entity));
        this.worldEntities.removals.subscribe((entity) => this.onEntityRemoved(entity));
    }

    private rectangleContainsEntity(rectangle: Rectangle, entity: Entity): boolean {
        if (rectangle.containsPoint(entity.position)) {
            return true;
        }

        for (const trait of entity.traits.items()) {
            if (trait.disableChunking) {
                return true;
            }

            trait.surfaceProvider.surface(trait, REUSABLE_GEOMETRY_AREA);
            if (rectangle.intersects(REUSABLE_GEOMETRY_AREA)) {
                return true;
            }
        }

        return false;
    }

    private maybeAddEntity(entity: Entity) {
        if (this.rectangleContainsEntity(this.chunk, entity)) {
            this.entities.add(entity);
        } else {
            this.entities.remove(entity);
        }
    }

    private onEntityAdded(entity: Entity) {
        this.maybeAddEntity(entity);
    }

    private onEntityRemoved(entity: Entity) {
        this.entities.remove(entity);
    }

    update() {
        this.visible.update(
            Number.MIN_SAFE_INTEGER / 2, 
            Number.MIN_SAFE_INTEGER / 2, 
            Number.MAX_SAFE_INTEGER, 
            Number.MAX_SAFE_INTEGER,
        )
        this.visibleRectangleProvider(this.visible);

        if (
            isBetween(this.chunk.minX, this.visible.minX, this.chunk.maxX) &&
            isBetween(this.chunk.minX, this.visible.maxX, this.chunk.maxX) &&
            isBetween(this.chunk.minY, this.visible.minY, this.chunk.maxY) &&
            isBetween(this.chunk.minY, this.visible.maxY, this.chunk.maxY)
        ) {
            return;
        }

        this.chunk.centerAround(
            this.visible.midX,
            this.visible.midY,
            this.visible.width * 2,
            this.visible.height * 2,
        );

        for (const entity of this.worldEntities.items()) {
            this.maybeAddEntity(entity);
        }
    }
}
