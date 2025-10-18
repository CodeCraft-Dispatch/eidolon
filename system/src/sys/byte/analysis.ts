import type { BYTE } from './core'
import { byteToNumberValue, compareBytes, BITS_PER_BYTE, BYTE_MIN_VALUE, BYTE_MAX_VALUE } from './core'
import { getBitFromByte } from './bits'

// Count number of set bits (1s) in a BYTE
export const countSetBits = (byte: BYTE): number => {
    let count = 0;
    let num = byteToNumberValue(byte);

    while (num) {
        count += num & 1;
        num >>= 1;
    }

    return count;
};

// Count number of clear bits (0s) in a BYTE
export const countClearBits = (byte: BYTE): number => BITS_PER_BYTE - countSetBits(byte);

// Find position of first set bit (rightmost 1), returns -1 if none
export const findFirstSetBit = (byte: BYTE): number => {
    const num = byteToNumberValue(byte);
    if (num === 0) return -1;

    for (let i = 0; i < BITS_PER_BYTE; i++) {
        if ((num >> i) & 1) return i;
    }

    return -1;
};

// Find position of last set bit (leftmost 1), returns -1 if none
export const findLastSetBit = (byte: BYTE): number => {
    const num = byteToNumberValue(byte);
    if (num === 0) return -1;

    for (let i = BITS_PER_BYTE - 1; i >= 0; i--) {
        if ((num >> i) & 1) return i;
    }

    return -1;
};

// Find all positions where bits are set (1)
export const findAllSetBits = (byte: BYTE): number[] => {
    const positions: number[] = [];

    for (let i = 0; i < BITS_PER_BYTE; i++) {
        if (getBitFromByte(byte, i) === 1) {
            positions.push(i);
        }
    }

    return positions;
};

// Find all positions where bits are clear (0)
export const findAllClearBits = (byte: BYTE): number[] => {
    const positions: number[] = [];

    for (let i = 0; i < BITS_PER_BYTE; i++) {
        if (getBitFromByte(byte, i) === 0) {
            positions.push(i);
        }
    }

    return positions;
};

// Check if byte is within a range (inclusive)
export const isInRange = (byte: BYTE, min: BYTE, max: BYTE): boolean => {
    return compareBytes(byte, min) >= 0 && compareBytes(byte, max) <= 0;
};

// Check if all bits are set (byte equals 255)
export const areAllBitsSet = (byte: BYTE): boolean =>
    byteToNumberValue(byte) === BYTE_MAX_VALUE;

// Check if all bits are clear (byte equals 0)
export const areAllBitsClear = (byte: BYTE): boolean =>
    byteToNumberValue(byte) === BYTE_MIN_VALUE;

// Check if byte is a power of 2
export const isPowerOfTwo = (byte: BYTE): boolean => {
    const num = byteToNumberValue(byte);
    return num > 0 && (num & (num - 1)) === 0;
};

// Get hamming weight (number of set bits) - alias for countSetBits
export const hammingWeight = countSetBits;

// Calculate hamming distance between two bytes
export const hammingDistance = (a: BYTE, b: BYTE): number => {
    const aNum = byteToNumberValue(a);
    const bNum = byteToNumberValue(b);
    const xor = aNum ^ bNum;

    let count = 0;
    let result = xor;
    while (result) {
        count += result & 1;
        result >>= 1;
    }

    return count;
};