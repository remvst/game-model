export function between(a: number, b: number, c: number) {
    if (b < a) {
        return a;
    } if (b > c) {
        return c;
    }
    return b;
};

export function isBetween(a: number, b: number, c: number) {
    return (a <= b && b <= c) || (a >= b && b >= c);
};
