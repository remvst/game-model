import { Rectangle, isBetween } from "@remvst/geometry";
import { ObjectSet } from "./collections/object-set";
import { WatchableObjectSet } from "./collections/watchable-object-set";
import { Entity } from "./entity";

const REUSABLE_GEOMETRY_AREA = new Rectangle();

export class ChunkedEntitySet {
    readonly entities = new WatchableObjectSet(
        new ObjectSet<Entity>(
            (entity) => entity.id,
            (entity) => entity.traits.map((trait) => trait.key),
        ),
    );

    private readonly visible = new Rectangle();
    private readonly relevant = new Rectangle();

    visibleRectangleProvider: (
        visible: Rectangle,
        relevant: Rectangle,
    ) => void = (visible, relevant) => {
        visible.update(0, 0, 1, 1);
        relevant.update(
            Number.MIN_SAFE_INTEGER / 2,
            Number.MIN_SAFE_INTEGER / 2,
            Number.MAX_SAFE_INTEGER,
            Number.MAX_SAFE_INTEGER,
        );
    };

    constructor(private readonly worldEntities: WatchableObjectSet<Entity>) {
        this.worldEntities.additions.subscribe((entity) =>
            this.onEntityAdded(entity),
        );
        this.worldEntities.removals.subscribe((entity) =>
            this.onEntityRemoved(entity),
        );
    }

    private rectangleContainsEntity(
        rectangle: Rectangle,
        entity: Entity,
    ): boolean {
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
        if (this.rectangleContainsEntity(this.relevant, entity)) {
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
        );
        this.visibleRectangleProvider(this.visible, REUSABLE_GEOMETRY_AREA);

        if (
            isBetween(
                this.relevant.minX,
                this.visible.minX,
                this.relevant.maxX,
            ) &&
            isBetween(
                this.relevant.minX,
                this.visible.maxX,
                this.relevant.maxX,
            ) &&
            isBetween(
                this.relevant.minY,
                this.visible.minY,
                this.relevant.maxY,
            ) &&
            isBetween(this.relevant.minY, this.visible.maxY, this.relevant.maxY)
        ) {
            return;
        }

        this.relevant.update(
            REUSABLE_GEOMETRY_AREA.minX,
            REUSABLE_GEOMETRY_AREA.minY,
            REUSABLE_GEOMETRY_AREA.width,
            REUSABLE_GEOMETRY_AREA.height,
        );

        for (const entity of this.worldEntities.items()) {
            this.maybeAddEntity(entity);
        }
    }
}
