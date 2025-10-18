import type { BIT } from '../bit/bit'
import type { BYTE } from './core'
import {
    byteToNumberValue,
    HEX_RADIX,
    BINARY_RADIX,
    HEX_STRING_LENGTH,
    BITS_PER_BYTE,
} from './core'

// Convert BYTE to hexadecimal string representation
export const byteToHex = (byte: BYTE): string => {
    const num = byteToNumberValue(byte);
    const hex = num.toString(HEX_RADIX).padStart(HEX_STRING_LENGTH, '0').toUpperCase();
    return `0x${hex}`;
};

// Convert BYTE to binary string representation  
export const byteToBinary = (byte: BYTE): string => {
    const num = byteToNumberValue(byte);
    const binary = num.toString(BINARY_RADIX).padStart(BITS_PER_BYTE, '0');
    return `${binary}`;
};

// Convert BYTE to number (alias for clarity)
export const byteToNumber = (byte: BYTE): number => byteToNumberValue(byte);

// Convert BYTE to array of BITs (LSB at index 0)
export const byteToBitArray = (byte: BYTE): BIT[] => {
    const num = byteToNumberValue(byte);
    const bits: BIT[] = [];

    for (let i = 0; i < BITS_PER_BYTE; i++) {
        bits.push(((num >> i) & 1) as BIT);
    }

    return bits;
};

// Convert BYTE to array of exactly 8 BITs with type guarantee
export const byteToStrictBitArray = (byte: BYTE): readonly [BIT, BIT, BIT, BIT, BIT, BIT, BIT, BIT] => {
    const bits = byteToBitArray(byte);
    return bits as [BIT, BIT, BIT, BIT, BIT, BIT, BIT, BIT];
};

// Convert BYTE to decimal string
export const byteToDecimal = (byte: BYTE): string => byteToNumberValue(byte).toString();

// Convert BYTE to octal string representation
export const byteToOctal = (byte: BYTE): string => {
    const num = byteToNumberValue(byte);
    return `${num.toString(8)}`;
};