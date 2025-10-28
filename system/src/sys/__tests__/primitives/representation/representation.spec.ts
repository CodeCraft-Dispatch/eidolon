import { describe, it, expect } from 'vitest';
import { toDecimal, toHex, toBinary, toOctal, toBitArray, toStrictBitArray } from '@/sys/primitives/representation';

// Import MAX, MIN, and MASK from each primitive module
// BYTE, SBYTE, SHORT, USHORT, INT, UINT
import type { BYTE } from '@/sys/primitives/byte';
import { MAX_BYTE_VALUE, MIN_BYTE_VALUE, BYTE_MASK } from '@/sys/primitives/byte';
import type { SBYTE } from '@/sys/primitives/sbyte';
import { MAX_SBYTE_VALUE, MIN_SBYTE_VALUE, SBYTE_MASK } from '@/sys/primitives/sbyte';
import type { SHORT } from '@/sys/primitives/short';
import { MAX_SHORT_VALUE, MIN_SHORT_VALUE, SHORT_MASK } from '@/sys/primitives/short';
import type { USHORT } from '@/sys/primitives/ushort';
import { MAX_USHORT_VALUE, MIN_USHORT_VALUE, USHORT_MASK } from '@/sys/primitives/ushort';
import type { INT } from '@/sys/primitives/int';
import { MAX_INT_VALUE, MIN_INT_VALUE, INT_MASK } from '@/sys/primitives/int';
import type { UINT } from '@/sys/primitives/uint';
import { MAX_UINT_VALUE, MIN_UINT_VALUE, UINT_MASK } from '@/sys/primitives/uint';

type TestPrimitiveMap = {
    BYTE: BYTE;
    SBYTE: SBYTE;
    SHORT: SHORT;
    USHORT: USHORT;
    INT: INT;
    UINT: UINT;
};

type TestPrimitive<T extends keyof TestPrimitiveMap> = TestPrimitiveMap[T];

// Define the array of type, max, min, mask objects
const primitiveConfigs = [
    { type: 'BYTE' as keyof TestPrimitiveMap, _max: MAX_BYTE_VALUE, _min: MIN_BYTE_VALUE, _mask: BYTE_MASK },
    { type: 'SBYTE' as keyof TestPrimitiveMap, _max: MAX_SBYTE_VALUE, _min: MIN_SBYTE_VALUE, _mask: SBYTE_MASK },
    { type: 'SHORT' as keyof TestPrimitiveMap, _max: MAX_SHORT_VALUE, _min: MIN_SHORT_VALUE, _mask: SHORT_MASK },
    { type: 'USHORT' as keyof TestPrimitiveMap, _max: MAX_USHORT_VALUE, _min: MIN_USHORT_VALUE, _mask: USHORT_MASK },
    { type: 'INT' as keyof TestPrimitiveMap, _max: MAX_INT_VALUE, _min: MIN_INT_VALUE, _mask: INT_MASK },
    { type: 'UINT' as keyof TestPrimitiveMap, _max: MAX_UINT_VALUE, _min: MIN_UINT_VALUE, _mask: UINT_MASK }
];

describe.each(primitiveConfigs)('$type Representation Utilities', ({ type, _max, _min, _mask }) => {
    const max = _max as number;
    const min = _min as number;
    const mask = _mask as number;

    describe('toDecimal', () => {
        it('should convert a number to its decimal string representation', () => {
            expect(toDecimal(max)).toBe(max.toString());
            expect(toDecimal(min)).toBe(min.toString());
        });
    });

    describe('toHex', () => {
        it('should convert a number to its hexadecimal string representation', () => {
            const hexMax = max.toString(16).padStart(mask.toString(16).length, '0').toUpperCase();
            const hexMin = min.toString(16).padStart(mask.toString(16).length, '0').toUpperCase();
            expect(toHex(max, mask)).toBe(`0x${hexMax}`);
            expect(toHex(min, mask)).toBe(`0x${hexMin}`);
        });

        it('should pad the hexadecimal string to the correct length', () => {
            const paddedHex = (15 & mask).toString(16).padStart(mask.toString(16).length, '0').toUpperCase();
            expect(toHex(15 as TestPrimitive<typeof type>, mask)).toBe(`0x${paddedHex}`);
        });
    });

    describe('toBinary', () => {
        it('should convert a number to its binary string representation', () => {
            const binaryMax = max.toString(2).padStart(mask.toString(2).length, '0').split('-').join('');
            const binaryMin = min.toString(2).padStart(mask.toString(2).length, '0').split('-').join('');
            expect(toBinary(max, mask)).toBe(binaryMax);
            expect(toBinary(min, mask)).toBe(binaryMin);
        });
    });

    describe('toOctal', () => {
        it('should convert a number to its octal string representation', () => {
            const octalMax = max.toString(8);
            const octalMin = min.toString(8);
            expect(toOctal(max)).toBe(octalMax);
            expect(toOctal(min)).toBe(octalMin);
        });
    });

    describe('toBitArray', () => {
        it('should convert a number to an array of bits', () => {
            const maxBits = max.toString(2).padStart(mask.toString(2).length, '0').split('')
                .reverse().map(x => !isNaN(Number(x)) ? Number(x) : '')
                .filter(x => x !== '');
            const minBits = min.toString(2).padStart(mask.toString(2).length, '0').split('')
                .reverse().map(x => !isNaN(Number(x)) ? Number(x) : '')
                .filter(x => x !== '');

            expect(toBitArray(max, mask)).toEqual(maxBits);
            expect(toBitArray(min, mask)).toEqual(minBits);
        });
    });

    describe('toStrictBitArray', () => {
        it('should convert a number to a readonly array of bits', () => {
            const bits = toStrictBitArray(max, mask);
            expect(bits).toEqual(toBitArray(max, mask));
        });
    });
});