import { describe, it, expect } from 'vitest';
import { toDecimal, toHex, toBinary, toOctal, toBitArray, toStrictBitArray } from '@/sys/primitives/representation';

// Import MAX, MIN, and MASK from each primitive module
// LONG, ULONG
import type { LONG } from '@/sys/primitives/long';
import { MAX_LONG_VALUE, MIN_LONG_VALUE, LONG_MASK } from '@/sys/primitives/long';
import type { ULONG } from '@/sys/primitives/ulong';
import { MAX_ULONG_VALUE, MIN_ULONG_VALUE, ULONG_MASK } from '@/sys/primitives/ulong';

type TestPrimitiveMap = {
    LONG: LONG;
    ULONG: ULONG;
};

type TestPrimitive<T extends keyof TestPrimitiveMap> = TestPrimitiveMap[T];

// Define the array of type, max, min, mask objects
const primitiveConfigs = [
    { type: 'LONG' as keyof TestPrimitiveMap, _max: MAX_LONG_VALUE, _min: MIN_LONG_VALUE, _mask: LONG_MASK },
    { type: 'ULONG' as keyof TestPrimitiveMap, _max: MAX_ULONG_VALUE, _min: MIN_ULONG_VALUE, _mask: ULONG_MASK }
];

describe.each(primitiveConfigs)('$type Representation Utilities', ({ type, _max, _min, _mask }) => {
    const max = _max as bigint;
    const min = _min as bigint;
    const mask = _mask as bigint;

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
            const lval = 15n as bigint;
            const mval = mask as unknown as bigint;
            const val = lval & mval;
            const paddedHex = val.toString(16).padStart(mask.toString(16).length, '0').toUpperCase();
            expect(toHex(15 as unknown as TestPrimitive<typeof type>, mask)).toBe(`0x${paddedHex}`);
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