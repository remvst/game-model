import { Rectangle } from "@remvst/geometry";
import { Entity, ObjectSet, Trait, TraitSurfaceProvider, WatchableObjectSet, rectangleSurface } from "../src";
import Chunked from "../src/chunked";

describe('a chunked entity set', () => {
    let originalSet: WatchableObjectSet<Entity>;
    let chunked: Chunked;

    beforeEach(() => {
        originalSet = new WatchableObjectSet(new ObjectSet(
            entity => entity.id,
            entity => entity.traits.map(trait => trait.key),
        ));
        chunked = new Chunked(originalSet);
    });

    class TestTrait extends Trait {
        static readonly key = 'test';
        readonly key = TestTrait.key;

        constructor(readonly rectangle: Rectangle) {
            super();
        }

        surfaceProvider: TraitSurfaceProvider = rectangleSurface((trait, out) => {
            out.update(this.rectangle.minX, this.rectangle.minY, this.rectangle.width, this.rectangle.height);
        });
    }

    function testEntity(rectangle: Rectangle): Entity {
        const entity = new Entity(undefined, [new TestTrait(rectangle)]);
        entity.position.x = rectangle.midX;
        entity.position.y = rectangle.midY;
        return entity;
    }

    it('will not chunk anything by default', () => {
        const entity1 = testEntity(new Rectangle(
            Number.MIN_SAFE_INTEGER,
            Number.MIN_SAFE_INTEGER,
            1,
            1,
        ));
        originalSet.add(entity1)

        const entity2 = testEntity(new Rectangle(
            Number.MAX_SAFE_INTEGER,
            Number.MAX_SAFE_INTEGER,
            1,
            1,
        ));
        originalSet.add(entity2);
        
        chunked.update();

        expect(chunked.entities.size).toBe(2);
    });

    it('will only add entities near the visible rectangle', () => {
        const entity1 = testEntity(new Rectangle(0, 0, 1, 1));
        originalSet.add(entity1);

        const entity2 = testEntity(new Rectangle(100, 0, 1, 1));
        originalSet.add(entity2);

        chunked.visibleRectangleProvider = rect => rect.centerAround(
            entity1.position.x,
            entity1.position.y,
            10,
            10,
        );
        
        chunked.update();

        expect(chunked.entities.size).toBe(1);
        expect(chunked.entities.getByKey(entity1.id)).toBeTruthy();
        expect(chunked.entities.getByKey(entity2.id)).toBeFalsy();
    });

    it('will add entities if they\'re near the visible rectangle', () => {
        const entity = testEntity(new Rectangle(0, 0, 0, 0));
        originalSet.add(entity);

        chunked.visibleRectangleProvider = rect => rect.update(
            entity.position.x + 5,
            entity.position.y + 5,
            10,
            10,
        );
        
        chunked.update();

        expect(chunked.entities.size).toBe(1);
        expect(chunked.entities.getByKey(entity.id)).toBeTruthy();
    });
});
