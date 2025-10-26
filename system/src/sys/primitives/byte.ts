import type { Result } from "@/sys/result/core";
import type { BIT } from "./bit";
import { getBitAtNumber, isBitSetInNumberAt, setBitInNumberAt, setBitOffInNumberAt, setBitOnInNumberAt, toggleBitInNumberAt } from "./internal/bits";
import type { BitPosition, ComparisonResult, TypeConfig, UnsignedPrimitiveBase } from "./internal/primitives";
import { clampToType, compareType, getBitPositionRange, isUType, parseUType } from "./internal/primitives";
export { HEX_RADIX, OCTAL_RADIX, BINARY_RADIX, HEX_STRING_LENGTH, HEX_PATTERN, COMPARISON_LESS, COMPARISON_EQUAL, COMPARISON_GREATER } from "./internal/primitives";
export type { ComparisonResult, PrimitiveBase, TypeConfig, BitPosition } from "./internal/primitives";

// ============================================================================
// BYTE
// ============================================================================
declare const __byteBrand: unique symbol;
export type BYTE = UnsignedPrimitiveBase<number> & { readonly [__byteBrand]: true };
export type ByteBitPosition = BitPosition<7>;

const BYTE_CONFIG: TypeConfig<BYTE> = {
    MIN: 0 as BYTE,
    MAX: 255 as BYTE,
    MASK: 0xFF as BYTE,
    BITS: 8 as BYTE
};

const numberToByte = (num: number): BYTE => (num & BYTE_MASK) as BYTE;

export const MIN_BYTE_VALUE: BYTE = BYTE_CONFIG.MIN;
export const MAX_BYTE_VALUE: BYTE = BYTE_CONFIG.MAX;
export const BYTE_MASK: BYTE = BYTE_CONFIG.MASK;
export const BITS_PER_BYTE = 8;
export const BYTE_BINARY_PATTERN = new RegExp(`^[01]{1,${BITS_PER_BYTE}}$`);

export const BYTE_BIT_POSITIONS = getBitPositionRange<7, ByteBitPosition>(7);

export const byteToNumberValue = (byte: BYTE): number => byte as number;
export const unsafeByte = (value: number): BYTE => numberToByte(value);
export const isByte = (value: number): value is BYTE => isUType(value, BYTE_CONFIG);
export const parseByte = (value: number): Result<BYTE> => parseUType(value, BYTE_CONFIG);
export const clampToByte = (value: number): BYTE => clampToType(value, BYTE_CONFIG);
export const compareBytes = (a: BYTE, b: BYTE): ComparisonResult => compareType(a, b);

export const getBitFromByteAt = (value: BYTE, position: ByteBitPosition): BIT =>
    getBitAtNumber<BYTE, 7, ByteBitPosition>(value, position);
export const setBitInByteAt = (value: BYTE, position: ByteBitPosition, bit: BIT): BYTE =>
    setBitInNumberAt<BYTE, 7, ByteBitPosition>(value, position, bit, BYTE_CONFIG);
export const setBitOnInByteAt = (value: BYTE, position: ByteBitPosition): BYTE =>
    setBitOnInNumberAt<BYTE, 7, ByteBitPosition>(value, position, BYTE_CONFIG);
export const setBitOffInByteAt = (value: BYTE, position: ByteBitPosition): BYTE =>
    setBitOffInNumberAt<BYTE, 7, ByteBitPosition>(value, position, BYTE_CONFIG);
export const toggleBitInByteAt = (value: BYTE, position: ByteBitPosition): BYTE =>
    toggleBitInNumberAt<BYTE, 7, ByteBitPosition>(value, position, BYTE_CONFIG);
export const isBitSetInByteAt = (value: BYTE, position: ByteBitPosition): boolean =>
    isBitSetInNumberAt<BYTE, 7, ByteBitPosition>(value, position);