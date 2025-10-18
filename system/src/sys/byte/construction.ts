import type { Result, ResultSuccess, ResultError } from '../result'
import type { BIT } from '../bit/bit'
import type { BYTE } from './core'
import {
    parseByte,
    BYTE_MIN_VALUE,
    BITS_PER_BYTE,
    HEX_RADIX,
    BINARY_RADIX,
    HEX_PATTERN,
    BINARY_PATTERN,
    unsafeByte,
} from './core'

// Helper to create BYTE from bits array (converts to 8-bit storage)
const bitsArrayToByte = (bits: readonly BIT[]): BYTE =>
    unsafeByte(bits.reduce((num, bit, index) => num | (bit << index), BYTE_MIN_VALUE));

// Parse interface for string-based parsing
interface ParseConfig {
    prefix: string;
    regex: RegExp;
    radix: number;
    formatName: string;
}

// Generic string parsing helper
const parseByteFromString = (input: string, config: ParseConfig): Result<BYTE> => {
    const trimmed = input.trim();
    if (!trimmed.startsWith(config.prefix)) {
        return <ResultError>{ success: false, error: `${config.formatName} string must start with '${config.prefix}', received: ${input}` };
    }

    const withoutPrefix = trimmed.slice(config.prefix.length);
    if (!config.regex.test(withoutPrefix)) {
        return <ResultError>{ success: false, error: `Invalid ${config.formatName} format, received: ${input}` };
    }

    const parsed = parseInt(withoutPrefix, config.radix);
    return parseByte(parsed);
};

// Parse BYTE from hexadecimal string (e.g., "0xFF", "0x42")
export const parseByteFromHex = (hex: string): Result<BYTE> =>
    parseByteFromString(hex, { prefix: '0x', regex: HEX_PATTERN, radix: HEX_RADIX, formatName: 'hex' });

// Parse BYTE from binary string (e.g., "0b11111111", "0b01000010")
export const parseByteFromBinary = (binary: string): Result<BYTE> =>
    parseByteFromString(binary, { prefix: '0b', regex: BINARY_PATTERN, radix: BINARY_RADIX, formatName: 'binary' });

// Parse BYTE from bits array - validates exactly 8 bits
export const parseByteFromBits = (bits: readonly BIT[]): Result<BYTE> => {
    if (bits.length !== BITS_PER_BYTE) {
        return <ResultError>{ success: false, error: `Expected ${BITS_PER_BYTE} bits, received: ${bits.length}` };
    }

    return <ResultSuccess<BYTE>>{ success: true, value: bitsArrayToByte(bits) };
};

// Create BYTE from bits array - unsafe version for performance
export const createByteFromBits = (bits: readonly BIT[]): BYTE => bitsArrayToByte(bits);

// Parse array of bytes from array of numbers
export const parseByteArray = (values: readonly number[]): Result<BYTE[]> => {
    const results: BYTE[] = [];

    for (let i = 0; i < values.length; i++) {
        const result = parseByte(values[i]);
        if (!result.success) {
            return <ResultError>{ success: false, error: `Invalid byte at index ${i}: ${(result as ResultError).error}` };
        }
        results.push(result.value);
    }

    return <ResultSuccess<BYTE[]>>{ success: true, value: results };
};

// Unsafe construction functions for performance-critical scenarios
export const unsafeByteFromHex = (hex: string): BYTE => unsafeByte(parseInt(hex.replace(/^0x/i, ''), HEX_RADIX));
export const unsafeByteFromBinary = (binary: string): BYTE => unsafeByte(parseInt(binary.replace(/^0b/i, ''), BINARY_RADIX));