import { describe, test, expect } from 'vitest'
import {
  type BinaryOperationResult,
  BinaryOperationStatus,
  isBinarySuccessStatus,
  isBinaryErrorStatus,
  isBinaryInfoStatus,
  BinaryStatusSeverity,
  getBinaryStatusSeverity,
  getBinaryStatusName,
  binarySuccess,
  binaryResult,
  isBinarySuccess,
  isBinaryError,
  isBinaryInfo,
  unwrapBinary,
  unwrapBinaryOr
} from '../../binary-status-result'

describe('Binary Status Result Module', () => {
  describe('Feature: Status Classification', () => {
    describe('Scenario: Identifying success status', () => {
      describe('Given a SUCCESS status', () => {
        test('When I check if it is a success status, Then it should be identified as success', () => {
          // Given
          const status = BinaryOperationStatus.SUCCESS

          // When
          const result = isBinarySuccessStatus(status)

          // Then
          expect(result).toBe(true)
        })
      })

      describe('Given an error status', () => {
        test('When I check if it is a success status, Then it should not be identified as success', () => {
          // Given
          const status = BinaryOperationStatus.ADDRESS_OUT_OF_BOUNDS

          // When
          const result = isBinarySuccessStatus(status)

          // Then
          expect(result).toBe(false)
        })
      })
    })

    describe('Scenario: Identifying error status', () => {
      describe('Given an error status', () => {
        test('When I check if it is an error status, Then it should be identified as error', () => {
          // Given
          const status = BinaryOperationStatus.INVALID_BIT_COUNT

          // When
          const result = isBinaryErrorStatus(status)

          // Then
          expect(result).toBe(true)
        })
      })

      describe('Given a success status', () => {
        test('When I check if it is an error status, Then it should not be identified as error', () => {
          // Given
          const status = BinaryOperationStatus.SUCCESS

          // When
          const result = isBinaryErrorStatus(status)

          // Then
          expect(result).toBe(false)
        })
      })
    })

    describe('Scenario: Identifying info status', () => {
      describe('Given an info status', () => {
        test('When I check if it is an info status, Then it should be identified as info', () => {
          // Given
          const status = BinaryOperationStatus.EMPTY_MEMORY

          // When
          const result = isBinaryInfoStatus(status)

          // Then
          expect(result).toBe(true)
        })
      })

      describe('Given an error status', () => {
        test('When I check if it is an info status, Then it should not be identified as info', () => {
          // Given
          const status = BinaryOperationStatus.CALCULATION_ERROR

          // When
          const result = isBinaryInfoStatus(status)

          // Then
          expect(result).toBe(false)
        })
      })
    })
  })

  describe('Feature: Status Severity Assessment', () => {
    describe('Scenario: Getting severity levels for different status types', () => {
      describe('Given a SUCCESS status', () => {
        test('When I get its severity, Then it should return SUCCESS', () => {
          // Given
          const status = BinaryOperationStatus.SUCCESS

          // When
          const severity = getBinaryStatusSeverity(status)

          // Then
          expect(severity).toBe(BinaryStatusSeverity.SUCCESS)
        })
      })

      describe('Given an info status', () => {
        test('When I get its severity, Then it should return INFORMATION', () => {
          // Given
          const status = BinaryOperationStatus.NO_SET_BITS_FOUND

          // When
          const severity = getBinaryStatusSeverity(status)

          // Then
          expect(severity).toBe(BinaryStatusSeverity.INFORMATION)
        })
      })

      describe('Given an error status', () => {
        test('When I get its severity, Then it should return ERROR', () => {
          // Given
          const status = BinaryOperationStatus.INVALID_ADDRESS

          // When
          const severity = getBinaryStatusSeverity(status)

          // Then
          expect(severity).toBe(BinaryStatusSeverity.ERROR)
        })
      })

      describe('Given a warning status', () => {
        test('When I get its severity, Then it should return WARNING', () => {
          // Given
          const status = 999 as BinaryOperationStatus;

          // When
          const severity = getBinaryStatusSeverity(status)

          // Then
          expect(severity).toBe(BinaryStatusSeverity.WARNING)
        })
      })
    })
  })

  describe('Feature: Status Name Resolution', () => {
    describe('Scenario: Getting human-readable status names', () => {
      describe('Given a SUCCESS status', () => {
        test('When I get its name, Then it should return "SUCCESS"', () => {
          // Given
          const status = BinaryOperationStatus.SUCCESS

          // When
          const name = getBinaryStatusName(status)

          // Then
          expect(name).toBe('SUCCESS')
        })
      })

      describe('Given an error status', () => {
        test('When I get its name, Then it should return correct error name', () => {
          // Given
          const status = BinaryOperationStatus.ADDRESS_OUT_OF_BOUNDS

          // When
          const name = getBinaryStatusName(status)

          // Then
          expect(name).toBe('ADDRESS_OUT_OF_BOUNDS')
        })
      })

      describe('Given an unknown status value', () => {
        test('When I get its name, Then it should return formatted unknown status', () => {
          // Given
          const status = 999 as BinaryOperationStatus

          // When
          const name = getBinaryStatusName(status)

          // Then
          expect(name).toBe('UNKNOWN_STATUS_999')
        })
      })
    })
  })

  describe('Feature: Binary Operation Result Creation', () => {
    describe('Scenario: Creating successful binary results', () => {
      describe('Given a value', () => {
        test('When I create a successful result, Then it should contain the value and SUCCESS status', () => {
          // Given
          const value = 42

          // When
          const result = binarySuccess(value)

          // Then
          expect(result.status).toBe(BinaryOperationStatus.SUCCESS)
          expect(result.value).toBe(value)
          expect(result.message).toBeUndefined()
        })
      })

      describe('Given a value and message', () => {
        test('When I create a successful result with message, Then it should contain the message', () => {
          // Given
          const value = 'test'
          const message = 'Operation completed successfully'

          // When
          const result = binarySuccess(value, message)

          // Then
          expect(result.message).toBe(message)
        })
      })
    })

    describe('Scenario: Creating custom binary results', () => {
      describe('Given an info status', () => {
        test('When I create a result with that status, Then it should have the correct status', () => {
          // Given
          const status = BinaryOperationStatus.EMPTY_MEMORY

          // When
          const result = binaryResult(status, undefined, 'Memory is empty')

          // Then
          expect(result.status).toBe(status)
          expect(result.message).toBe('Memory is empty')
        })
      })

      describe('Given an error status and message', () => {
        test('When I create an error result, Then it should be properly formed', () => {
          // Given
          const status = BinaryOperationStatus.INVALID_BIT_POSITION
          const message = 'Bit position is out of range'

          // When
          const result = binaryResult(status, undefined, message)

          // Then
          expect(result.status).toBe(status)
          expect(result.message).toBe(message)
          expect(result.value).toBeUndefined()
        })
      })
    })
  })

  describe('Feature: Binary Result Classification', () => {
    describe('Scenario: Identifying successful binary results', () => {
      describe('Given a successful binary result', () => {
        test('When I check if it is successful, Then it should be identified as success', () => {
          // Given
          const result = binarySuccess(100)

          // When
          const isSuccess = isBinarySuccess(result)

          // Then
          expect(isSuccess).toBe(true)
        })
      })

      describe('Given a failed binary result', () => {
        test('When I check if it is successful, Then it should not be identified as success', () => {
          // Given
          const result = binaryResult(BinaryOperationStatus.CALCULATION_ERROR)

          // When
          const isSuccess = isBinarySuccess(result)

          // Then
          expect(isSuccess).toBe(false)
        })
      })
    })

    describe('Scenario: Identifying error binary results', () => {
      describe('Given an error binary result', () => {
        test('When I check if it is an error, Then it should be identified as error', () => {
          // Given
          const result = binaryResult(BinaryOperationStatus.INVALID_BIT_VALUE)

          // When
          const isError = isBinaryError(result)

          // Then
          expect(isError).toBe(true)
        })
      })

      describe('Given a successful binary result', () => {
        test('When I check if it is an error, Then it should not be identified as error', () => {
          // Given
          const result = binarySuccess('success')

          // When
          const isError = isBinaryError(result)

          // Then
          expect(isError).toBe(false)
        })
      })
    })

    describe('Scenario: Identifying info binary results', () => {
      describe('Given an info binary result', () => {
        test('When I check if it is info, Then it should be identified as info', () => {
          // Given
          const result = binaryResult(BinaryOperationStatus.NO_SET_BITS_FOUND)

          // When
          const isInfo = isBinaryInfo(result)

          // Then
          expect(isInfo).toBe(true)
        })
      })

      describe('Given a non-info binary result', () => {
        test('When I check if it is info, Then it should not be identified as info', () => {
          // Given
          const result = binarySuccess(123)

          // When
          const isInfo = isBinaryInfo(result)

          // Then
          expect(isInfo).toBe(false)
        })
      })
    })
  })

  describe('Feature: Binary Result Value Extraction', () => {
    describe('Scenario: Unwrapping successful results', () => {
      describe('Given a successful result with value', () => {
        test('When I unwrap the result, Then I should get the value', () => {
          // Given
          const expectedValue = 'test-value'
          const result = binarySuccess(expectedValue)

          // When
          const value = unwrapBinary(result)

          // Then
          expect(value).toBe(expectedValue)
        })
      })

      describe('Given a failed result with custom message', () => {
        test('When I try to unwrap the result, Then it should throw an error with the expected message', () => {
          // Given
          const result = binaryResult(BinaryOperationStatus.ADDRESS_OUT_OF_BOUNDS, undefined, 'Custom error message')

          // When & Then
          expect(() => unwrapBinary(result)).toThrow('Binary operation failed: ADDRESS_OUT_OF_BOUNDS - Custom error message')
        })
      })

      describe('Given a failed result without message', () => {
        test('When I try to unwrap the result, Then it should throw error with default message', () => {
          // Given
          const result = binaryResult(BinaryOperationStatus.INVALID_BIT_COUNT)

          // When & Then
          expect(() => unwrapBinary(result)).toThrow('Binary operation failed: INVALID_BIT_COUNT - failure')
        })
      })
    })

    describe('Scenario: Unwrapping with default values', () => {
      describe('Given a successful result and default value', () => {
        test('When I unwrap with default, Then I should get the actual value', () => {
          // Given
          const actualValue = 42
          const defaultValue = 0
          const result = binarySuccess(actualValue)

          // When
          const value = unwrapBinaryOr(result, defaultValue)

          // Then
          expect(value).toBe(actualValue)
        })
      })

      describe('Given a failed result and default value', () => {
        test('When I unwrap with default, Then I should get the default value', () => {
          // Given
          const defaultValue = 'fallback'
          const result = binaryResult(BinaryOperationStatus.CALCULATION_ERROR)

          // When
          const value = unwrapBinaryOr(result, defaultValue)

          // Then
          expect(value).toBe(defaultValue)
        })
      })
    })
  })

  describe('Feature: End-to-End Binary Operation Workflows', () => {
    describe('Scenario: Complete binary operation success workflow', () => {
      describe('Given I perform a binary operation that succeeds', () => {
        test('When I check the result, Then all checks should pass', () => {
          // Given
          const operationResult = performMockBinaryOperation(true, 'processed-data')

          // When & Then
          expect(isBinarySuccess(operationResult)).toBe(true)
          expect(isBinaryError(operationResult)).toBe(false)
          expect(isBinaryInfo(operationResult)).toBe(false)

          expect(unwrapBinary(operationResult)).toBe('processed-data')
          expect(getBinaryStatusSeverity(operationResult.status)).toBe(BinaryStatusSeverity.SUCCESS)
        })
      })
    })

    describe('Scenario: Complete binary operation error workflow', () => {
      describe('Given I perform a binary operation that fails', () => {
        test('When I check the result, Then all checks should reflect the failure', () => {
          // Given
          const operationResult = performMockBinaryOperation(false, undefined, 'Operation failed due to invalid input')

          // When & Then
          expect(isBinaryError(operationResult)).toBe(true)
          expect(isBinarySuccess(operationResult)).toBe(false)
          expect(isBinaryInfo(operationResult)).toBe(false)

          expect(() => unwrapBinary(operationResult)).toThrow()
          expect(unwrapBinaryOr(operationResult, 'default')).toBe('default')
          expect(getBinaryStatusSeverity(operationResult.status)).toBe(BinaryStatusSeverity.ERROR)
        })
      })
    })

    describe('Scenario: Complete binary operation info workflow', () => {
      describe('Given I perform a binary operation that returns info', () => {
        test('When I check the result, Then all checks should reflect the info state', () => {
          // Given
          const operationResult = performMockBinaryOperation('info', undefined, 'No data found but operation completed')

          // When & Then
          expect(isBinaryInfo(operationResult)).toBe(true)
          expect(isBinarySuccess(operationResult)).toBe(false)
          expect(isBinaryError(operationResult)).toBe(false)

          expect(getBinaryStatusSeverity(operationResult.status)).toBe(BinaryStatusSeverity.INFORMATION)
          expect(getBinaryStatusName(operationResult.status)).toBe('EMPTY_MEMORY')
        })
      })
    })
  })
})

// Mock helper function to simulate binary operations
function performMockBinaryOperation(
  success: boolean | 'info',
  value?: string,
  message?: string
): BinaryOperationResult<string> {
  if (success === true) {
    return binarySuccess(value!, message)
  } else if (success === 'info') {
    return binaryResult(BinaryOperationStatus.EMPTY_MEMORY, value, message)
  } else {
    return binaryResult(BinaryOperationStatus.INVALID_ADDRESS, value, message)
  }
}