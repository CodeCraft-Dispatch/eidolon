declare const __resultBrand: unique symbol;
export type ResultBase = {} & { readonly [__resultBrand]: true };
export type ResultSuccess<T> = { readonly success: true; readonly value: T } & ResultBase;
export type ResultError = { readonly success: false; readonly error: string } & ResultBase;
export type Result<T> = ResultSuccess<T> | ResultError;