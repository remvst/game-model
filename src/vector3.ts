export interface Vector3 {
    x: number;
    y: number;
    z: number;
}

class SimpleVector3 implements Vector3 {
    constructor(
        public x: number = 0,
        public y: number = 0,
        public z: number = 0,
    ) {}
}

export function vector3(x: number = 0, y: number = 0, z: number = 0): Vector3 {
    return new SimpleVector3(x, y, z);
}
