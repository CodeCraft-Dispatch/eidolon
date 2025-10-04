export type Bit = 0 | 1
export type ByteAddress = number
export type BitPosition = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7
export type BitMemory = Uint8Array

// Core bit manipulation functions
export const createBitMemory = (sizeInBytes: number): BitMemory =>
  new Uint8Array(sizeInBytes)

// Pure functions for bit mask operations
export const createBitMask = (bitPosition: BitPosition): number => 1 << bitPosition

export const setBitInByte = (byte: number, bitPosition: BitPosition): number => 
  byte | createBitMask(bitPosition)

export const clearBitInByte = (byte: number, bitPosition: BitPosition): number =>
  byte & (~createBitMask(bitPosition) & 0xFF)

export const isBitSetInByte = (byte: number, bitPosition: BitPosition): boolean =>
  (byte & createBitMask(bitPosition)) !== 0

export const setBit = (
  memory: BitMemory,
  address: ByteAddress,
  bitPosition: BitPosition,
  value: Bit
): BitMemory => {
  if (address >= memory.length) {
    throw new Error(`Address ${address} out of bounds`)
  }

  const currentByte = memory[address]
  const newByte = value === 1 
    ? setBitInByte(currentByte, bitPosition)
    : clearBitInByte(currentByte, bitPosition)

  // Functional approach: create new array with updated byte
  const newMemory = new Uint8Array(memory)
  newMemory[address] = newByte
  return newMemory
}

export const getBit = (
  memory: BitMemory,
  address: ByteAddress,
  bitPosition: BitPosition
): Bit => {
  if (address >= memory.length) {
    throw new Error(`Address ${address} out of bounds`)
  }

  const byte = memory[address]
  return isBitSetInByte(byte, bitPosition) ? 1 : 0
}

export const setByte = (
  memory: BitMemory,
  address: ByteAddress,
  value: number
): BitMemory => {
  if (address >= memory.length) {
    throw new Error(`Address ${address} out of bounds`)
  }

  const newMemory = new Uint8Array(memory)
  newMemory[address] = value & 0xFF
  return newMemory
}

export const getByte = (
  memory: BitMemory,
  address: ByteAddress
): number => {
  if (address >= memory.length) {
    throw new Error(`Address ${address} out of bounds`)
  }
  return memory[address]
}

// Higher-order functions for bit operations
export const flipBit = (
  memory: BitMemory,
  address: ByteAddress,
  bitPosition: BitPosition
): BitMemory => {
  const currentBit = getBit(memory, address, bitPosition)
  const flippedBit: Bit = currentBit === 0 ? 1 : 0
  return setBit(memory, address, bitPosition, flippedBit)
}

export const setBits = (
  memory: BitMemory,
  operations: Array<{ address: ByteAddress; bitPosition: BitPosition; value: Bit }>
): BitMemory =>
  operations.reduce(
    (mem, { address, bitPosition, value }) => setBit(mem, address, bitPosition, value),
    memory
  )

export const getBits = (
  memory: BitMemory,
  positions: Array<{ address: ByteAddress; bitPosition: BitPosition }>
): Bit[] =>
  positions.map(({ address, bitPosition }) => getBit(memory, address, bitPosition))

// Utility functions for bit patterns (LSB-first ordering)
export const byteToBits = (byte: number): Bit[] => {
  const bits: Bit[] = []
  for (let i = 0; i <= 7; i++) {
    const bitPosition = i as BitPosition
    bits.push(isBitSetInByte(byte, bitPosition) ? 1 : 0)
  }
  return bits
}

export const bitsToByte = (bits: Bit[]): number => {
  if (bits.length !== 8) {
    throw new Error("Must provide exactly 8 bits")
  }
  
  return bits.reduce((byte: number, bit: Bit, index: number): number => {
    const bitPosition = index as BitPosition
    return bit === 1 ? setBitInByte(byte, bitPosition) : byte
  }, 0 as number)
}

export const getMemoryBits = (
  memory: BitMemory,
  address: ByteAddress
): Bit[] => byteToBits(getByte(memory, address))

export const setMemoryBits = (
  memory: BitMemory,
  address: ByteAddress,
  bits: Bit[]
): BitMemory => {
  const byte = bitsToByte(bits)
  return setByte(memory, address, byte)
}

// Pure function for counting set bits in a byte using Brian Kernighan's algorithm
const countSetBitsInByte = (byte: number): number => {
  let count = 0
  let bits = byte
  while (bits) {
    count++
    bits &= bits - 1 // Clear the rightmost set bit
  }
  return count
}

// Bit counting and analysis functions
export const countSetBits = (memory: BitMemory): number =>
  Array.from(memory).reduce((count, byte) => count + countSetBitsInByte(byte), 0)

// Pure function to check if position is within valid bit range
const isInBitRange = (position: number): boolean =>
  position >= 0 && position <= 7

// Pure function to check if position is outside valid bit range
const isOutOfBitRange = (position: number): boolean =>
  !isInBitRange(position)

// Pure function to validate bit position from calculation
const isInvalidBitPosition = (position: number): boolean => 
  !Number.isInteger(position) || isOutOfBitRange(position)

// Helper function to find first set bit in a byte using bit manipulation
const findFirstSetBitInByte = (byte: number): BitPosition | null => {
  if (byte === 0) return null
  
  // Use bitwise operations to find the rightmost set bit
  // This is more efficient than looping
  const rightmostBit = byte & -byte
  const position = Math.log2(rightmostBit)
  
  // Safety check: ensure position is a valid bit position
  if (isInvalidBitPosition(position)) {
    return null
  }
  
  return position as BitPosition
}

export const findFirstSetBit = (
  memory: BitMemory
): { address: ByteAddress; bitPosition: BitPosition } | null => {
  // Find the first non-zero byte
  const address = memory.findIndex(byte => byte !== 0)
  if (address === -1) return null
  
  const bitPosition = findFirstSetBitInByte(memory[address])
  return bitPosition !== null ? { address, bitPosition } : null
}

// Memory inspection utilities
export const getMemorySize = (memory: BitMemory): number => memory.length

export const getTotalBitCapacity = (memory: BitMemory): number => memory.length * 8

export const memoryToHex = (memory: BitMemory): string =>
  Array.from(memory)
    .map(byte => byte.toString(16).padStart(2, "0"))
    .join(" ")

export const memoryToBinary = (memory: BitMemory): string =>
  Array.from(memory)
    .map(byte => byte.toString(2).padStart(8, "0"))
    .join(" ")

// Validation functions
export const isValidBitPosition = (position: number): position is BitPosition =>
  Number.isInteger(position) && isInBitRange(position)

export const isValidAddress = (memory: BitMemory, address: number): boolean =>
  Number.isInteger(address) && address >= 0 && address < memory.length

export const isValidBit = (value: unknown): value is Bit =>
  value === 0 || value === 1
