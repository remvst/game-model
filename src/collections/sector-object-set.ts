import { Rectangle } from "@remvst/geometry";

class Sector<ObjectType> {

    constructor(
        readonly objects: ObjectType[] = [],
    ) {

    }

    insert(object: ObjectType) {
        this.objects.push(object);
    }
}

export default class SectorObjectSet<ObjectType> {
    private readonly sectors = new Map<string, Sector<ObjectType>>();
    private minX = Number.MAX_SAFE_INTEGER;
    private minY = Number.MAX_SAFE_INTEGER;
    private maxX = Number.MIN_SAFE_INTEGER;
    private maxY = Number.MIN_SAFE_INTEGER;

    constructor(
        readonly sectorSize: number,
    ) {

    }

    private sectorKey(x: number, y: number): string {
        return `${x},${y}`;
    }

    insert(object: ObjectType, area: Rectangle) {
        const startSectorX = Math.floor(area.x / this.sectorSize);
        const startSectorY = Math.floor(area.y / this.sectorSize);
        const endSectorX = Math.floor(area.maxX / this.sectorSize);
        const endSectorY = Math.floor(area.maxY / this.sectorSize);

        for (let sectorX = startSectorX ; sectorX <= endSectorX ; sectorX++) {
            for (let sectorY = startSectorY ; sectorY <= endSectorY ; sectorY++) {
                const index = this.sectorKey(sectorX, sectorY);
                const sector = this.sectors.get(index);
                if (!sector) {
                    this.sectors.set(index, new Sector([object]));
                } else {
                    sector.insert(object);
                }
            }
        }

        this.minX = Math.min(this.minX, area.x);
        this.minY = Math.min(this.minY, area.y);
        this.maxX = Math.max(this.maxX, area.maxX);
        this.maxY = Math.max(this.maxY, area.maxY);
    }

    * nonRepeatingQuery(area: Rectangle): Iterable<ObjectType> {
        const visited = new Set<ObjectType>();
        for (const result of this.query(area)) {
            if (visited.has(result)) {
                continue;
            }

            visited.add(result);
            yield result;
        }
    }

    * query(area: Rectangle): Iterable<ObjectType> {
        if (this.sectors.size === 0) return;

        const startSectorX = Math.floor(Math.max(this.minX, area.x) / this.sectorSize);
        const startSectorY = Math.floor(Math.max(this.minY, area.y) / this.sectorSize);
        const endSectorX = Math.floor(Math.min(this.maxX, area.maxX) / this.sectorSize);
        const endSectorY = Math.floor(Math.min(this.maxY, area.maxY) / this.sectorSize);

        for (let sectorX = startSectorX ; sectorX <= endSectorX ; sectorX++) {
            for (let sectorY = startSectorY ; sectorY <= endSectorY ; sectorY++) {
                const index = this.sectorKey(sectorX, sectorY);
                const sector = this.sectors.get(index);
                if (sector) {
                    yield* sector.objects;
                }
            }
        }
    }

    clear() {
        this.sectors.clear();
        this.minX = Number.MAX_SAFE_INTEGER;
        this.minY = Number.MAX_SAFE_INTEGER;
        this.maxX = Number.MIN_SAFE_INTEGER;
        this.maxY = Number.MIN_SAFE_INTEGER;
    }
}
