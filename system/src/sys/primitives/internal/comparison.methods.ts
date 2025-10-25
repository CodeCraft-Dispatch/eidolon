/**
 * Represents the result of a comparison where the first value is less than the second.
 */
export const COMPARISON_LESS = -1;

/**
 * Represents the result of a comparison where the first value is equal to the second.
 */
export const COMPARISON_EQUAL = 0;

/**
 * Represents the result of a comparison where the first value is greater than the second.
 */
export const COMPARISON_GREATER = 1;

/**
 * A type representing the possible results of a comparison operation.
 * - `-1`: Indicates the first value is less than the second.
 * - `0`: Indicates the first value is equal to the second.
 * - `1`: Indicates the first value is greater than the second.
 */
export type ComparisonResult = -1 | 0 | 1;

// ============================================================================
// INTERNAL
// ============================================================================

export const compareBigValues = (a: bigint, b: bigint): ComparisonResult => {
    const lessMask = ((a - b) >> BigInt(63)) & BigInt(1); // 1 if a < b, 0 otherwise
    const greaterMask = ((b - a) >> BigInt(63)) & BigInt(1); // 1 if a > b, 0 otherwise
    return (greaterMask - lessMask) as unknown as ComparisonResult;
}

export const compareValues = (a: number, b: number): ComparisonResult => {
    const lessMask = ((a - b) >> 31) & 1;
    const greaterMask = ((b - a) >> 31) & 1;
    return (greaterMask - lessMask) as ComparisonResult;
}