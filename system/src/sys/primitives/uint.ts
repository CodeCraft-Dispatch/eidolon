import type { Result } from "@/sys/result/core";
import type { BIT } from "./bit";
import { getBitAtNumber, isBitSetInNumberAt, setBitInNumberAt, setBitOffInNumberAt, setBitOnInNumberAt, toggleBitInNumberAt } from "./internal/bits";
import type { BitPosition, ComparisonResult, TypeConfig, UnsignedPrimitiveBase } from "./internal/primitives";
import { clampToType, compareType, getBitPositionRange, isUType, parseUType } from "./internal/primitives";
export { HEX_RADIX, OCTAL_RADIX, BINARY_RADIX, HEX_STRING_LENGTH, HEX_PATTERN, COMPARISON_LESS, COMPARISON_EQUAL, COMPARISON_GREATER } from "./internal/primitives";
export type { ComparisonResult, PrimitiveBase, TypeConfig, BitPosition } from "./internal/primitives";

// ============================================================================
// UINT
// ============================================================================
declare const __uintBrand: unique symbol;
export type UINT = UnsignedPrimitiveBase<number> & { readonly [__uintBrand]: true };
export type UIntBitPosition = BitPosition<31>;

const UINT_CONFIG: TypeConfig<UINT> = {
    MIN: 0 as UINT,
    MAX: 4294967295 as UINT,
    MASK: 0xFFFFFFFF as UINT,
    BITS: 32 as UINT
};

const numberToUInt = (num: number): UINT => (num >>> 0) as UINT;

export const MIN_UINT_VALUE: UINT = UINT_CONFIG.MIN;
export const MAX_UINT_VALUE: UINT = UINT_CONFIG.MAX;
export const UINT_MASK: UINT = UINT_CONFIG.MASK;
export const BITS_PER_UINT = 32;
export const UINT_BINARY_PATTERN = new RegExp(`^[01]{1,${BITS_PER_UINT}}$`);

export const UINT_BIT_POSITIONS = getBitPositionRange<31, UIntBitPosition>(31);

export const uintToNumberValue = (uint: UINT): number => uint as number;
export const unsafeUInt = (value: number): UINT => numberToUInt(value);
export const isUInt = (value: number): value is UINT => isUType(value, UINT_CONFIG);
export const parseUInt = (value: number): Result<UINT> => parseUType(value, UINT_CONFIG);
export const clampToUInt = (value: number): UINT => clampToType(value, UINT_CONFIG);
export const compareUInts = (a: UINT, b: UINT): ComparisonResult => compareType(a, b);

export const getBitFromUIntAt = (value: UINT, position: UIntBitPosition): BIT =>
    getBitAtNumber<UINT, 31, UIntBitPosition>(value, position);
export const setBitInUIntAt = (value: UINT, position: UIntBitPosition, bit: BIT): UINT =>
    setBitInNumberAt<UINT, 31, UIntBitPosition>(value, position, bit, UINT_CONFIG);
export const setBitOnInUIntAt = (value: UINT, position: UIntBitPosition): UINT =>
    setBitOnInNumberAt<UINT, 31, UIntBitPosition>(value, position, UINT_CONFIG);
export const setBitOffInUIntAt = (value: UINT, position: UIntBitPosition): UINT =>
    setBitOffInNumberAt<UINT, 31, UIntBitPosition>(value, position, UINT_CONFIG);
export const toggleBitInUIntAt = (value: UINT, position: UIntBitPosition): UINT =>
    toggleBitInNumberAt<UINT, 31, UIntBitPosition>(value, position, UINT_CONFIG);
export const isBitSetInUIntAt = (value: UINT, position: UIntBitPosition): boolean =>
    isBitSetInNumberAt<UINT, 31, UIntBitPosition>(value, position);