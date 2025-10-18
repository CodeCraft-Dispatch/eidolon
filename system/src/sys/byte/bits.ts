import type { BIT } from '../bit/bit'
import type { BitPosition } from '../bit/bit.position'
import type { BYTE } from './core'
import {
    byteToNumberValue,
    unsafeByte,
    SINGLE_BIT_MASK
} from './core'

// Get bit at specific position from BYTE (safe version with validation)
export const getBitFromByteAt = (byte: BYTE, position: BitPosition): BIT => {
    const byteNum = byteToNumberValue(byte);
    return ((byteNum >> position) & SINGLE_BIT_MASK) as BIT;
};

// Unsafe version for performance
export const getBitFromByte = (byte: BYTE, position: number): BIT => {
    const byteNum = byteToNumberValue(byte);
    return ((byteNum >> position) & SINGLE_BIT_MASK) as BIT;
};

// Set bit at specific position in BYTE (safe version)
export const setBitInByteAt = (byte: BYTE, position: BitPosition, bit: BIT): BYTE => {
    const byteNum = byteToNumberValue(byte);
    const mask = ~(SINGLE_BIT_MASK << position);
    const cleared = byteNum & mask;
    const withBit = cleared | (bit << position);
    return unsafeByte(withBit);
};

// Unsafe version for performance
export const setBitInByte = (byte: BYTE, position: number, bit: BIT): BYTE => {
    const byteNum = byteToNumberValue(byte);
    const mask = ~(SINGLE_BIT_MASK << position);
    const cleared = byteNum & mask;
    const withBit = cleared | (bit << position);
    return unsafeByte(withBit);
};

// Set bit to 1 at specific position
export const setBitOnInByteAt = (byte: BYTE, position: BitPosition): BYTE =>
    setBitInByteAt(byte, position, 1 as BIT);

export const setBitOnInByte = (byte: BYTE, position: number): BYTE =>
    setBitInByte(byte, position, 1 as BIT);

// Set bit to 0 at specific position  
export const setBitOffInByteAt = (byte: BYTE, position: BitPosition): BYTE =>
    setBitInByteAt(byte, position, 0 as BIT);

export const setBitOffInByte = (byte: BYTE, position: number): BYTE =>
    setBitInByte(byte, position, 0 as BIT);

// Toggle bit at specific position
export const toggleBitInByteAt = (byte: BYTE, position: BitPosition): BYTE => {
    const current = getBitFromByteAt(byte, position);
    const toggled = (current === 0 ? 1 : 0) as BIT;
    return setBitInByteAt(byte, position, toggled);
};

export const toggleBitInByte = (byte: BYTE, position: number): BYTE => {
    const current = getBitFromByte(byte, position);
    const toggled = (current === 0 ? 1 : 0) as BIT;
    return setBitInByte(byte, position, toggled);
};

// Check if bit is set (equals 1) at specific position
export const isBitSetInByteAt = (byte: BYTE, position: BitPosition): boolean =>
    getBitFromByteAt(byte, position) === 1;

export const isBitSetInByte = (byte: BYTE, position: number): boolean =>
    getBitFromByte(byte, position) === 1;