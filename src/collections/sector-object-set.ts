import { Rectangle } from "@remvst/geometry";

class Sector<ObjectType> {

    constructor(
        readonly objects: ObjectType[],
    ) {

    }

    insert(object: ObjectType) {
        this.objects.push(object);
    }
}

export default class SectorObjectSet<ObjectType> {
    private readonly sectors = new Map<string, Sector<ObjectType>>();

    constructor(
        readonly sectorSize: number,
    ) {

    }

    insert(object: ObjectType, area: Rectangle) {
        const startSectorX = Math.floor(area.x / this.sectorSize);
        const startSectorY = Math.floor(area.y / this.sectorSize);
        const endSectorX = Math.floor(area.maxX / this.sectorSize);
        const endSectorY = Math.floor(area.maxY / this.sectorSize);

        for (let sectorX = startSectorX ; sectorX <= endSectorX ; sectorX++) {
            for (let sectorY = startSectorY ; sectorY <= endSectorY ; sectorY++) {
                const index = `${sectorX},${sectorY}`;
                const sector = this.sectors.get(index);
                if (!sector) {
                    this.sectors.set(index, new Sector([object]));
                } else {
                    sector.insert(object);
                }
            }
        }
    }

    * query(area: Rectangle): Iterable<ObjectType> {
        const startSectorX = Math.floor(area.x / this.sectorSize);
        const startSectorY = Math.floor(area.y / this.sectorSize);
        const endSectorX = Math.floor(area.maxX / this.sectorSize);
        const endSectorY = Math.floor(area.maxY / this.sectorSize);

        for (let sectorX = startSectorX ; sectorX <= endSectorX ; sectorX++) {
            for (let sectorY = startSectorY ; sectorY <= endSectorY ; sectorY++) {
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
