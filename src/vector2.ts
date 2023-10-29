export interface Vector2Like {
    x: number;
    y: number;
}

export default class Vector2 implements Vector2Like {
    constructor(public x: number = 0, public y: number = 0) {
    }
}

export function copyVec2(vec2: Vector2Like): Vector2Like {
    return new Vector2(vec2.x, vec2.y);
}
