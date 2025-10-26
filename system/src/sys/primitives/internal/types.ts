/**
 * Represents the base type for primitives, which can be either a number or a bigint.
 */
export type PrimitiveBase = number | bigint;

/**
 * Represents an unsigned primitive base type.
 * Ensures that the type does not include negative values.
 *
 * @template N - The primitive base type to constrain.
 */
export type UnsignedPrimitiveBase<N extends PrimitiveBase> = PrimitiveBase & (`${N}` extends `-${string}` ? never : N);

export type BuildIntegerRange<Min extends number, Max extends number, Acc extends number[] = []> =
    Acc['length'] extends Max
    ? [...Acc, Acc['length']][number]
    : BuildIntegerRange<Min, Max, [...Acc, Acc['length']]>;

/**
 * Represents a position within a range of bits.
 *
 * @template TMax - The maximum value for the bit position. Defaults to `number`.
 */
export type BitPosition<TMax extends UnsignedPrimitiveBase<number> = number> = BuildIntegerRange<0, TMax>;

/**
 * Configuration for a primitive type, defining its minimum, maximum, and mask values.
 *
 * @template T - The primitive base type.
 */
export interface TypeConfig<T extends PrimitiveBase, TIncludeSignMask extends boolean = false> {
    /**
     * The minimum value for the type.
     */
    readonly MIN: T;

    /**
     * The maximum value for the type.
     */
    readonly MAX: T;

    /**
     * The mask value for the type.
     */
    readonly MASK: T;

    /**
     * The number of bits used to represent the type.
     */
    readonly BITS: T;

    /**
     * The sign mask value - only present when TIncludeSignMask is true.
     */
    readonly SIGNMASK?: TIncludeSignMask extends true ? T : never;

    /**
     * Additional properties can be added as needed. 
     */
    [key: string]: unknown;
}