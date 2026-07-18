export function numberOrDefault(value: number, defaultValue: number) {
    return isNaN(value) ? defaultValue : value;
}

export function booleanOrDefault(value: boolean, defaultValue: boolean) {
    return typeof value !== "boolean" ? defaultValue : value;
}

export function getOrDefault<T>(value: T | undefined, defaultValue: T) {
    return value === undefined ? defaultValue : value;
}
