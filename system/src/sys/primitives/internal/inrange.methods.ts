export const isInBigRange = (value: bigint, min: bigint, max: bigint): boolean => {
    const belowMin = value < min ? BigInt(-1) : BigInt(0); // -1 if value < min, 0 otherwise
    const aboveMax = value > max ? BigInt(-1) : BigInt(0); // -1 if value > max, 0 otherwise
    return (belowMin | aboveMax) === BigInt(0); // True if within range
}
export const isInURange = (value: number, min: number, max: number): boolean => {
    const uintValue = value >>> 0; // Ensure the value is treated as unsigned
    return uintValue === value && uintValue >= min && uintValue <= max;
};
export const isInSRange = (value: number, min: number, max: number): boolean => {
    const intValue = value | 0; // Ensure the value is treated as signed 32-bit integer
    return intValue === value && intValue >= min && intValue <= max;
}