import type { Result } from "@/sys/result/core";
import { success, failure } from "@/sys/result/core";
import type { TypeConfig } from './types';
import type { ComparisonResult } from './comparison.methods';
import { compareBigValues, compareValues, } from './comparison.methods';
import { clampBigValue, clampValue } from './clamp.methods';
import { isInBigRange, isInURange, isInSRange } from './inrange.methods';

// exports
export type { BitPosition, PrimitiveBase, UnsignedPrimitiveBase, TypeConfig } from './types';
export { isBitPosition, getBitPosition, getBitPositionRange } from './bitposition.methods';
export { COMPARISON_LESS, COMPARISON_EQUAL, COMPARISON_GREATER } from './comparison.methods';
export type { ComparisonResult } from './comparison.methods';

/** The radix (base) used for hexadecimal number representation. */
export const HEX_RADIX = 16;
/** The radix (base) used for octal number representation. */
export const OCTAL_RADIX = 8;
/** The radix (base) used for binary number representation. */
export const BINARY_RADIX = 2;
/** The standard length of a hexadecimal string representation. */
export const HEX_STRING_LENGTH = 2;
/**
 * A regular expression pattern to validate hexadecimal strings.
 * Matches strings containing 1 or 2 hexadecimal characters (0-9, a-f, A-F).
 */
export const HEX_PATTERN = /^[0-9a-fA-F]{1,2}$/;

/**
 * Clamps a bigint value to the specified range and applies a mask.
 *
 * @template T - The type of the bigint value.
 * @param value - The bigint value to clamp.
 * @param config - The configuration specifying the range and mask.
 * @returns The clamped and masked bigint value.
 */
export const clampToBigType = <T extends bigint>(value: bigint, config: TypeConfig<T>): T => {
    const clamped = clampBigValue(value, config.MIN, config.MAX);
    return (clamped & (config.MASK as bigint)) as T;
};
/**
 * Clamps a number value to the specified range and applies a mask.
 *
 * @template T - The type of the number value.
 * @param value - The number value to clamp.
 * @param config - The configuration specifying the range and mask.
 * @returns The clamped and masked number value.
 */
export const clampToType = <T extends number>(value: number, config: TypeConfig<T>): T => {
    const clamped = clampValue(value, config.MIN, config.MAX);
    return (clamped & config.MASK) as T;
};

/**
 * Compares two bigint values and returns the result of the comparison.
 *
 * @template T - The type of the bigint values.
 * @param a - The first bigint value to compare.
 * @param b - The second bigint value to compare.
 * @returns A `ComparisonResult` indicating whether `a` is less than, equal to, or greater than `b`.
 */
export const compareBigType = <T extends bigint>(a: T, b: T): ComparisonResult => compareBigValues(a as bigint, b as bigint);
/**
 * Compares two number values and returns the result of the comparison.
 *
 * @template T - The type of the number values.
 * @param a - The first number value to compare.
 * @param b - The second number value to compare.
 * @returns A `ComparisonResult` indicating whether `a` is less than, equal to, or greater than `b`.
 */
export const compareType = <T extends number>(a: T, b: T): ComparisonResult => compareValues(a as number, b as number);

/**
 * Determines if a bigint value is within the specified range.
 *
 * @template T - The type of the bigint value.
 * @param value - The bigint value to check.
 * @param config - The configuration specifying the range.
 * @returns `true` if the value is within the range; otherwise, `false`.
 */
export const isBigType = <T extends bigint>(value: bigint, config: TypeConfig<T>): value is T =>
    isInBigRange(value, config.MIN, config.MAX);
/**
 * Determines if a number value is within the specified unsigned range.
 *
 * @template T - The type of the number value.
 * @param value - The number value to check.
 * @param config - The configuration specifying the range.
 * @returns `true` if the value is within the range; otherwise, `false`.
 */
export const isUType = <T extends number>(value: number, config: TypeConfig<T>): value is T =>
    isInURange(value, config.MIN, config.MAX);
/**
 * Determines if a number value is within the specified signed range.
 *
 * @template T - The type of the number value.
 * @param value - The number value to check.
 * @param config - The configuration specifying the range.
 * @returns `true` if the value is within the range; otherwise, `false`.
 */
export const isSType = <T extends number>(value: number, config: TypeConfig<T>): value is T =>
    isInSRange(value, config.MIN, config.MAX);

/**
 * Parses a bigint value and ensures it is within the specified range, applying a mask if valid.
 *
 * @template T - The type of the bigint value.
 * @param value - The bigint value to parse.
 * @param config - The configuration specifying the range and mask.
 * @returns A `Result` containing the parsed value if valid, or an error message if invalid.
 */
export const parseBigType = <T extends bigint>(value: bigint, config: TypeConfig<T>): Result<T> => {
    if (isBigType(value, config)) {
        return success((value & (config.MASK as bigint)) as T);
    }
    return failure(`Value must be an big integer in range [${config.MIN}, ${config.MAX}], received: ${value}`);
};
/**
 * Parses a number value and ensures it is within the specified unsigned range, applying a mask if valid.
 *
 * @template T - The type of the number value.
 * @param value - The number value to parse.
 * @param config - The configuration specifying the range and mask.
 * @returns A `Result` containing the parsed value if valid, or an error message if invalid.
 */
export const parseUType = <T extends number>(value: number, config: TypeConfig<T>): Result<T> => {
    if (isUType(value, config)) {
        return success((value & config.MASK) as T);
    }
    return failure(`Value must be an unsigned integer in range [${config.MIN}, ${config.MAX}], received: ${value}`);
};
/**
 * Parses a number value and ensures it is within the specified signed range, applying a mask if valid.
 *
 * @template T - The type of the number value.
 * @param value - The number value to parse.
 * @param config - The configuration specifying the range and mask.
 * @returns A `Result` containing the parsed value if valid, or an error message if invalid.
 */
export const parseSType = <T extends number>(value: number, config: TypeConfig<T>): Result<T> => {
    if (isSType(value, config)) {
        return success((value & config.MASK) as T);
    }
    return failure(`Value must be a signed integer in range [${config.MIN}, ${config.MAX}], received: ${value}`);
};