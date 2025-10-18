import {
    type Result,
    type ResultError,
    type ResultSuccess
} from '@/sys/result'

// Branded type for compile-time safety
declare const __bitPositionBrand: unique symbol;
export type BitPosition = (0 | 1 | 2 | 3 | 4 | 5 | 6 | 7) & { readonly [__bitPositionBrand]: true };

// Constants for bit positions
export const BIT_POSITION_0 = 0 as BitPosition;
export const BIT_POSITION_1 = 1 as BitPosition;
export const BIT_POSITION_2 = 2 as BitPosition;
export const BIT_POSITION_3 = 3 as BitPosition;
export const BIT_POSITION_4 = 4 as BitPosition;
export const BIT_POSITION_5 = 5 as BitPosition;
export const BIT_POSITION_6 = 6 as BitPosition;
export const BIT_POSITION_7 = 7 as BitPosition;

export const MIN_BIT_POSITION = BIT_POSITION_0;
export const MAX_BIT_POSITION = BIT_POSITION_7;

// Type predicates
export const isBitPosition = (value: unknown): value is BitPosition =>
    typeof value === 'number' &&
    Number.isInteger(value) &&
    value >= MIN_BIT_POSITION &&
    value <= MAX_BIT_POSITION;

export const isValidBitPosition = (value: number): boolean =>
    Number.isInteger(value) && value >= MIN_BIT_POSITION && value <= MAX_BIT_POSITION;

// BitPosition parser following Parse, Don't Validate principle
export const parseBitPosition = (value: unknown): Result<BitPosition> =>
    typeof value !== 'number'
        ? <ResultError>{ success: false, error: `Expected number, received: ${typeof value}` }
        : !Number.isInteger(value)
            ? <ResultError>{ success: false, error: `Expected integer, received: ${value}` }
            : value < MIN_BIT_POSITION
                ? <ResultError>{ success: false, error: `Bit position must be >= ${MIN_BIT_POSITION}, received: ${value}` }
                : value > MAX_BIT_POSITION
                    ? <ResultError>{ success: false, error: `Bit position must be <= ${MAX_BIT_POSITION}, received: ${value}` }
                    : <ResultSuccess<BitPosition>>{ success: true, value: value as BitPosition };

// BitPosition array parser
export const parseBitPositionArray = (values: unknown[]): Result<BitPosition[]> => {
    if (!Array.isArray(values)) {
        return <ResultError>{ success: false, error: `Expected array, received: ${typeof values}` };
    }

    const positions: BitPosition[] = [];

    for (let i = 0; i < values.length; i++) {
        const result = parseBitPosition(values[i]);
        if (!result.success) {
            return <ResultError>{ success: false, error: `Invalid bit position at index ${i}: ${result.error}` };
        }
        positions.push(result.value);
    }

    return <ResultSuccess<BitPosition[]>>{ success: true, value: positions };
};

// Safe constructor
export const createBitPosition = (value: unknown): Result<BitPosition> => parseBitPosition(value);

// BitPosition-specific fold helper
export const foldBitPosition = <R>(
    result: Result<BitPosition>,
    onSuccess: (position: BitPosition) => R,
    onError: (error: string) => R
): R => result.success ? onSuccess(result.value) : onError(result.error);

// BitPosition utility functions
export const createBitMask = (position: BitPosition): number => 1 << position;

export const getAllBitPositions = (): BitPosition[] => [
    BIT_POSITION_0,
    BIT_POSITION_1,
    BIT_POSITION_2,
    BIT_POSITION_3,
    BIT_POSITION_4,
    BIT_POSITION_5,
    BIT_POSITION_6,
    BIT_POSITION_7
];

export const getAllBitPositionsReversed = (): BitPosition[] => [
    BIT_POSITION_7,
    BIT_POSITION_6,
    BIT_POSITION_5,
    BIT_POSITION_4,
    BIT_POSITION_3,
    BIT_POSITION_2,
    BIT_POSITION_1,
    BIT_POSITION_0
];

export const isValidBitPositionRange = (start: BitPosition, end: BitPosition): boolean =>
    start >= MIN_BIT_POSITION && end <= MAX_BIT_POSITION && start <= end;

export const getBitPositionsInRange = (start: BitPosition, end: BitPosition): Result<BitPosition[]> => {
    if (!isValidBitPositionRange(start, end)) {
        return <ResultError>{ success: false, error: `Invalid bit position range: ${start}-${end}` };
    }

    const positions: BitPosition[] = [];
    for (let i = start; i <= end; i++) {
        positions.push(i as BitPosition);
    }

    return <ResultSuccess<BitPosition[]>>{ success: true, value: positions };
};

export const nextBitPosition = (position: BitPosition): Result<BitPosition> =>
    position >= MAX_BIT_POSITION
        ? <ResultError>{ success: false, error: `No next position after ${position}` }
        : <ResultSuccess<BitPosition>>{ success: true, value: (position + 1) as BitPosition };

export const previousBitPosition = (position: BitPosition): Result<BitPosition> =>
    position <= MIN_BIT_POSITION
        ? <ResultError>{ success: false, error: `No previous position before ${position}` }
        : <ResultSuccess<BitPosition>>{ success: true, value: (position - 1) as BitPosition };

export const compareBitPositions = (a: BitPosition, b: BitPosition): -1 | 0 | 1 =>
    a < b ? -1 : a > b ? 1 : 0;

// BitPosition validation and helper functions
export const isLeastSignificantBit = (position: BitPosition): boolean =>
    position === BIT_POSITION_0;

export const isMostSignificantBit = (position: BitPosition): boolean =>
    position === BIT_POSITION_7;

export const getBitPositionWeight = (position: BitPosition): number => Math.pow(2, position);

export const getBitPositionsFromMask = (mask: number): BitPosition[] => {
    const positions: BitPosition[] = [];
    for (let i = MIN_BIT_POSITION; i <= MAX_BIT_POSITION; i++) {
        const position = i as BitPosition;
        if ((mask & (1 << position)) !== 0) {
            positions.push(position);
        }
    }
    return positions;
};

// Unsafe constructor for performance-critical scenarios
export const unsafeBitPosition = (value: number): BitPosition => value as BitPosition;