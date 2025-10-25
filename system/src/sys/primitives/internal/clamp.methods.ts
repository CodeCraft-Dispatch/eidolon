export const clampValue = <T extends number | bigint>(value: T, min: T, max: T): T => {
    if (value < min) {
        return min;
    }
    if (value > max) {
        return max;
    }
    return value;
};