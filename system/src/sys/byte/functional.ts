import type { BIT } from '../bit/bit'
import type { BYTE } from './core'
import { BITS_PER_BYTE } from './core'
import { getBitFromByte, setBitInByte } from './bits'
import { byteToBitArray } from './representation'
import { createByteFromBits } from './construction'

// Core iteration abstraction
const iterateBitsInByte = (
    byte: BYTE,
    callback: (bit: BIT, position: number) => void | boolean,
    reverse: boolean = false
): boolean => {
    const start = reverse ? BITS_PER_BYTE - 1 : 0;
    const end = reverse ? -1 : BITS_PER_BYTE;
    const step = reverse ? -1 : 1;

    for (let i = start; i !== end; i += step) {
        const bit = getBitFromByte(byte, i);
        const result = callback(bit, i);
        if (typeof result === 'boolean' && !result) {
            return false;
        }
    }
    return true;
};

// Array conversion helper
const withBitArray = <T>(byte: BYTE, operation: (bits: BIT[]) => T): T => {
    return operation(byteToBitArray(byte));
};

// Map function over each bit in a BYTE
export const mapBitsInByte = (byte: BYTE, mapper: (bit: BIT, position: number) => BIT): BYTE => {
    return withBitArray(byte, bits => createByteFromBits(bits.map(mapper)));
};

// Reduce function over bits in a BYTE
export const reduceBitsInByte = <T>(
    byte: BYTE,
    reducer: (accumulator: T, bit: BIT, position: number) => T,
    initialValue: T
): T => {
    return withBitArray(byte, bits => bits.reduce(reducer, initialValue));
};

// Filter bits in a BYTE based on predicate, returns array of positions
export const filterBitsInByte = (byte: BYTE, predicate: (bit: BIT, position: number) => boolean): number[] => {
    const positions: number[] = [];
    iterateBitsInByte(byte, (bit, position) => {
        if (predicate(bit, position)) {
            positions.push(position);
        }
    });
    return positions;
};

// Check if every bit satisfies a condition
export const everyBitInByte = (byte: BYTE, predicate: (bit: BIT, position: number) => boolean): boolean => {
    return iterateBitsInByte(byte, predicate);
};

// Check if some bits satisfy a condition
export const someBitInByte = (byte: BYTE, predicate: (bit: BIT, position: number) => boolean): boolean => {
    let found = false;
    iterateBitsInByte(byte, (bit, pos) => {
        if (predicate(bit, pos)) {
            found = true;
            return false; // Stop iteration
        }
        return true;
    });
    return found;
};

// Fold operation over bits with both left and right variants
const internalFolder = <T>(
    byte: BYTE,
    folder: (accumulator: T, bit: BIT, position: number) => T,
    initialValue: T,
    reverse: boolean
): T => {
    let result = initialValue;
    iterateBitsInByte(byte, (bit, pos) => {
        result = folder(result, bit, pos);
    }, reverse);
    return result;
};

export const foldLeftByte = <T>(
    byte: BYTE,
    folder: (accumulator: T, bit: BIT, position: number) => T,
    initialValue: T
): T => internalFolder<T>(byte, folder, initialValue, false);

export const foldRightByte = <T>(
    byte: BYTE,
    folder: (bit: BIT, accumulator: T, position: number) => T,
    initialValue: T
): T => internalFolder<T>(byte, (accumulator: T, bit: BIT, position: number) => folder(bit, accumulator, position), initialValue, true);

// General fold alias (defaults to left fold)
export const foldByte = foldLeftByte;

// Iterate over bits with side effects (for debugging/logging)
export const forEachBitInByte = (byte: BYTE, callback: (bit: BIT, position: number) => void): void => {
    iterateBitsInByte(byte, callback);
};

// Iterate over bits in reverse order
export const forEachBitInByteReverse = (byte: BYTE, callback: (bit: BIT, position: number) => void): void => {
    iterateBitsInByte(byte, callback, true);
};

// Apply a function to each bit position and return new BYTE
export const transformByte = (byte: BYTE, transformer: (bit: BIT, position: number) => BIT): BYTE => {
    let result = byte;
    iterateBitsInByte(byte, (bit, pos) => {
        const newBit = transformer(bit, pos);
        result = setBitInByte(result, pos, newBit);
    });
    return result;
};

// Zip two bytes together with a combiner function
export const zipBytes = (a: BYTE, b: BYTE, combiner: (bitA: BIT, bitB: BIT, position: number) => BIT): BYTE => {
    const bitsB = byteToBitArray(b);
    return withBitArray(a, bitsA => createByteFromBits(
        bitsA.map((bitA, index) => combiner(bitA, bitsB[index], index))
    ));
};