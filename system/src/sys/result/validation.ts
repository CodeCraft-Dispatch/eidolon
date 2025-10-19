import type { Result } from './core';
import { success, failure } from './core';

// ============================================================================
// VALIDATION OPERATIONS
// ============================================================================

/**
 * Validation rule interface for consistent validation logic.
 * Defines the contract for all validation rules used across the domain.
 */
export interface ValidationRule<TestValue> {
    readonly predicate: (value: TestValue) => boolean;
    readonly errorMessage: string;
}

/**
 * Validates a value against multiple rules, all of which must pass.
 * Collects all validation errors and combines them into a single error message.
 * This enables comprehensive validation feedback to users.
 * 
 * @param value - The value to validate against all rules
 * @param validations - Array of validation rules that must all pass
 * @returns Result containing the value if all validations pass, or combined error messages
 * 
 * @example
 * ```typescript
 * const passwordRules = [
 *     { predicate: (p: string) => p.length >= 8, errorMessage: "Must be at least 8 characters" },
 *     { predicate: (p: string) => /[A-Z]/.test(p), errorMessage: "Must contain uppercase letter" },
 *     { predicate: (p: string) => /[0-9]/.test(p), errorMessage: "Must contain number" }
 * ];
 * 
 * validateAll("SecurePass123", passwordRules) // success("SecurePass123")
 * validateAll("weak", passwordRules) // failure("Must be at least 8 characters; Must contain uppercase letter; Must contain number")
 * ```
 */
export const validateAll = <TestValue>(
    value: TestValue,
    validations: Array<ValidationRule<TestValue>>
): Result<TestValue> => {
    const errors = validations
        .filter(validation => !validation.predicate(value))
        .map(validation => validation.errorMessage);

    return errors.length === 0
        ? success(value)
        : failure(errors.join('; '));
};

/**
 * Validates a value against multiple rules, where at least one must pass.
 * Useful for alternative validation criteria or fallback validation logic.
 * 
 * @param value - The value to validate against rules
 * @param validations - Array of validation rules, at least one must pass
 * @returns Result containing the value if any validation passes, or combined error messages
 * 
 * @example
 * ```typescript
 * const identifierRules = [
 *     { predicate: (s: string) => /^\d+$/.test(s), errorMessage: "Not a valid ID number" },
 *     { predicate: (s: string) => /^[A-Z]{2}\d{6}$/.test(s), errorMessage: "Not a valid license format" }
 * ];
 * 
 * validateAny("123456", identifierRules) // success("123456") - passes ID rule
 * validateAny("AB123456", identifierRules) // success("AB123456") - passes license rule  
 * validateAny("invalid", identifierRules) // failure("Not a valid ID number; Not a valid license format")
 * ```
 */
export const validateAny = <TestValue>(
    value: TestValue,
    validations: Array<ValidationRule<TestValue>>
): Result<TestValue> => {
    const hasValidRule = validations.some(validation => validation.predicate(value));

    if (hasValidRule) {
        return success(value);
    }

    const errors = validations.map(validation => validation.errorMessage);
    return failure(errors.join('; '));
};

/**
 * Validates a value against rules in sequence, stopping at the first failure.
 * More efficient than validateAll when order matters and early termination is desired.
 * Useful for expensive validations where you want to fail fast.
 * 
 * @param value - The value to validate against rules
 * @param validations - Array of validation rules applied in sequence
 * @returns Result containing the value if all validations pass, or first error encountered
 * 
 * @example
 * ```typescript
 * const expensiveRules = [
 *     { predicate: (s: string) => s.length > 0, errorMessage: "Cannot be empty" },
 *     { predicate: (s: string) => expensiveValidation(s), errorMessage: "Expensive validation failed" },
 *     { predicate: (s: string) => veryExpensiveValidation(s), errorMessage: "Very expensive validation failed" }
 * ];
 * 
 * validateChain("", expensiveRules) // failure("Cannot be empty") - stops immediately
 * validateChain("valid", expensiveRules) // success("valid") or first failure
 * ```
 */
export const validateChain = <TestValue>(
    value: TestValue,
    validations: Array<ValidationRule<TestValue>>
): Result<TestValue> => {
    for (const validation of validations) {
        if (!validation.predicate(value)) {
            return failure(validation.errorMessage);
        }
    }
    return success(value);
};

/**
 * Creates a reusable validator function from an array of validation rules.
 * Enables creating domain-specific validators that can be reused across the application.
 * Uses validateAll strategy by default but can be configured.
 * 
 * @param validations - Array of validation rules to combine into a validator
 * @param strategy - Validation strategy: 'all' (default), 'any', or 'chain'
 * @returns A function that validates values against the combined rules
 * 
 * @example
 * ```typescript
 * const validateEmail = createValidator([
 *     { predicate: (e: string) => e.includes("@"), errorMessage: "Must contain @" },
 *     { predicate: (e: string) => e.includes("."), errorMessage: "Must contain domain" },
 *     { predicate: (e: string) => e.length >= 5, errorMessage: "Must be at least 5 characters" }
 * ]);
 * 
 * validateEmail("user@example.com") // success("user@example.com")
 * validateEmail("invalid") // failure("Must contain @; Must contain domain")
 * 
 * const validateIdAny = createValidator([
 *     { predicate: (s: string) => /^\d+$/.test(s), errorMessage: "Not numeric ID" },
 *     { predicate: (s: string) => /^[A-Z]\d+$/.test(s), errorMessage: "Not alpha-numeric ID" }
 * ], 'any');
 * ```
 */
export const createValidator = <TestValue>(
    validations: Array<ValidationRule<TestValue>>,
    strategy: 'all' | 'any' | 'chain' = 'all'
) => (value: TestValue): Result<TestValue> => {
    switch (strategy) {
        case 'all':
            return validateAll(value, validations);
        case 'any':
            return validateAny(value, validations);
        case 'chain':
            return validateChain(value, validations);
        default:
            return validateAll(value, validations);
    }
};

/**
 * Combines multiple validators into a single validator using the specified strategy.
 * Enables composition of domain-specific validators into comprehensive validation logic.
 * 
 * @param validators - Array of validator functions to combine
 * @param strategy - How to combine validators: 'all' (default) or 'chain'
 * @returns A combined validator function
 * 
 * @example
 * ```typescript
 * const basicEmailValidator = createValidator([
 *     { predicate: (e: string) => e.includes("@"), errorMessage: "Must contain @" }
 * ]);
 * 
 * const lengthValidator = createValidator([
 *     { predicate: (s: string) => s.length >= 5, errorMessage: "Too short" }
 * ]);
 * 
 * const combinedValidator = combineValidators([basicEmailValidator, lengthValidator]);
 * combinedValidator("a@b") // failure("Too short")
 * combinedValidator("user@example.com") // success("user@example.com")
 * ```
 */
export const combineValidators = <TestValue>(
    validators: Array<(value: TestValue) => Result<TestValue>>,
    strategy: 'all' | 'chain' = 'all'
) => (value: TestValue): Result<TestValue> => {
    if (strategy === 'chain') {
        for (const validator of validators) {
            const result = validator(value);
            if (!result.success) {
                return result;
            }
        }
        return success(value);
    } else {
        // 'all' strategy - collect all errors
        const errors: string[] = [];
        for (const validator of validators) {
            const result = validator(value);
            if (!result.success) {
                errors.push(result.error);
            }
        }
        return errors.length === 0 ? success(value) : failure(errors.join('; '));
    }
};