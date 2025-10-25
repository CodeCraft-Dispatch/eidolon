import type { Result } from "@/sys/result/core";
import type { BIT } from "./bit";
import { getBitAtBigInt, isBitSetInBigIntAt, setBitInBigIntAt, setBitOffInBigIntAt, setBitOnInBigIntAt, toggleBitInBigIntAt } from "./internal/bits";
import type { BitPosition, ComparisonResult, TypeConfig, UnsignedPrimitiveBase } from "./internal/primitives";
import { clampToBigType, compareBigType, getBitPositionRange, isBigType, parseBigType } from "./internal/primitives";
export { HEX_RADIX, OCTAL_RADIX, BINARY_RADIX, HEX_STRING_LENGTH, HEX_PATTERN, COMPARISON_LESS, COMPARISON_EQUAL, COMPARISON_GREATER } from "./internal/primitives";
export type { ComparisonResult, PrimitiveBase, TypeConfig, BitPosition } from "./internal/primitives";

// ============================================================================
// ULONG
// ============================================================================
declare const __ulongBrand: unique symbol;
export type ULONG = UnsignedPrimitiveBase<bigint> & { readonly [__ulongBrand]: true };
export type ULongBitPosition = BitPosition<63>;

const ULONG_CONFIG: TypeConfig<ULONG> = {
    MIN: 0n as ULONG,
    MAX: 18446744073709551615n as ULONG,
    MASK: 0xFFFFFFFFFFFFFFFFn as ULONG
};

const bigintToULong = (num: bigint): ULONG => (num & ULONG_MASK) as ULONG;

export const MIN_ULONG_VALUE: ULONG = ULONG_CONFIG.MIN;
export const MAX_ULONG_VALUE: ULONG = ULONG_CONFIG.MAX;
export const ULONG_MASK: ULONG = ULONG_CONFIG.MASK;
export const BITS_PER_ULONG = 64;
export const ULONG_BINARY_PATTERN = new RegExp(`^[01]{1,${BITS_PER_ULONG}}$`);

export const ULONG_BIT_POSITIONS = getBitPositionRange<63, ULongBitPosition>(63);

export const ulongToBigIntValue = (ulong: ULONG): bigint => ulong as bigint;
export const unsafeULong = (value: bigint): ULONG => bigintToULong(value);
export const isULong = (value: bigint): value is ULONG => isBigType(value, ULONG_CONFIG);
export const parseULong = (value: bigint): Result<ULONG> => parseBigType(value, ULONG_CONFIG);
export const clampToULong = (value: bigint): ULONG => clampToBigType(value, ULONG_CONFIG);
export const compareULongs = (a: ULONG, b: ULONG): ComparisonResult => compareBigType(a, b);

export const getBitFromULongAt = (value: ULONG, position: ULongBitPosition): BIT =>
    getBitAtBigInt<ULONG, 63, ULongBitPosition>(value, position);
export const setBitInULongAt = (value: ULONG, position: ULongBitPosition, bit: BIT): ULONG =>
    setBitInBigIntAt<ULONG, 63, ULongBitPosition>(value, position, bit);
export const setBitOnInULongAt = (value: ULONG, position: ULongBitPosition): ULONG =>
    setBitOnInBigIntAt<ULONG, 63, ULongBitPosition>(value, position);
export const setBitOffInULongAt = (value: ULONG, position: ULongBitPosition): ULONG =>
    setBitOffInBigIntAt<ULONG, 63, ULongBitPosition>(value, position);
export const toggleBitInULongAt = (value: ULONG, position: ULongBitPosition): ULONG =>
    toggleBitInBigIntAt<ULONG, 63, ULongBitPosition>(value, position);
export const isBitSetInULongAt = (value: ULONG, position: ULongBitPosition): boolean =>
    isBitSetInBigIntAt<ULONG, 63, ULongBitPosition>(value, position);