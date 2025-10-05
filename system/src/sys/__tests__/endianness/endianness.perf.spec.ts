import { describe, it, expect, beforeEach } from 'vitest'
import {
  type Endianness,
  getSystemEndianness,
  swapBytes16,
  swapBytes32,
  swapBytes64,
  readInt16,
  writeInt16,
  readInt32,
  writeInt32,
  readInt64,
  writeInt64,
  readUint16,
  writeUint16,
  readUint32,
  writeUint32,
  readUint64,
  writeUint64,
  readFloat32,
  writeFloat32,
  readFloat64,
  writeFloat64
} from '../../endianness'
import { type BitMemory, createBitMemory } from '../../binary'

describe('endianness performance tests', () => {
  const PERFORMANCE_THRESHOLD_MS = 150 // ms for most operations
  const LARGE_OPERATIONS_THRESHOLD_MS = 200 // ms for large-scale operations

  describe('byte swapping performance', () => {
    const iterations = 50000
    const scenarios = [
      { name: '16-bit', testFn: (value: number | bigint) => swapBytes16(value as number), testValues: [0x0000, 0x1234, 0xABCD, 0xFFFF] },
      { name: '32-bit', testFn: (value: number | bigint) => swapBytes32(value as number), testValues: [0x00000000, 0x12345678, 0xABCDEF01, 0xFFFFFFFF] },
      { name: '64-bit', testFn: (value: number | bigint) => swapBytes64(value as bigint), testValues: [0x0000000000000000n, 0x123456789ABCDEF0n, 0xFFFFFFFFFFFFFFFFn] }
    ]

    scenarios.forEach(scenario => {
      it(`should perform ${scenario.name} byte swaps quickly`, () => {
        const start = performance.now()
        for (let i = 0; i < iterations; i++) {
          const value = scenario.testValues[i % scenario.testValues.length]
          scenario.testFn(value)
        }
        const duration = performance.now() - start

        expect(duration).toBeLessThan(PERFORMANCE_THRESHOLD_MS)
      })
    })
  })

  describe('integer and floating-point performance', () => {
    const integerScenarios = [
      {
        name: '16-bit integer',
        dataSize: 2,
        memorySize: 1024,
        iterations: 10000,
        operations: {
          signed: {
            write: writeInt16,
            read: readInt16,
            generateValue: (i: number) => (i % 65536) - 32768
          },
          unsigned: {
            write: writeUint16,
            read: readUint16,
            generateValue: (i: number) => i % 65536
          }
        }
      },
      {
        name: '32-bit integer',
        dataSize: 4,
        memorySize: 2048,
        iterations: 5000,
        operations: {
          signed: {
            write: writeInt32,
            read: readInt32,
            generateValue: (i: number) => (i * 12345) | 0
          },
          unsigned: {
            write: writeUint32,
            read: readUint32,
            generateValue: (i: number) => (i * 12345) >>> 0
          }
        }
      },
      {
        name: '64-bit integer',
        dataSize: 8,
        memorySize: 4096,
        iterations: 2000,
        operations: {
          signed: {
            write: writeInt64,
            read: readInt64,
            generateValue: (i: number) => BigInt(i) * 123456789n
          },
          unsigned: {
            write: writeUint64,
            read: readUint64,
            generateValue: (i: number) => BigInt(i) * 123456789n
          }
        }
      }
    ]

    const floatingPointScenarios = [
      {
        name: '32-bit float',
        dataSize: 4,
        memorySize: 2048,
        iterations: 5000,
        write: writeFloat32,
        read: readFloat32,
        testValues: [0.0, 1.0, -1.0, 3.14159, -3.14159, 1e6, -1e6],
        generateValue: (i: number, testValues: number[]) => testValues[i % testValues.length] * (i + 1)
      },
      {
        name: '64-bit float',
        dataSize: 8,
        memorySize: 2048,
        iterations: 2500,
        write: writeFloat64,
        read: readFloat64,
        testValues: [0.0, 1.0, -1.0, Math.PI, -Math.PI, 1e100, -1e100],
        generateValue: (i: number, testValues: number[]) => testValues[i % testValues.length] * (i + 1)
      }
    ]

    // Generate integer performance tests
    integerScenarios.forEach(scenario => {
      describe(`${scenario.name} performance`, () => {
        let memory: BitMemory

        beforeEach(() => {
          memory = createBitMemory(scenario.memorySize)
        })

        Object.entries(scenario.operations).forEach(([signedness, ops]) => {
          it(`should perform ${signedness} ${scenario.name} writes quickly`, () => {
            const systemEndianness = getSystemEndianness()
            
            const start = performance.now()
            let testMemory = memory
            for (let i = 0; i < scenario.iterations; i++) {
              const address = (i * scenario.dataSize) % (memory.length - (scenario.dataSize - 1))
              const value = ops.generateValue(i)
              testMemory = ops.write(testMemory, address, value, systemEndianness)
            }
            const duration = performance.now() - start
            
            expect(duration).toBeLessThan(PERFORMANCE_THRESHOLD_MS)
          })

          it(`should perform ${signedness} ${scenario.name} reads quickly`, () => {
            // Pre-populate memory
            let testMemory = memory
            const systemEndianness = getSystemEndianness()
            const prepopulateCount = Math.min(500, Math.floor(memory.length / scenario.dataSize))
            
            for (let i = 0; i < prepopulateCount; i++) {
              const address = i * scenario.dataSize
              const value = ops.generateValue(i)
              testMemory = ops.write(testMemory, address, value, systemEndianness)
            }

            const start = performance.now()
            for (let i = 0; i < scenario.iterations; i++) {
              const address = (i * scenario.dataSize) % (memory.length - (scenario.dataSize - 1))
              ops.read(testMemory, address, systemEndianness)
            }
            const duration = performance.now() - start
            
            expect(duration).toBeLessThan(PERFORMANCE_THRESHOLD_MS)
          })

          it(`should perform ${signedness} ${scenario.name} operations quickly`, () => {
            const systemEndianness = getSystemEndianness()
            
            const start = performance.now()
            let testMemory = memory
            for (let i = 0; i < scenario.iterations; i++) {
              const address = (i * scenario.dataSize) % (memory.length - (scenario.dataSize - 1))
              const value = ops.generateValue(i)
              testMemory = ops.write(testMemory, address, value, systemEndianness)
              ops.read(testMemory, address, systemEndianness)
            }
            const duration = performance.now() - start
            
            expect(duration).toBeLessThan(PERFORMANCE_THRESHOLD_MS)
          })
        })
      })
    })

    // Generate floating-point performance tests
    floatingPointScenarios.forEach(scenario => {
      describe(`${scenario.name} performance`, () => {
        let memory: BitMemory

        beforeEach(() => {
          memory = createBitMemory(scenario.memorySize)
        })

        it(`should perform ${scenario.name} operations quickly`, () => {
          const systemEndianness = getSystemEndianness()
          
          const start = performance.now()
          let testMemory = memory
          for (let i = 0; i < scenario.iterations; i++) {
            const address = (i * scenario.dataSize) % (memory.length - (scenario.dataSize - 1))
            const value = scenario.generateValue(i, scenario.testValues)
            testMemory = scenario.write(testMemory, address, value, systemEndianness)
            scenario.read(testMemory, address, systemEndianness)
          }
          const duration = performance.now() - start
          
          expect(duration).toBeLessThan(PERFORMANCE_THRESHOLD_MS)
        })
      })
    })
  })

  describe('cross-endian performance', () => {
    let memory: BitMemory

    beforeEach(() => {
      memory = createBitMemory(1024)
    })

    it('should handle endian conversions efficiently', () => {
      const iterations = 5000
      const littleEndian: Endianness = 'little'
      const bigEndian: Endianness = 'big'
      
      const start = performance.now()
      let testMemory = memory
      for (let i = 0; i < iterations; i++) {
        const address = (i * 4) % (memory.length - 3)
        const value = i * 12345
        
        // Write in little-endian, read in big-endian
        testMemory = writeInt32(testMemory, address, value, littleEndian)
        readInt32(testMemory, address, bigEndian)
        
        // Write in big-endian, read in little-endian  
        testMemory = writeInt32(testMemory, address, value, bigEndian)
        readInt32(testMemory, address, littleEndian)
      }
      const duration = performance.now() - start
      
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLD_MS)
    })
  })

  describe('memory scaling performance', () => {
    const memorySizes = [256, 1024, 4096] // Different memory sizes

    memorySizes.forEach(size => {
      it(`should maintain performance with ${size} byte memory`, () => {
        const memory = createBitMemory(size)
        const iterations = Math.floor(1000 * (256 / size)) // Scale iterations with size
        const systemEndianness = getSystemEndianness()
        
        const start = performance.now()
        let testMemory = memory
        for (let i = 0; i < iterations; i++) {
          const address = (i * 4) % (size - 3)
          const value = i * 789
          testMemory = writeInt32(testMemory, address, value, systemEndianness)
          readInt32(testMemory, address, systemEndianness)
        }
        const duration = performance.now() - start
        
        expect(duration).toBeLessThan(PERFORMANCE_THRESHOLD_MS)
      })
    })
  })

  describe('real-world usage patterns', () => {
    const realWorldScenarios = [
      {
        name: 'protocol header parsing',
        memorySize: 1024,
        iterations: 1000,
        recordSize: 16,
        threshold: LARGE_OPERATIONS_THRESHOLD_MS,
        operations: (testMemory: BitMemory, baseAddr: number, i: number) => {
          // Parse protocol header (mixed endianness like real protocols)
          testMemory = writeUint16(testMemory, baseAddr, 0x1234, 'big')      // Magic number (big-endian)
          testMemory = writeUint16(testMemory, baseAddr + 2, i, 'little')     // Sequence (little-endian)
          testMemory = writeUint32(testMemory, baseAddr + 4, i * 1000, 'big') // Timestamp (big-endian)
          testMemory = writeUint32(testMemory, baseAddr + 8, i % 256, 'little') // Flags (little-endian)
          testMemory = writeFloat32(testMemory, baseAddr + 12, i * 0.1, 'big') // Version (big-endian float)
          
          // Read back values
          readUint16(testMemory, baseAddr, 'big')
          readUint16(testMemory, baseAddr + 2, 'little')
          readUint32(testMemory, baseAddr + 4, 'big')
          readUint32(testMemory, baseAddr + 8, 'little')
          readFloat32(testMemory, baseAddr + 12, 'big')
          
          return testMemory
        }
      },
      {
        name: 'binary file format operations',
        memorySize: 2048,
        iterations: 500,
        recordSize: 32,
        threshold: LARGE_OPERATIONS_THRESHOLD_MS,
        operations: (testMemory: BitMemory, baseAddr: number, i: number) => {
          // File header simulation
          testMemory = writeUint32(testMemory, baseAddr, 0x4D5A9000, 'little')    // Magic signature
          testMemory = writeUint16(testMemory, baseAddr + 4, i, 'little')         // Version
          testMemory = writeUint16(testMemory, baseAddr + 6, i % 16, 'little')    // Flags
          testMemory = writeUint64(testMemory, baseAddr + 8, BigInt(i) * 1000n, 'little') // File size
          testMemory = writeFloat64(testMemory, baseAddr + 16, i * Math.PI, 'little')     // Timestamp
          testMemory = writeInt32(testMemory, baseAddr + 24, -i, 'little')        // Offset
          testMemory = writeUint32(testMemory, baseAddr + 28, ~i, 'little')       // Checksum
          
          // Verify data integrity
          const magic = readUint32(testMemory, baseAddr, 'little')
          const version = readUint16(testMemory, baseAddr + 4, 'little')
          const fileSize = readUint64(testMemory, baseAddr + 8, 'little')
          const timestamp = readFloat64(testMemory, baseAddr + 16, 'little')
          const offset = readInt32(testMemory, baseAddr + 24, 'little')
          
          // Basic validation
          expect(magic).toBe(0x4D5A9000)
          expect(version).toBe(i)
          expect(fileSize).toBe(BigInt(i) * 1000n)
          // Handle edge case of negative zero for i = 0
          if (i === 0) {
            expect(offset).toBe(0)
          } else {
            expect(offset).toBe(-i)
          }
          
          return testMemory
        }
      }
    ]

    realWorldScenarios.forEach(scenario => {
      it(`should handle ${scenario.name} efficiently`, () => {
        const memory = createBitMemory(scenario.memorySize)
        
        const start = performance.now()
        let testMemory = memory
        
        for (let i = 0; i < scenario.iterations; i++) {
          const baseAddr = (i * scenario.recordSize) % (memory.length - (scenario.recordSize - 1))
          testMemory = scenario.operations(testMemory, baseAddr, i)
        }
        
        const duration = performance.now() - start
        expect(duration).toBeLessThan(scenario.threshold)
      })
    })
  })
})