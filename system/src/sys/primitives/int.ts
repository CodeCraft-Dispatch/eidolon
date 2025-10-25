import type { Result } from "@/sys/result/core";
import type { BIT } from "./bit";
import { getBitAtNumber, isBitSetInNumberAt, setBitInNumberAt, setBitOffInNumberAt, setBitOnInNumberAt, toggleBitInNumberAt } from "./internal/bits";
import type { BitPosition, ComparisonResult, TypeConfig } from "./internal/primitives";
import { clampToType, compareType, getBitPositionRange, isSType, parseSType } from "./internal/primitives";
export { HEX_RADIX, OCTAL_RADIX, BINARY_RADIX, HEX_STRING_LENGTH, HEX_PATTERN, COMPARISON_LESS, COMPARISON_EQUAL, COMPARISON_GREATER } from "./internal/primitives";
export type { ComparisonResult, PrimitiveBase, TypeConfig, BitPosition } from "./internal/primitives";

// ============================================================================
// INT
// ============================================================================
declare const __intBrand: unique symbol;
export type INT = number & { readonly [__intBrand]: true };
export type IntBitPosition = BitPosition<31>;

const INT_CONFIG: TypeConfig<INT> = {
    MIN: -2147483648 as INT,
    MAX: 2147483647 as INT,
    MASK: 0xFFFFFFFF as INT
};

const numberToInt = (num: number): INT => (num | 0) as INT;

export const MIN_INT_VALUE: INT = INT_CONFIG.MIN;
export const MAX_INT_VALUE: INT = INT_CONFIG.MAX;
export const INT_MASK: INT = INT_CONFIG.MASK;
export const BITS_PER_INT = 32;
export const INT_BINARY_PATTERN = new RegExp(`^[01]{1,${BITS_PER_INT}}$`);

export const INT_BIT_POSITIONS = getBitPositionRange<31, IntBitPosition>(31);

export const intToNumberValue = (int: INT): number => int as number;
export const unsafeInt = (value: number): INT => numberToInt(value);
export const isInt = (value: number): value is INT => isSType(value, INT_CONFIG);
export const parseInt = (value: number): Result<INT> => parseSType(value, INT_CONFIG);
export const clampToInt = (value: number): INT => clampToType(value, INT_CONFIG);
export const compareInts = (a: INT, b: INT): ComparisonResult => compareType(a, b);

export const getBitFromIntAt = (value: INT, position: IntBitPosition): BIT =>
    getBitAtNumber<INT, 31, IntBitPosition>(value, position);
export const setBitInIntAt = (value: INT, position: IntBitPosition, bit: BIT): INT =>
    setBitInNumberAt<INT, 31, IntBitPosition>(value, position, bit);
export const setBitOnInIntAt = (value: INT, position: IntBitPosition): INT =>
    setBitOnInNumberAt<INT, 31, IntBitPosition>(value, position);
export const setBitOffInIntAt = (value: INT, position: IntBitPosition): INT =>
    setBitOffInNumberAt<INT, 31, IntBitPosition>(value, position);
export const toggleBitInIntAt = (value: INT, position: IntBitPosition): INT =>
    toggleBitInNumberAt<INT, 31, IntBitPosition>(value, position);
export const isBitSetInIntAt = (value: INT, position: IntBitPosition): boolean =>
    isBitSetInNumberAt<INT, 31, IntBitPosition>(value, position);