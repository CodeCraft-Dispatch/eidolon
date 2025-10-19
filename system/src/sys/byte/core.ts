import type {
    Result,
    ResultSuccess,
    ResultError,
} from '../result/core'


// Core BYTE type
declare const __byteBrand: unique symbol;
export type BYTE = number & { readonly [__byteBrand]: true };

export const BYTE_MASK = 0xFF;

/**
 * Internal utility function that performs unsafe conversion from number to BYTE type.
 * 
 * This function applies the BYTE_MASK to ensure the input number is constrained to 
 * the valid byte range (0-255) using bitwise AND operation, then casts the result 
 * to the branded BYTE type. No validation is performed - the caller is responsible 
 * for ensuring the input is appropriate.
 * 
 * @internal
 * @param {number} num - The number to convert (should be pre-validated)
 * @returns {BYTE} The masked number cast to BYTE type
 * 
 * @remarks
 * This is a performance-critical internal function used by other BYTE constructors.
 * It performs no validation and assumes the caller has already validated the input.
 * The bitwise AND with BYTE_MASK ensures only the lower 8 bits are preserved.
 * 
 * @example
 * ```typescript
 * // Internal usage only - not exposed to public API
 * const byte    = numberToByte(100); // Results in BYTE with value 100
 * const clamped = numberToByte(300); // Results in BYTE with value 44 (300 & 0xFF)
 * ```
 */
const numberToByte = (num: number): BYTE => (num & BYTE_MASK) as BYTE;

export const BYTE_MIN_VALUE = 0;
export const BYTE_MAX_VALUE = 255;
export const BITS_PER_BYTE = 8;

export const HEX_RADIX = 16;
export const BINARY_RADIX = 2;
export const SINGLE_BIT_MASK = 1;
export const HEX_STRING_LENGTH = 2;

export const COMPARISON_LESS = -1;
export const COMPARISON_EQUAL = 0;
export const COMPARISON_GREATER = 1;

export const BYTE_ZERO: BYTE = numberToByte(BYTE_MIN_VALUE);
export const BYTE_MAX: BYTE = numberToByte(BYTE_MAX_VALUE);

// Regex patterns for parsing
export const HEX_PATTERN = /^[0-9a-fA-F]{1,2}$/;
export const BINARY_PATTERN = new RegExp(`^[01]{1,${BITS_PER_BYTE}}$`);

// Helper to extract number value from BYTE
export const byteToNumberValue = (byte: BYTE): number => byte as number;

/**
 * Checks if a given number represents a valid byte value.
 * 
 * @param value - The number to validate as a byte
 * @returns True if the value is a valid byte, false otherwise
 * 
 * @remarks
 * A valid byte is in the range 0-255 (0x00-0xFF).
 * 
 * @example
 * ```typescript
 * isByte(255)    // true
 * isByte(0)      // true
 * isByte(256)    // false
 * isByte(1.5)    // false
 * isByte(-1)     // false
 * ```
 */
export const isByte = (value: number): value is BYTE => {
    const intValue = value | 0;
    // Validates integer conversion AND byte range
    return value === intValue && (intValue & ~BYTE_MASK) === 0;
};

/**
 * Parses a number value into a BYTE type with validation.
 * 
 * @param value - The numeric value to parse as a byte
 * @returns A Result object containing either the parsed BYTE value on success,
 *          or an error message on failure
 * 
 * @remarks
 * This function checks that the input value is a byte.
 * If it is not a byte, it will provide information regarding why.
 * 
 * @example
 * ```typescript
 * const result = parseByte(255);
 * if (result.success) {
 *   console.log(result.value); // Valid byte value
 * } else {
 *   console.error(result.error); // Error message
 * }
 * ```
 * 
 * @see {@link isByte}
 * @see {@link Result}
 */
export const parseByte = (value: number): Result<BYTE> => {
    // if valid, return immediately
    if (isByte(value)) {
        return <ResultSuccess<BYTE>>{ success: true, value: numberToByte(value) };
    }

    // or, determine specific failure reason
    return value !== (value | 0)
        ? <ResultError>{ success: false, error: `Value must be an integer, received: ${value}` }
        : value > BYTE_MAX_VALUE
            ? <ResultError>{ success: false, error: `Byte value must be <= ${BYTE_MAX_VALUE}, received: ${value}` }
            : <ResultError>{ success: false, error: `Byte value must be >= ${BYTE_MIN_VALUE}, received: ${value}` };
};

// Unsafe conversion for performance-critical scenarios
export const unsafeByte = (value: number): BYTE => numberToByte(value);

/**
 * Clamps a numeric value to the valid byte range (0-255).
 * 
 * This function efficiently converts any number to a valid byte value by:
 * - Converting the input to a signed integer
 * - Clamping negative values to 0
 * - Clamping values greater than 255 to 255
 * 
 * @param value - The numeric value to clamp to byte range
 * @returns A BYTE value guaranteed to be within the range [0, 255]
 * 
 * @example
 * ```typescript
 * clampToByte(-10);   // Returns 0
 * clampToByte(128);   // Returns 128
 * clampToByte(300);   // Returns 255
 * clampToByte(3.7);   // Returns 3
 * ```
 */
export const clampToByte = (value: number): BYTE => {
    // Ensure signed int
    const intValue = value | 0;

    // Negative values to 0 using sign extension
    const signBits = intValue >> 31;  // All 1s if negative, all 0s if positive
    const uintValue = intValue & ~signBits; // flip and keep original if 1, mask to 0 if all 0s

    // Values > 255 to 255
    const excess = uintValue - 256;
    const excessSignBits = excess >> 31;  // All 1s if <= 255, all 0s if > 255
    const clamped = (uintValue & excessSignBits) | (BYTE_MAX_VALUE & ~excessSignBits);

    return numberToByte(clamped);
};

/**
 * Compares two BYTE values and returns their relative ordering.
 * 
 * Determine the comparison result without branching.
 * The function converts each BYTE to its numeric representation and performs arithmetic
 * comparison using bit manipulation techniques.
 * 
 * @param a - The first BYTE value to compare
 * @param b - The second BYTE value to compare
 * @returns -1 if a < b, 0 if a === b, 1 if a > b
 * 
 * @example
 * ```typescript
 * const result1 = compareBytes(someByte1, someByte2); // Returns -1, 0, or 1
 * const result2 = compareBytes(equalByte, equalByte); // Returns 0
 * ```
 */
export const compareBytes = (a: BYTE, b: BYTE): -1 | 0 | 1 => {
    const aNum = byteToNumberValue(a);
    const bNum = byteToNumberValue(b);

    // negative: 1, position/zero: 0
    const lessMask = ((aNum - bNum) >> 31) & 1;
    const greaterMask = ((bNum - aNum) >> 31) & 1;

    return (greaterMask - lessMask) as -1 | 0 | 1;
};