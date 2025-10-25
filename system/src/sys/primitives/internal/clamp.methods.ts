export const clampBigValue = (value: bigint, min: bigint, max: bigint): bigint => {
    const belowMin = (value - min) >> BigInt(63); // -1 if value < min, 0 otherwise
    const aboveMax = (max - value) >> BigInt(63); // -1 if value > max, 0 otherwise
    return (value & ~belowMin & ~aboveMax) | (min & belowMin) | (max & aboveMax);
};
export const clampValue = (value: number, min: number, max: number): number => {
    if (value < min) {
        return min;
    }
    if (value > max) {
        return max;
    }
    return value;
};