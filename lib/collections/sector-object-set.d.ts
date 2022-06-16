import { Rectangle } from "@remvst/geometry";
export default class SectorObjectSet<ObjectType> {
    readonly sectorSize: number;
    private readonly sectors;
    constructor(sectorSize: number);
    insert(object: ObjectType, area: Rectangle): void;
    query(area: Rectangle): Iterable<ObjectType>;
    clear(): void;
}
