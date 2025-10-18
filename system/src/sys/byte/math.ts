import type { Result, ResultSuccess, ResultError } from '../result'
import type { BYTE } from './core'
import { MAX_BIT_POSITION } from '../bit/bit.position'
import {
    byteToNumberValue,
    unsafeByte,
    BYTE_MASK,
    BYTE_MIN_VALUE
} from './core'

// Internal helper for shift operations validation
const isValidShiftPositions = (positions: number): boolean =>
    Number.isInteger(positions) && positions >= BYTE_MIN_VALUE && positions <= MAX_BIT_POSITION;

// Internal helper for shift operations
const createShiftOperation = (shiftOp: (value: number, positions: number) => number) =>
    (byte: BYTE, positions: number): Result<BYTE> => {
        if (!isValidShiftPositions(positions)) {
            return <ResultError>{ success: false, error: `Shift positions must be ${BYTE_MIN_VALUE}-${MAX_BIT_POSITION}, received: ${positions}` };
        }

        const byteNum = byteToNumberValue(byte);
        const result = shiftOp(byteNum, positions) & BYTE_MASK;
        return <ResultSuccess<BYTE>>{ success: true, value: unsafeByte(result) };
    };

// Arithmetic operations with overflow handling
export const addBytes = (a: BYTE, b: BYTE): BYTE => {
    const aNum = byteToNumberValue(a);
    const bNum = byteToNumberValue(b);
    const result = (aNum + bNum) & BYTE_MASK;
    return unsafeByte(result);
};

export const subtractBytes = (a: BYTE, b: BYTE): BYTE => {
    const aNum = byteToNumberValue(a);
    const bNum = byteToNumberValue(b);
    const result = (aNum - bNum) & BYTE_MASK;
    return unsafeByte(result);
};

export const multiplyBytes = (a: BYTE, b: BYTE): BYTE => {
    const aNum = byteToNumberValue(a);
    const bNum = byteToNumberValue(b);
    const result = (aNum * bNum) & BYTE_MASK;
    return unsafeByte(result);
};

// Shift operations
export const shiftLeftByte = createShiftOperation((value, positions) => value << positions);
export const shiftRightByte = createShiftOperation((value, positions) => value >> positions);

// Unsafe shift operations for performance
export const unsafeShiftLeftByte = (byte: BYTE, positions: number): BYTE =>
    unsafeByte((byteToNumberValue(byte) << positions) & BYTE_MASK);

export const unsafeShiftRightByte = (byte: BYTE, positions: number): BYTE =>
    unsafeByte((byteToNumberValue(byte) >> positions) & BYTE_MASK);

// Array operations
export const sumBytes = (bytes: readonly BYTE[]): BYTE => {
    const sum = bytes.reduce((acc, byte) => acc + byteToNumberValue(byte), BYTE_MIN_VALUE) & BYTE_MASK;
    return unsafeByte(sum);
};

export const averageBytes = (bytes: readonly BYTE[]): BYTE => {
    if (bytes.length === 0) return unsafeByte(BYTE_MIN_VALUE);

    const sum = bytes.reduce((acc, byte) => acc + byteToNumberValue(byte), BYTE_MIN_VALUE);
    const average = Math.round(sum / bytes.length) & BYTE_MASK;
    return unsafeByte(average);
};

// Increment and decrement with wraparound
export const incrementByte = (byte: BYTE): BYTE => addBytes(byte, unsafeByte(1));
export const decrementByte = (byte: BYTE): BYTE => subtractBytes(byte, unsafeByte(1));