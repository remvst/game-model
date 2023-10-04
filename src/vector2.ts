export default class Vector2 {
    constructor(public x: number = 0, public y: number = 0) {
    }
}

export function copyVec2(vec2: Vector2): Vector2 {
    return new Vector2(vec2.x, vec2.y);
}
