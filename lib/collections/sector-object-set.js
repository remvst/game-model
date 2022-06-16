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
    }
    *query(area) {
        const startSectorX = Math.floor(area.x / this.sectorSize);
        const startSectorY = Math.floor(area.y / this.sectorSize);
        const endSectorX = Math.floor(area.maxX / this.sectorSize);
        const endSectorY = Math.floor(area.maxY / this.sectorSize);
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
    }
}
exports.default = SectorObjectSet;
