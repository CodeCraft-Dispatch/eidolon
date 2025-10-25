import type { BIT } from '@/sys/primitives/bit'
import type { BitPosition, UnsignedPrimitiveBase } from './primitives'

export const getBitAtNumber = <
    T extends number,
    TMax extends UnsignedPrimitiveBase<number>,
    TBitPosition extends BitPosition<TMax>
>(
    value: T,
    position: TBitPosition
): BIT => {
    const maskedValue = value & 0xFFFFFFFF;
    return ((maskedValue >>> position) & 1) as BIT;
};

export const getBitAtBigInt = <
    T extends bigint,
    TMax extends UnsignedPrimitiveBase<number>,
    TBitPosition extends BitPosition<TMax>
>(
    value: T,
    position: TBitPosition
): BIT => {
    return Number((value >> BigInt(position)) & BigInt(1)) as BIT;
};

export const setBitInNumberAt = <
    T extends number,
    TMax extends UnsignedPrimitiveBase<number>,
    TBitPosition extends BitPosition<TMax>
>(
    value: T,
    position: TBitPosition,
    bit: BIT
): T => {
    const maskedValue = value & 0xFFFFFFFF; // Ensure value is treated as unsigned
    const mask = ~(1 << position);
    return ((maskedValue & mask) | (bit << position)) >>> 0 as T; // Force unsigned interpretation
};

export const setBitInBigIntAt = <
    T extends bigint,
    TMax extends UnsignedPrimitiveBase<number>,
    TBitPosition extends BitPosition<TMax>
>(
    value: T,
    position: TBitPosition,
    bit: BIT
): T => {
    const mask = BigInt(1) << BigInt(position);
    const result = bit === 1 ? (value | mask) : (value & ~mask);
    return (result & BigInt("0xFFFFFFFFFFFFFFFF")) as T;
};

export const setBitOnInNumberAt = <
    T extends number,
    TMax extends UnsignedPrimitiveBase<number>,
    TBitPosition extends BitPosition<TMax>
>(
    value: T,
    position: TBitPosition
): T => setBitInNumberAt<T, TMax, TBitPosition>(value, position, 1 as BIT);

export const setBitOnInBigIntAt = <
    T extends bigint,
    TMax extends UnsignedPrimitiveBase<number>,
    TBitPosition extends BitPosition<TMax>
>(
    value: T,
    position: TBitPosition
): T => setBitInBigIntAt<T, TMax, TBitPosition>(value, position, 1 as BIT);

export const setBitOffInNumberAt = <
    T extends number,
    TMax extends UnsignedPrimitiveBase<number>,
    TBitPosition extends BitPosition<TMax>
>(
    value: T,
    position: TBitPosition
): T => setBitInNumberAt<T, TMax, TBitPosition>(value, position, 0 as BIT);

export const setBitOffInBigIntAt = <
    T extends bigint,
    TMax extends UnsignedPrimitiveBase<number>,
    TBitPosition extends BitPosition<TMax>
>(
    value: T,
    position: TBitPosition
): T => setBitInBigIntAt<T, TMax, TBitPosition>(value, position, 0 as BIT);


export const toggleBitInNumberAt = <
    T extends number,
    TMax extends UnsignedPrimitiveBase<number>,
    TBitPosition extends BitPosition<TMax>
>(
    value: T,
    position: TBitPosition
): T => {
    const current = getBitAtNumber<T, TMax, TBitPosition>(value, position);
    const toggled = (current === 0 ? 1 : 0) as BIT;
    return setBitInNumberAt<T, TMax, TBitPosition>(value, position, toggled);
};

export const toggleBitInBigIntAt = <
    T extends bigint,
    TMax extends UnsignedPrimitiveBase<number>,
    TBitPosition extends BitPosition<TMax>
>(
    value: T,
    position: TBitPosition
): T => {
    const current = getBitAtBigInt<T, TMax, TBitPosition>(value, position);
    const toggled = (current === 0 ? 1 : 0) as BIT;
    return setBitInBigIntAt<T, TMax, TBitPosition>(value, position, toggled);
};

export const isBitSetInNumberAt = <
    T extends number,
    TMax extends UnsignedPrimitiveBase<number>,
    TBitPosition extends BitPosition<TMax>
>(
    value: T,
    position: TBitPosition
): boolean => getBitAtNumber<T, TMax, TBitPosition>(value, position) === 1;

export const isBitSetInBigIntAt = <
    T extends bigint,
    TMax extends UnsignedPrimitiveBase<number>,
    TBitPosition extends BitPosition<TMax>
>(
    value: T,
    position: TBitPosition
): boolean => getBitAtBigInt<T, TMax, TBitPosition>(value, position) === 1;
