export function distinctValues<T>(...arrays: T[][]): T[] {
    return Array.from(new Set(arrays.flat()));
}