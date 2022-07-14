import { Rectangle } from "@remvst/geometry";
export default class SectorObjectSet<ObjectType> {
    readonly sectorSize: number;
    private readonly sectors;
    private minX;
    private minY;
    private maxX;
    private maxY;
    constructor(sectorSize: number);
    insert(object: ObjectType, area: Rectangle): void;
    nonRepeatingQuery(area: Rectangle): Iterable<ObjectType>;
    query(area: Rectangle): Iterable<ObjectType>;
    clear(): void;
}
