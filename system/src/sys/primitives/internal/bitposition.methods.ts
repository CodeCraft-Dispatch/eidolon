import type { Result } from "@/sys/result/core";
import { success, failure } from "@/sys/result/core";
import type { BitPosition, UnsignedPrimitiveBase } from "./types";

/**
 * Determines if a given value is a valid bit position within the specified range.
 *
 * @template TMax - The maximum value for the bit position.
 * @param value - The value to check.
 * @param max - The maximum allowable bit position.
 * @returns `true` if the value is a valid bit position; otherwise, `false`.
 */
export const isBitPosition = <TMax extends UnsignedPrimitiveBase<number>>(
    value: number,
    max: TMax
): value is BitPosition<TMax> => {
    return value >= 0 && value <= max && (value | 0) === value;
};

/**
 * Retrieves a valid bit position if the value is within the specified range.
 *
 * @template TMax - The maximum value for the bit position.
 * @param value - The value to validate as a bit position.
 * @param max - The maximum allowable bit position.
 * @returns A `Result` containing the valid bit position or an error message.
 */
export const getBitPosition = <TMax extends UnsignedPrimitiveBase<number>>(
    value: number,
    max: TMax
): Result<BitPosition<TMax>> =>
    isBitPosition<TMax>(value, max)
        ? success(value)
        : failure(`Value ${value} is not a valid BitPosition in range [0, ${max}]`);

/**
 * Generates an array of all valid bit positions up to the specified maximum.
 *
 * @template TMax - The maximum value for the bit position.
 * @template TBitPosition - The type representing the bit position.
 * @param max - The maximum allowable bit position.
 * @returns An array of all valid bit positions.
 */
export const getBitPositionRange = <TMax extends UnsignedPrimitiveBase<number>, TBitPosition extends BitPosition<TMax>>(
    max: TBitPosition
): BitPosition<TMax>[] => {
    const positions = new Array<TBitPosition>(max + 1);

    for (let i = 0; i <= max; i++) {
        positions[i] = i as TBitPosition;
    }

    return positions;
};