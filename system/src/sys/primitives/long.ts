import type { Result } from "@/sys/result/core";
import type { BIT } from "./bit";
import { getBitAtBigInt, isBitSetInBigIntAt, setBitInBigIntAt, setBitOffInBigIntAt, setBitOnInBigIntAt, toggleBitInBigIntAt } from "./internal/bits";
import type { BitPosition, ComparisonResult, TypeConfig } from "./internal/primitives";
import { clampToBigType, compareBigType, getBitPositionRange, isBigType, parseBigType } from "./internal/primitives";
export { HEX_RADIX, OCTAL_RADIX, BINARY_RADIX, HEX_STRING_LENGTH, HEX_PATTERN, COMPARISON_LESS, COMPARISON_EQUAL, COMPARISON_GREATER } from "./internal/primitives";
export type { ComparisonResult, PrimitiveBase, TypeConfig, BitPosition } from "./internal/primitives";

// ============================================================================
// LONG
// ============================================================================
declare const __longBrand: unique symbol;
export type LONG = bigint & { readonly [__longBrand]: true };
export type LongBitPosition = BitPosition<63>;

const LONG_CONFIG: TypeConfig<LONG> = {
    MIN: -9223372036854775808n as LONG,
    MAX: 9223372036854775807n as LONG,
    MASK: 0xFFFFFFFFFFFFFFFFn as LONG
};

const bigintToLong = (num: bigint): LONG => {
    const wrapped = num & LONG_CONFIG.MASK;
    return (wrapped > LONG_CONFIG.MAX ? wrapped - (LONG_CONFIG.MASK + 1n) : wrapped) as LONG;
}

export const MIN_LONG_VALUE: LONG = LONG_CONFIG.MIN;
export const MAX_LONG_VALUE: LONG = LONG_CONFIG.MAX;
export const LONG_MASK: LONG = LONG_CONFIG.MASK;
export const BITS_PER_LONG = 64;
export const LONG_BINARY_PATTERN = new RegExp(`^[01]{1,${BITS_PER_LONG}}$`);

export const LONG_BIT_POSITIONS = getBitPositionRange<63, LongBitPosition>(63);

export const longToBigIntValue = (long: LONG): bigint => long as bigint;
export const unsafeLong = (value: bigint): LONG => bigintToLong(value);
export const isLong = (value: bigint): value is LONG => isBigType(value, LONG_CONFIG);
export const parseLong = (value: bigint): Result<LONG> => parseBigType(value, LONG_CONFIG);
export const clampToLong = (value: bigint): LONG => clampToBigType(value, LONG_CONFIG);
export const compareLongs = (a: LONG, b: LONG): ComparisonResult => compareBigType(a, b);

export const getBitFromLongAt = (value: LONG, position: LongBitPosition): BIT =>
    getBitAtBigInt<LONG, 63, LongBitPosition>(value, position);
export const setBitInLongAt = (value: LONG, position: LongBitPosition, bit: BIT): LONG =>
    setBitInBigIntAt<LONG, 63, LongBitPosition>(value, position, bit);
export const setBitOnInLongAt = (value: LONG, position: LongBitPosition): LONG =>
    setBitOnInBigIntAt<LONG, 63, LongBitPosition>(value, position);
export const setBitOffInLongAt = (value: LONG, position: LongBitPosition): LONG =>
    setBitOffInBigIntAt<LONG, 63, LongBitPosition>(value, position);
export const toggleBitInLongAt = (value: LONG, position: LongBitPosition): LONG =>
    toggleBitInBigIntAt<LONG, 63, LongBitPosition>(value, position);
export const isBitSetInLongAt = (value: LONG, position: LongBitPosition): boolean =>
    isBitSetInBigIntAt<LONG, 63, LongBitPosition>(value, position);