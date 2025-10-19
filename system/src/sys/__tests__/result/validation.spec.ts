import { describe, expect, it } from 'vitest';
import type { Result } from '../../result/core';
import { success, failure } from '../../result/core';
import {
    validateAll,
    validateAny,
    validateChain,
    createValidator,
    combineValidators,
    type ValidationRule
} from '../../result/validation';

describe('Validation Domain', () => {
    describe('validateAll', () => {
        it('should pass when all validations succeed', () => {
            const rules: ValidationRule<number>[] = [
                { predicate: (n) => n > 0, errorMessage: "Must be positive" },
                { predicate: (n) => n < 100, errorMessage: "Must be less than 100" },
                { predicate: (n) => n % 2 === 0, errorMessage: "Must be even" }
            ];

            const result = validateAll(42, rules);
            expect(result).toEqual(success(42));
        });

        it('should fail when any validation fails', () => {
            const rules: ValidationRule<number>[] = [
                { predicate: (n) => n > 0, errorMessage: "Must be positive" },
                { predicate: (n) => n < 10, errorMessage: "Must be less than 10" }
            ];

            const result = validateAll(15, rules);
            expect(result).toEqual(failure("Must be less than 10"));
        });

        it('should combine multiple error messages', () => {
            const rules: ValidationRule<string>[] = [
                { predicate: (s) => s.length >= 8, errorMessage: "Must be at least 8 characters" },
                { predicate: (s) => /[A-Z]/.test(s), errorMessage: "Must contain uppercase letter" },
                { predicate: (s) => /[0-9]/.test(s), errorMessage: "Must contain number" }
            ];

            const result = validateAll("weak", rules);
            expect(result).toEqual(failure("Must be at least 8 characters; Must contain uppercase letter; Must contain number"));
        });

        it('should handle empty validation rules', () => {
            const result = validateAll("any value", []);
            expect(result).toEqual(success("any value"));
        });

        it('should preserve type information', () => {
            interface User {
                name: string;
                age: number;
            }

            const rules: ValidationRule<User>[] = [
                { predicate: (u) => u.name.length > 0, errorMessage: "Name required" },
                { predicate: (u) => u.age >= 18, errorMessage: "Must be adult" }
            ];

            const user: User = { name: "Alice", age: 25 };
            const result = validateAll(user, rules);

            if (result.success) {
                const _: User = result.value;
            }

            expect(result).toEqual(success(user));
        });

        it('should work with complex validation logic', () => {
            const passwordRules: ValidationRule<string>[] = [
                { predicate: (p) => p.length >= 12, errorMessage: "Must be at least 12 characters" },
                { predicate: (p) => /[a-z]/.test(p), errorMessage: "Must contain lowercase letter" },
                { predicate: (p) => /[A-Z]/.test(p), errorMessage: "Must contain uppercase letter" },
                { predicate: (p) => /[0-9]/.test(p), errorMessage: "Must contain number" },
                { predicate: (p) => /[!@#$%^&*]/.test(p), errorMessage: "Must contain special character" }
            ];

            expect(validateAll("SecurePassword123!", passwordRules)).toEqual(success("SecurePassword123!"));
            expect(validateAll("weak", passwordRules).success).toBe(false);
        });
    });

    describe('validateAny', () => {
        it('should pass when at least one validation succeeds', () => {
            const rules: ValidationRule<string>[] = [
                { predicate: (s) => /^\d+$/.test(s), errorMessage: "Not a valid ID number" },
                { predicate: (s) => /^[A-Z]{2}\d{6}$/.test(s), errorMessage: "Not a valid license format" }
            ];

            expect(validateAny("123456", rules)).toEqual(success("123456"));
            expect(validateAny("AB123456", rules)).toEqual(success("AB123456"));
        });

        it('should fail when no validations succeed', () => {
            const rules: ValidationRule<string>[] = [
                { predicate: (s) => /^\d+$/.test(s), errorMessage: "Not a valid ID number" },
                { predicate: (s) => /^[A-Z]{2}\d{6}$/.test(s), errorMessage: "Not a valid license format" }
            ];

            const result = validateAny("invalid", rules);
            expect(result).toEqual(failure("Not a valid ID number; Not a valid license format"));
        });

        it('should handle empty validation rules', () => {
            const result = validateAny("any value", []);
            expect(result.success).toBe(false);
        });

        it('should pass with first matching rule', () => {
            const rules: ValidationRule<number>[] = [
                { predicate: (n) => n > 10, errorMessage: "Must be greater than 10" },
                { predicate: (n) => n < 5, errorMessage: "Must be less than 5" },
                { predicate: (n) => n % 2 === 0, errorMessage: "Must be even" }
            ];

            expect(validateAny(15, rules)).toEqual(success(15)); // Passes first rule
            expect(validateAny(3, rules)).toEqual(success(3));   // Passes second rule
            expect(validateAny(8, rules)).toEqual(success(8));   // Passes third rule
        });

        it('should work with complex alternative validations', () => {
            interface Contact {
                email?: string;
                phone?: string;
            }

            const contactRules: ValidationRule<Contact>[] = [
                { predicate: (c) => !!c.email && c.email.includes("@"), errorMessage: "Invalid email" },
                { predicate: (c) => !!c.phone && c.phone.length >= 10, errorMessage: "Invalid phone" }
            ];

            expect(validateAny({ email: "user@example.com" }, contactRules)).toEqual(success({ email: "user@example.com" }));
            expect(validateAny({ phone: "1234567890" }, contactRules)).toEqual(success({ phone: "1234567890" }));
            expect(validateAny({}, contactRules).success).toBe(false);
        });
    });

    describe('validateChain', () => {
        it('should pass when all validations succeed in sequence', () => {
            const rules: ValidationRule<string>[] = [
                { predicate: (s) => s.length > 0, errorMessage: "Cannot be empty" },
                { predicate: (s) => s.length <= 50, errorMessage: "Too long" },
                { predicate: (s) => /^[a-zA-Z\s]+$/.test(s), errorMessage: "Only letters and spaces allowed" }
            ];

            const result = validateChain("Valid Name", rules);
            expect(result).toEqual(success("Valid Name"));
        });

        it('should fail fast on first validation failure', () => {
            const rules: ValidationRule<string>[] = [
                { predicate: (s) => s.length > 0, errorMessage: "Cannot be empty" },
                { predicate: (s) => s.length <= 50, errorMessage: "Too long" },
                { predicate: (s) => /^[a-zA-Z\s]+$/.test(s), errorMessage: "Only letters allowed" }
            ];

            const result = validateChain("", rules);
            expect(result).toEqual(failure("Cannot be empty"));
        });

        it('should stop at first failure without checking remaining rules', () => {
            let expensiveCheckCalled = false;
            const rules: ValidationRule<string>[] = [
                { predicate: (s) => s.length > 0, errorMessage: "Cannot be empty" },
                {
                    predicate: (s) => {
                        expensiveCheckCalled = true;
                        return s.length <= 50;
                    },
                    errorMessage: "Too long"
                }
            ];

            validateChain("", rules);
            expect(expensiveCheckCalled).toBe(false);
        });

        it('should handle empty validation rules', () => {
            const result = validateChain("any value", []);
            expect(result).toEqual(success("any value"));
        });

        it('should work with ordered priority validations', () => {
            const rules: ValidationRule<number>[] = [
                { predicate: (n) => !isNaN(n), errorMessage: "Must be a number" },
                { predicate: (n) => isFinite(n), errorMessage: "Must be finite" },
                { predicate: (n) => n >= 0, errorMessage: "Must be non-negative" },
                { predicate: (n) => n <= 1000, errorMessage: "Must be <= 1000" }
            ];

            expect(validateChain(500, rules)).toEqual(success(500));
            expect(validateChain(-5, rules)).toEqual(failure("Must be non-negative"));
            expect(validateChain(Infinity, rules)).toEqual(failure("Must be finite"));
        });
    });

    describe('createValidator', () => {
        it('should create reusable validator with default "all" strategy', () => {
            const validateEmail = createValidator([
                { predicate: (e: string) => e.includes("@"), errorMessage: "Must contain @" },
                { predicate: (e: string) => e.includes("."), errorMessage: "Must contain domain" }
            ]);

            expect(validateEmail("user@example.com")).toEqual(success("user@example.com"));
            expect(validateEmail("invalid")).toEqual(failure("Must contain @; Must contain domain"));
        });

        it('should create validator with "any" strategy', () => {
            const validateId = createValidator([
                { predicate: (s: string) => /^\d+$/.test(s), errorMessage: "Not numeric ID" },
                { predicate: (s: string) => /^[A-Z]\d+$/.test(s), errorMessage: "Not alpha-numeric ID" }
            ], 'any');

            expect(validateId("12345")).toEqual(success("12345"));
            expect(validateId("A123")).toEqual(success("A123"));
            expect(validateId("invalid")).toEqual(failure("Not numeric ID; Not alpha-numeric ID"));
        });

        it('should create validator with "chain" strategy', () => {
            const validatePassword = createValidator([
                { predicate: (p: string) => p.length >= 8, errorMessage: "Too short" },
                { predicate: (p: string) => /[A-Z]/.test(p), errorMessage: "No uppercase" },
                { predicate: (p: string) => /[0-9]/.test(p), errorMessage: "No number" }
            ], 'chain');

            expect(validatePassword("ValidPass123")).toEqual(success("ValidPass123"));
            expect(validatePassword("short")).toEqual(failure("Too short"));
        });

        it('should enable validator reuse across contexts', () => {
            const validateUsername = createValidator([
                { predicate: (u: string) => u.length >= 3, errorMessage: "Too short" },
                { predicate: (u: string) => u.length <= 20, errorMessage: "Too long" },
                { predicate: (u: string) => /^[a-zA-Z0-9_]+$/.test(u), errorMessage: "Invalid characters" }
            ]);

            const usernames = ["alice", "bob123", "user_name", "ab", "invalid-name"];
            const results = usernames.map(validateUsername);

            expect(results[0]).toEqual(success("alice"));
            expect(results[1]).toEqual(success("bob123"));
            expect(results[2]).toEqual(success("user_name"));
            expect(results[3]).toEqual(failure("Too short"));
            expect(results[4]).toEqual(failure("Invalid characters"));
        });

        it('should handle complex domain-specific validations', () => {
            interface Product {
                name: string;
                price: number;
                category: string;
            }

            const validateProduct = createValidator<Product>([
                { predicate: (p) => p.name.length > 0, errorMessage: "Name required" },
                { predicate: (p) => p.price >= 0, errorMessage: "Price must be non-negative" },
                { predicate: (p) => ["electronics", "books", "clothing"].includes(p.category), errorMessage: "Invalid category" }
            ]);

            const validProduct = { name: "Laptop", price: 999.99, category: "electronics" };
            const invalidProduct = { name: "", price: -10, category: "invalid" };

            expect(validateProduct(validProduct)).toEqual(success(validProduct));
            expect(validateProduct(invalidProduct).success).toBe(false);
        });
    });

    describe('combineValidators', () => {
        it('should combine validators with "all" strategy', () => {
            const lengthValidator = createValidator([
                { predicate: (s: string) => s.length >= 5, errorMessage: "Too short" }
            ]);

            const formatValidator = createValidator([
                { predicate: (s: string) => /^[a-zA-Z]+$/.test(s), errorMessage: "Only letters allowed" }
            ]);

            const combinedValidator = combineValidators([lengthValidator, formatValidator]);

            expect(combinedValidator("hello")).toEqual(success("hello"));
            expect(combinedValidator("hi")).toEqual(failure("Too short"));
            expect(combinedValidator("hello123")).toEqual(failure("Only letters allowed"));
            expect(combinedValidator("hi!")).toEqual(failure("Too short; Only letters allowed"));
        });

        it('should combine validators with "chain" strategy', () => {
            const lengthValidator = createValidator([
                { predicate: (s: string) => s.length >= 5, errorMessage: "Too short" }
            ]);

            const formatValidator = createValidator([
                { predicate: (s: string) => /^[a-zA-Z]+$/.test(s), errorMessage: "Only letters allowed" }
            ]);

            const chainedValidator = combineValidators([lengthValidator, formatValidator], 'chain');

            expect(chainedValidator("hello")).toEqual(success("hello"));
            expect(chainedValidator("hi")).toEqual(failure("Too short")); // Stops at first failure
        });

        it('should handle empty validator array', () => {
            const emptyValidator = combineValidators([]);
            expect(emptyValidator("any value")).toEqual(success("any value"));
        });

        it('should work with complex validator compositions', () => {
            const basicValidator = createValidator([
                { predicate: (s: string) => s.length > 0, errorMessage: "Cannot be empty" }
            ]);

            const emailValidator = createValidator([
                { predicate: (s: string) => s.includes("@"), errorMessage: "Must contain @" },
                { predicate: (s: string) => s.includes("."), errorMessage: "Must contain domain" }
            ]);

            const securityValidator = createValidator([
                { predicate: (s: string) => s.length >= 6, errorMessage: "Must be at least 6 characters" }
            ]);

            const comprehensiveValidator = combineValidators([
                basicValidator,
                emailValidator,
                securityValidator
            ]);

            expect(comprehensiveValidator("user@example.com")).toEqual(success("user@example.com"));
            expect(comprehensiveValidator("")).toEqual(failure("Cannot be empty; Must contain @; Must contain domain; Must be at least 6 characters"));
            expect(comprehensiveValidator("short")).toEqual(failure("Must contain @; Must contain domain; Must be at least 6 characters"));
        });
    });

    describe('Validation Integration', () => {
        it('should compose different validation strategies effectively', () => {
            // Create domain-specific validators
            const requiredFieldValidator = createValidator([
                { predicate: (s: string) => s.trim().length > 0, errorMessage: "Field is required" }
            ]);

            const emailFormatValidator = createValidator([
                { predicate: (e: string) => e.includes("@"), errorMessage: "Invalid email format" }
            ], 'chain');

            const lengthValidator = createValidator([
                { predicate: (s: string) => s.length <= 100, errorMessage: "Too long" }
            ]);

            // Combine them for comprehensive email validation
            const emailValidator = combineValidators([
                requiredFieldValidator,
                emailFormatValidator,
                lengthValidator
            ]);

            expect(emailValidator("user@example.com")).toEqual(success("user@example.com"));
            expect(emailValidator("")).toEqual(failure("Field is required; Invalid email format"));
            expect(emailValidator("invalid")).toEqual(failure("Invalid email format"));
        });

        it('should work with real-world form validation scenarios', () => {
            interface UserRegistration {
                username: string;
                email: string;
                password: string;
                confirmPassword: string;
            }

            const validateUserRegistration = (data: UserRegistration): Result<UserRegistration> => {
                const usernameResult = validateAll(data.username, [
                    { predicate: (u) => u.length >= 3, errorMessage: "Username too short" },
                    { predicate: (u) => u.length <= 20, errorMessage: "Username too long" },
                    { predicate: (u) => /^[a-zA-Z0-9_]+$/.test(u), errorMessage: "Username contains invalid characters" }
                ]);

                const emailResult = validateAll(data.email, [
                    { predicate: (e) => e.includes("@"), errorMessage: "Invalid email" },
                    { predicate: (e) => e.includes("."), errorMessage: "Email missing domain" }
                ]);

                const passwordResult = validateAll(data.password, [
                    { predicate: (p) => p.length >= 8, errorMessage: "Password too short" },
                    { predicate: (p) => /[A-Z]/.test(p), errorMessage: "Password needs uppercase" }
                ]);

                const confirmResult = validateAll(data.confirmPassword, [
                    { predicate: (c) => c === data.password, errorMessage: "Passwords don't match" }
                ]);

                // Collect all validation errors
                const errors: string[] = [];
                if (!usernameResult.success) errors.push(`Username: ${usernameResult.error}`);
                if (!emailResult.success) errors.push(`Email: ${emailResult.error}`);
                if (!passwordResult.success) errors.push(`Password: ${passwordResult.error}`);
                if (!confirmResult.success) errors.push(`Confirm: ${confirmResult.error}`);

                return errors.length === 0 ? success(data) : failure(errors.join('; '));
            };

            const validData: UserRegistration = {
                username: "alice123",
                email: "alice@example.com",
                password: "SecurePass123",
                confirmPassword: "SecurePass123"
            };

            const invalidData: UserRegistration = {
                username: "ab",
                email: "invalid",
                password: "weak",
                confirmPassword: "different"
            };

            expect(validateUserRegistration(validData)).toEqual(success(validData));
            expect(validateUserRegistration(invalidData).success).toBe(false);
        });
    });
});