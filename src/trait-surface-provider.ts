import { Vector3 } from './vector3';
import { Rectangle } from "@remvst/geometry";
import Trait from './trait';

export interface TraitSurfaceProvider {
    surface(trait: Trait, rectangle: Rectangle): void;
    containsPoint(trait: Trait, point: Vector3): boolean;
}

const REUSABLE_GEOMETRY_AREA = new Rectangle(0, 0, 0, 0);

class SimpleTraitSurfaceProvider implements TraitSurfaceProvider {
    constructor(
        readonly surface: (trait: Trait, rectangle: Rectangle) => void,
    ) {

    }

    containsPoint(trait: Trait, point: Vector3) {
        this.surface(trait, REUSABLE_GEOMETRY_AREA);
        return REUSABLE_GEOMETRY_AREA.containsPoint(point);
    }
}

export function rectangleSurface(
    surface: (trait: Trait, rectangle: Rectangle) => void,
): TraitSurfaceProvider {
    return new SimpleTraitSurfaceProvider(surface);
};

export const entityPositionSurface: TraitSurfaceProvider = rectangleSurface(
    (trait, rectangle) => rectangle.update(trait.entity!.x, trait.entity!.y, 0, 0),
);
