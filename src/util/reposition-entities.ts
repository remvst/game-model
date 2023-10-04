import Entity from "../entity";
import Vector2 from "../vector2";
import { roundToNearest } from "./math";

export function repositionEntities(
    entities: Entity[],
    newCenter: Vector2,
    precision: number,
) {
    const minX = entities.reduce((acc, entity) => Math.min(acc, entity.x), Number.MAX_SAFE_INTEGER);
    const minY = entities.reduce((acc, entity) => Math.min(acc, entity.y), Number.MAX_SAFE_INTEGER);
    const maxX = entities.reduce((acc, entity) => Math.max(acc, entity.x), Number.MIN_SAFE_INTEGER);
    const maxY = entities.reduce((acc, entity) => Math.max(acc, entity.y), Number.MIN_SAFE_INTEGER);

    const midPointX = (minX + maxX) / 2;
    const midPointY = (minY + maxY) / 2;

    const offsetX = roundToNearest(newCenter.x - midPointX, precision); 
    const offsetY = roundToNearest(newCenter.y - midPointY, precision); 

    for (const entity of entities) {
        entity.position.x += offsetX;
        entity.position.y += offsetY;
    }
}
