function normalize(str: string): string {
    // Remove all non-alphanumeric characters, make lowercase
    return str.replace(/[^a-zA-Z0-9]/g, '').toLowerCase().trim();
}

export function fuzzyIncludes(haystack: string, needle: string): boolean {
    const hay = normalize(haystack);
    const need = normalize(needle);
    return hay.includes(need);
}
