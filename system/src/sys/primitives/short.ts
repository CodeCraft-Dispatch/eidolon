import type { Result } from "@/sys/result/core";
import type { BIT } from "./bit";
import { getBitAtNumber, isBitSetInNumberAt, setBitInNumberAt, setBitOffInNumberAt, setBitOnInNumberAt, toggleBitInNumberAt } from "./internal/bits";
import type { BitPosition, ComparisonResult, TypeConfig } from "./internal/primitives";
import { clampToType, compareType, getBitPositionRange, isSType, parseSType } from "./internal/primitives";
export { HEX_RADIX, OCTAL_RADIX, BINARY_RADIX, HEX_STRING_LENGTH, HEX_PATTERN, COMPARISON_LESS, COMPARISON_EQUAL, COMPARISON_GREATER } from "./internal/primitives";
export type { ComparisonResult, PrimitiveBase, TypeConfig, BitPosition } from "./internal/primitives";

// ============================================================================
// SHORT
// ============================================================================
declare const __shortBrand: unique symbol;
export type SHORT = number & { readonly [__shortBrand]: true };
export type ShortBitPosition = BitPosition<15>;

const SHORT_CONFIG: TypeConfig<SHORT, true> = {
    MIN: -32768 as SHORT,
    MAX: 32767 as SHORT,
    MASK: 0xFFFF as SHORT,
    BITS: 16 as SHORT,
    SIGNMASK: 0x8000 as SHORT
};

const numberToShort = (num: number): SHORT => (num & SHORT_MASK) as SHORT;

export const MIN_SHORT_VALUE: SHORT = SHORT_CONFIG.MIN;
export const MAX_SHORT_VALUE: SHORT = SHORT_CONFIG.MAX;
export const SHORT_MASK: SHORT = SHORT_CONFIG.MASK;
export const BITS_PER_SHORT = 16;
export const SHORT_BINARY_PATTERN = new RegExp(`^[01]{1,${BITS_PER_SHORT}}$`);

export const SHORT_BIT_POSITIONS = getBitPositionRange<15, ShortBitPosition>(15);

export const shortToNumberValue = (short: SHORT): number => short as number;
export const unsafeShort = (value: number): SHORT => numberToShort(value);
export const isShort = (value: number): value is SHORT => isSType(value, SHORT_CONFIG);
export const parseShort = (value: number): Result<SHORT> => parseSType(value, SHORT_CONFIG);
export const clampToShort = (value: number): SHORT => clampToType(value, SHORT_CONFIG);
export const compareShorts = (a: SHORT, b: SHORT): ComparisonResult => compareType(a, b);

export const getBitFromShortAt = (value: SHORT, position: ShortBitPosition): BIT =>
    getBitAtNumber<SHORT, 15, ShortBitPosition>(value, position);
export const setBitInShortAt = (value: SHORT, position: ShortBitPosition, bit: BIT): SHORT =>
    setBitInNumberAt<SHORT, 15, ShortBitPosition, true>(value, position, bit, SHORT_CONFIG);
export const setBitOnInShortAt = (value: SHORT, position: ShortBitPosition): SHORT =>
    setBitOnInNumberAt<SHORT, 15, ShortBitPosition, true>(value, position, SHORT_CONFIG);
export const setBitOffInShortAt = (value: SHORT, position: ShortBitPosition): SHORT =>
    setBitOffInNumberAt<SHORT, 15, ShortBitPosition, true>(value, position, SHORT_CONFIG);
export const toggleBitInShortAt = (value: SHORT, position: ShortBitPosition): SHORT =>
    toggleBitInNumberAt<SHORT, 15, ShortBitPosition, true>(value, position, SHORT_CONFIG);
export const isBitSetInShortAt = (value: SHORT, position: ShortBitPosition): boolean =>
    isBitSetInNumberAt<SHORT, 15, ShortBitPosition>(value, position);