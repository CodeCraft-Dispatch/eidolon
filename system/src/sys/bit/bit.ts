import {
    type Result,
    type ResultError,
    type ResultSuccess
} from '../result/core'

// Internal Values
const ON = 1;
const OFF = 0;

// Types
declare const __bitOnBrand: unique symbol;
export type BIT_ON = 1 & { readonly [__bitOnBrand]: true };
declare const __bitOffBrand: unique symbol;
export type BIT_OFF = 0 & { readonly [__bitOffBrand]: true };
declare const __bitBrand: unique symbol;
export type BIT = (BIT_ON | BIT_OFF) & { readonly [__bitBrand]: true };

// Validations
export const isBitOn = (value: unknown): value is BIT_ON => value === ON;
export const isBitOff = (value: unknown): value is BIT_OFF => value === OFF;
export const isBit = (value: unknown): value is BIT => value === OFF || value === ON;

// Parsing
export const parseBitOn = (value: unknown): Result<BIT_ON> =>
    isBitOn(value)
        ? <ResultSuccess<BIT_ON>>{ success: true, value }
        : <ResultError>{ success: false, error: `Expected 1, received: ${value}` };

export const parseBitOff = (value: unknown): Result<BIT_OFF> =>
    isBitOff(value)
        ? <ResultSuccess<BIT_OFF>>{ success: true, value }
        : <ResultError>{ success: false, error: `Expected 0, received: ${value}` };

export const parseBit = (value: unknown): Result<BIT> =>
    isBit(value)
        ? <ResultSuccess<BIT>>{ success: true, value }
        : <ResultError>{ success: false, error: `Expected 0 or 1, received: ${value}` };

// Functional composition helpers
export const foldBit = <T, R>(
    result: Result<T>,
    onSuccess: (value: T) => R,
    onError: (error: string) => R
): R => result.success ? onSuccess(result.value) : onError(result.error);

export const createBit = (value: unknown): Result<BIT> =>
    foldBit(
        parseBit(value),
        (bit) => (<Result<BIT>>{ success: true, value: bit as BIT }),
        (error) => (<ResultError>{ success: false, error })
    );

// Utility functions for common operations
export const bitToBoolean = (bit: BIT): boolean => !!(bit & 1);
export const booleanToBit = (bool: boolean): BIT => (bool ? 1 : 0) as BIT;
export const toggleBit = (bit: BIT): BIT => (bit ^ 1) as BIT;
export const setBitOn = (): BIT => 1 as BIT;
export const setBitOff = (): BIT => 0 as BIT;
export const andBits = (bit1: BIT, bit2: BIT): BIT => (bit1 & bit2) as BIT;
export const orBits = (bit1: BIT, bit2: BIT): BIT => (bit1 | bit2) as BIT;
export const xorBits = (bit1: BIT, bit2: BIT): BIT => (bit1 ^ bit2) as BIT;
export const notBit = (bit: BIT): BIT => (~bit & 1) as BIT; // Alternative to toggleBit
