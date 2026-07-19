export function first<T>(iterable: Iterable<T>): T | null {
    if (!iterable) {
        return null;
    }
    if ((iterable as Set<T>).values) {
        return first((iterable as Set<T>).values());
    }
    if ((iterable as Generator<T>).next) {
        return (iterable as Generator<T>).next().value || null;
    }
    if (!isNaN((iterable as T[]).length)) {
        return (iterable as T[])[0] || null;
    }
    for (const value of iterable) return value;
    return null;
}

export function firstItem<T>(iterable: Iterable<T>): T | null {
    return first(iterable);
}

export function lastItem<T>(iterable: Iterable<T>): T | null {
    let last: T | null = null;
    if ("length" in iterable) {
        return (
            (iterable as Array<T>)[(iterable as Array<T>).length - 1] ?? null
        );
    }
    for (const item of iterable) {
        last = item;
    }
    return last;
}
