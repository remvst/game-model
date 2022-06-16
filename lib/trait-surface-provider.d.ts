import { Vector3 } from './vector3';
import { Rectangle } from "@remvst/geometry";
import Trait from './trait';
export interface TraitSurfaceProvider {
    readonly sectorSize: number;
    surface(trait: Trait, rectangle: Rectangle): void;
    containsPoint(trait: Trait, point: Vector3): boolean;
}
