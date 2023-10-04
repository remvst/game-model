import Vector2 from "../vector2";

export function between(a: number, b: number, c: number) {
    if (b < a) {
        return a;
    } if (b > c) {
        return c;
    }
    return b;
};

export function notBetween(a: number, b: number, c: number): number {
    if (b <= a || c <= b ) return b;
    const mid = (a + c) / 2;
    if (b < mid) return a;
    return c;
}

export function isBetween(a: number, b: number, c: number) {
    return (a <= b && b <= c) || (a >= b && b >= c);
};

export function distance(a: Vector2, b: Vector2) {
    return pointDistance(a.x, a.y, b.x, b.y);
};

export function pointDistance(x1: number, y1: number, x2: number, y2: number) {
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
};

export function roundToNearest(x: number, precision: number) {
    return Math.round(x / precision) * precision;
};

export function floorToNearest(x: number, precision: number) {
    return Math.floor(x / precision) * precision;
};

export function ceilToNearest(x: number, precision: number) {
    return Math.ceil(x / precision) * precision;
};

export function roundFloat(x: number, decimals: number = 0) {
    const power = Math.pow(10, decimals);
    return Math.round(x * power) / power;
};

export function normalizeAngle(angle: number) {
    let normalized = angle;
    while (normalized < -Math.PI) normalized += Math.PI * 2;
    while (normalized > Math.PI) normalized -= Math.PI * 2;
    return normalized;
};

export function modulo(x: number, mod: number) {
    if (x >= 0) {
        return x % mod;
    }
    return x - mod * Math.floor(x / mod);
};
