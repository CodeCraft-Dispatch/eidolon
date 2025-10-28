import type { BIT } from "./bit";
import { OFF, ON } from "./bit";
import { BINARY_RADIX, HEX_RADIX, OCTAL_RADIX } from "./internal/primitives";
import type { PrimitiveBase } from "./internal/primitives";

export const toDecimal = <T extends PrimitiveBase>(value: T): string => value.toString();

export const toHex = <T extends PrimitiveBase>(value: T, mask: T): string => {
    const hex = value.toString(HEX_RADIX).padStart(mask.toString(HEX_RADIX).length, '0').toUpperCase();
    return `0x${hex}`;
};

export const toBinary = <T extends PrimitiveBase>(value: T, mask: T): string => {
    const binary = value.toString(BINARY_RADIX).padStart(mask.toString(BINARY_RADIX).length, '0');
    return binary.split('-').join('');
};

export const toOctal = <T extends PrimitiveBase>(value: T): string => {
    return value.toString(OCTAL_RADIX);
};

export const toBitArray = <T extends PrimitiveBase>(value: T, mask: T): BIT[] => {
    const binaryString = toBinary(value, mask);
    const bitLength = binaryString.length;

    const bits: BIT[] = [];
    for (let i = 0; i < bitLength; i++) {
        const bitChar = binaryString[bitLength - 1 - i]; // Reverse order
        const bitValue = bitChar === '1' ? ON : OFF; // Explicitly handle binary digits
        bits.push(bitValue as BIT);
    }
    return bits;
};

export const toStrictBitArray = <T extends PrimitiveBase>(
    value: T,
    mask: T
): readonly BIT[] => {
    const bits = toBitArray(value, mask);
    return bits as readonly BIT[];
};