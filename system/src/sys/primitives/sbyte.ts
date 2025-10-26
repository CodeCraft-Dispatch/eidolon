import type { Result } from "@/sys/result/core";
import type { BIT } from "./bit";
import { getBitAtNumber, isBitSetInNumberAt, setBitInNumberAt, setBitOffInNumberAt, setBitOnInNumberAt, toggleBitInNumberAt } from "./internal/bits";
import type { BitPosition, ComparisonResult, TypeConfig } from "./internal/primitives";
import { clampToType, compareType, getBitPositionRange, isSType, parseSType } from "./internal/primitives";
export { HEX_RADIX, OCTAL_RADIX, BINARY_RADIX, HEX_STRING_LENGTH, HEX_PATTERN, COMPARISON_LESS, COMPARISON_EQUAL, COMPARISON_GREATER } from "./internal/primitives";
export type { ComparisonResult, PrimitiveBase, TypeConfig, BitPosition } from "./internal/primitives";

// ============================================================================
// SBYTE
// ============================================================================
declare const __sbyteBrand: unique symbol;
export type SBYTE = number & { readonly [__sbyteBrand]: true };
export type SByteBitPosition = BitPosition<7>;

const SBYTE_CONFIG: TypeConfig<SBYTE, true> = {
    MIN: -128 as SBYTE,
    MAX: 127 as SBYTE,
    MASK: 0xFF as SBYTE,
    BITS: 8 as SBYTE,
    SIGNMASK: 0x80 as SBYTE
};

const numberToSByte = (num: number): SBYTE => {
    const masked = num & SBYTE_MASK;
    return (masked > 127 ? masked - 256 : masked) as SBYTE;
};

export const MIN_SBYTE_VALUE: SBYTE = SBYTE_CONFIG.MIN;
export const MAX_SBYTE_VALUE: SBYTE = SBYTE_CONFIG.MAX;
export const SBYTE_MASK: SBYTE = SBYTE_CONFIG.MASK;
export const BITS_PER_SBYTE = 8;
export const SBYTE_BINARY_PATTERN = new RegExp(`^[01]{1,${BITS_PER_SBYTE}}$`);

export const SBYTE_BIT_POSITIONS = getBitPositionRange<7, SByteBitPosition>(7);

export const sbyteToNumberValue = (sbyte: SBYTE): number => sbyte as number;
export const unsafeSByte = (value: number): SBYTE => numberToSByte(value);
export const isSByte = (value: number): value is SBYTE => isSType(value, SBYTE_CONFIG);
export const parseSByte = (value: number): Result<SBYTE> => parseSType(value, SBYTE_CONFIG);
export const clampToSByte = (value: number): SBYTE => clampToType(value, SBYTE_CONFIG);
export const compareSBytes = (a: SBYTE, b: SBYTE): ComparisonResult => compareType(a, b);

export const getBitFromSByteAt = (value: SBYTE, position: SByteBitPosition): BIT =>
    getBitAtNumber<SBYTE, 7, SByteBitPosition>(value, position);
export const setBitInSByteAt = (value: SBYTE, position: SByteBitPosition, bit: BIT): SBYTE =>
    setBitInNumberAt<SBYTE, 7, SByteBitPosition, true>(value, position, bit, SBYTE_CONFIG);
export const setBitOnInSByteAt = (value: SBYTE, position: SByteBitPosition): SBYTE =>
    setBitOnInNumberAt<SBYTE, 7, SByteBitPosition, true>(value, position, SBYTE_CONFIG);
export const setBitOffInSByteAt = (value: SBYTE, position: SByteBitPosition): SBYTE =>
    setBitOffInNumberAt<SBYTE, 7, SByteBitPosition, true>(value, position, SBYTE_CONFIG);
export const toggleBitInSByteAt = (value: SBYTE, position: SByteBitPosition): SBYTE =>
    toggleBitInNumberAt<SBYTE, 7, SByteBitPosition, true>(value, position, SBYTE_CONFIG);
export const isBitSetInSByteAt = (value: SBYTE, position: SByteBitPosition): boolean =>
    isBitSetInNumberAt<SBYTE, 7, SByteBitPosition>(value, position);