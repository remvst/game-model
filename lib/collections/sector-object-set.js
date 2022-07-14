"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Sector {
    constructor(objects) {
        this.objects = objects;
    }
    insert(object) {
        this.objects.push(object);
    }
}
class SectorObjectSet {
    constructor(sectorSize) {
        this.sectorSize = sectorSize;
        this.sectors = new Map();
        this.minX = 0;
        this.minY = 0;
        this.maxX = 0;
        this.maxY = 0;
    }
    insert(object, area) {
        const startSectorX = Math.floor(area.x / this.sectorSize);
        const startSectorY = Math.floor(area.y / this.sectorSize);
        const endSectorX = Math.floor(area.maxX / this.sectorSize);
        const endSectorY = Math.floor(area.maxY / this.sectorSize);
        for (let sectorX = startSectorX; sectorX <= endSectorX; sectorX++) {
            for (let sectorY = startSectorY; sectorY <= endSectorY; sectorY++) {
                const index = `${sectorX},${sectorY}`;
                const sector = this.sectors.get(index);
                if (!sector) {
                    this.sectors.set(index, new Sector([object]));
                }
                else {
                    sector.insert(object);
                }
            }
        }
        this.minX = Math.min(this.minX, area.x);
        this.minY = Math.min(this.minY, area.y);
        this.maxX = Math.max(this.maxX, area.maxX);
        this.maxY = Math.max(this.maxY, area.maxY);
    }
    *query(area) {
        if (this.sectors.size === 0)
            return;
        const startSectorX = Math.max(this.minX, Math.floor(area.x / this.sectorSize));
        const startSectorY = Math.max(this.minY, Math.floor(area.y / this.sectorSize));
        const endSectorX = Math.min(this.maxX, Math.floor(area.maxX / this.sectorSize));
        const endSectorY = Math.min(this.maxY, Math.floor(area.maxY / this.sectorSize));
        for (let sectorX = startSectorX; sectorX <= endSectorX; sectorX++) {
            for (let sectorY = startSectorY; sectorY <= endSectorY; sectorY++) {
                const index = `${sectorX},${sectorY}`;
                const sector = this.sectors.get(index);
                if (sector) {
                    for (const object of sector.objects) {
                        yield object;
                    }
                }
            }
        }
    }
    clear() {
        this.sectors.clear();
        this.minX = Number.MAX_SAFE_INTEGER;
        this.minY = Number.MAX_SAFE_INTEGER;
        this.maxX = Number.MIN_SAFE_INTEGER;
        this.maxX = Number.MIN_SAFE_INTEGER;
    }
}
exports.default = SectorObjectSet;
