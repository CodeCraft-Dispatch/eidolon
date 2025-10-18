import type { BIT } from '../bit/bit'
import type { BYTE } from './core'
import { byteToNumberValue, unsafeByte, BYTE_MASK } from './core'
import { byteToBitArray } from './representation'
import { createByteFromBits } from './construction'

// Internal helper for binary operations
const createBinaryByteOperation = (operation: (a: number, b: number) => number) =>
    (a: BYTE, b: BYTE): BYTE => {
        const aNum = byteToNumberValue(a);
        const bNum = byteToNumberValue(b);
        const result = operation(aNum, bNum) & BYTE_MASK;
        return unsafeByte(result);
    };

// Bitwise AND operation
export const andBytes = createBinaryByteOperation((a, b) => a & b);

// Bitwise OR operation  
export const orBytes = createBinaryByteOperation((a, b) => a | b);

// Bitwise XOR operation
export const xorBytes = createBinaryByteOperation((a, b) => a ^ b);

// Bitwise NOT operation
export const notByte = (byte: BYTE): BYTE => unsafeByte(~byteToNumberValue(byte) & BYTE_MASK);

// Multiple byte operations
export const andMultipleBytes = (bytes: readonly BYTE[]): BYTE =>
    bytes.reduce(andBytes);

export const orMultipleBytes = (bytes: readonly BYTE[]): BYTE =>
    bytes.reduce(orBytes);

export const xorMultipleBytes = (bytes: readonly BYTE[]): BYTE =>
    bytes.reduce(xorBytes);

// BIT-level operations - operate on bits and return BYTE
export const andBytesWithBits = (a: BYTE, b: BYTE): BYTE => {
    const aBits = byteToBitArray(a);
    const bBits = byteToBitArray(b);

    const result = aBits.map((bitA, index) => (bitA & bBits[index]) as BIT);
    return createByteFromBits(result);
};

export const orBytesWithBits = (a: BYTE, b: BYTE): BYTE => {
    const aBits = byteToBitArray(a);
    const bBits = byteToBitArray(b);

    const result = aBits.map((bitA, index) => (bitA | bBits[index]) as BIT);
    return createByteFromBits(result);
};

export const xorBytesWithBits = (a: BYTE, b: BYTE): BYTE => {
    const aBits = byteToBitArray(a);
    const bBits = byteToBitArray(b);

    const result = aBits.map((bitA, index) => (bitA ^ bBits[index]) as BIT);
    return createByteFromBits(result);
};

export const notByteWithBits = (byte: BYTE): BYTE => {
    const bits = byteToBitArray(byte);
    const result = bits.map(bit => (bit === 0 ? 1 : 0) as BIT);
    return createByteFromBits(result);
};