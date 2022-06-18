import { Vector3 } from './vector3';
import { Rectangle } from "@remvst/geometry";
import Trait from './trait';

export interface TraitSurfaceProvider {
    readonly sectorSize: number;
    surface(trait: Trait, rectangle: Rectangle): void;
    containsPoint(trait: Trait, point: Vector3): boolean;
}

const REUSABLE_GEOMETRY_AREA = new Rectangle(0, 0, 0, 0);

class SimpleTraitSurfaceProvider implements TraitSurfaceProvider {
    constructor(
        readonly sectorSize: number,
        readonly surface: (trait: Trait, rectangle: Rectangle) => void,
    ) {

    }

    containsPoint(trait: Trait, point: Vector3) {
        this.surface(trait, REUSABLE_GEOMETRY_AREA);
        return point.x >= REUSABLE_GEOMETRY_AREA.x &&
            point.y >= REUSABLE_GEOMETRY_AREA.y &&
            point.x <= REUSABLE_GEOMETRY_AREA.maxX &&
            point.y <= REUSABLE_GEOMETRY_AREA.maxY;
    }
}

export function rectangleSurface(
    sectorSize: number,
    surface: (trait: Trait, rectangle: Rectangle) => void,
): TraitSurfaceProvider {
    return new SimpleTraitSurfaceProvider(sectorSize, surface);
};
