"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rectangleSurface = void 0;
const geometry_1 = require("@remvst/geometry");
const REUSABLE_GEOMETRY_AREA = new geometry_1.Rectangle(0, 0, 0, 0);
class SimpleTraitSurfaceProvider {
    constructor(sectorSize, surface) {
        this.sectorSize = sectorSize;
        this.surface = surface;
    }
    containsPoint(trait, point) {
        this.surface(trait, REUSABLE_GEOMETRY_AREA);
        return point.x >= REUSABLE_GEOMETRY_AREA.x &&
            point.y >= REUSABLE_GEOMETRY_AREA.y &&
            point.x <= REUSABLE_GEOMETRY_AREA.maxX &&
            point.y <= REUSABLE_GEOMETRY_AREA.maxY;
    }
}
function rectangleSurface(sectorSize, surface) {
    return new SimpleTraitSurfaceProvider(sectorSize, surface);
}
exports.rectangleSurface = rectangleSurface;
;
