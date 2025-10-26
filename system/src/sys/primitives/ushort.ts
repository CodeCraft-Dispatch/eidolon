import type { Result } from "@/sys/result/core";
import type { BIT } from "./bit";
import { getBitAtNumber, isBitSetInNumberAt, setBitInNumberAt, setBitOffInNumberAt, setBitOnInNumberAt, toggleBitInNumberAt } from "./internal/bits";
import type { BitPosition, ComparisonResult, TypeConfig, UnsignedPrimitiveBase } from "./internal/primitives";
import { clampToType, compareType, getBitPositionRange, isUType, parseUType } from "./internal/primitives";
export { HEX_RADIX, OCTAL_RADIX, BINARY_RADIX, HEX_STRING_LENGTH, HEX_PATTERN, COMPARISON_LESS, COMPARISON_EQUAL, COMPARISON_GREATER } from "./internal/primitives";
export type { ComparisonResult, PrimitiveBase, TypeConfig, BitPosition } from "./internal/primitives";

// ============================================================================
// USHORT
// ============================================================================
declare const __ushortBrand: unique symbol;
export type USHORT = UnsignedPrimitiveBase<number> & { readonly [__ushortBrand]: true };
export type UShortBitPosition = BitPosition<15>;

const USHORT_CONFIG: TypeConfig<USHORT> = {
    MIN: 0 as USHORT,
    MAX: 65535 as USHORT,
    MASK: 0xFFFF as USHORT
};

const numberToUShort = (num: number): USHORT => (num & USHORT_MASK) as USHORT;

export const MIN_USHORT_VALUE: USHORT = USHORT_CONFIG.MIN;
export const MAX_USHORT_VALUE: USHORT = USHORT_CONFIG.MAX;
export const USHORT_MASK: USHORT = USHORT_CONFIG.MASK;
export const BITS_PER_USHORT = 16;
export const USHORT_BINARY_PATTERN = new RegExp(`^[01]{1,${BITS_PER_USHORT}}$`);

export const USHORT_BIT_POSITIONS = getBitPositionRange<15, UShortBitPosition>(15);

export const ushortToNumberValue = (ushort: USHORT): number => ushort as number;
export const unsafeUShort = (value: number): USHORT => numberToUShort(value);
export const isUShort = (value: number): value is USHORT => isUType(value, USHORT_CONFIG);
export const parseUShort = (value: number): Result<USHORT> => parseUType(value, USHORT_CONFIG);
export const clampToUShort = (value: number): USHORT => clampToType(value, USHORT_CONFIG);
export const compareUShorts = (a: USHORT, b: USHORT): ComparisonResult => compareType(a, b);

export const getBitFromUShortAt = (value: USHORT, position: UShortBitPosition): BIT =>
    getBitAtNumber<USHORT, 15, UShortBitPosition>(value, position);
export const setBitInUShortAt = (value: USHORT, position: UShortBitPosition, bit: BIT): USHORT =>
    setBitInNumberAt<USHORT, 15, UShortBitPosition>(value, position, bit);
export const setBitOnInUShortAt = (value: USHORT, position: UShortBitPosition): USHORT =>
    setBitOnInNumberAt<USHORT, 15, UShortBitPosition>(value, position);
export const setBitOffInUShortAt = (value: USHORT, position: UShortBitPosition): USHORT =>
    setBitOffInNumberAt<USHORT, 15, UShortBitPosition>(value, position);
export const toggleBitInUShortAt = (value: USHORT, position: UShortBitPosition): USHORT =>
    toggleBitInNumberAt<USHORT, 15, UShortBitPosition>(value, position);
export const isBitSetInUShortAt = (value: USHORT, position: UShortBitPosition): boolean =>
    isBitSetInNumberAt<USHORT, 15, UShortBitPosition>(value, position);