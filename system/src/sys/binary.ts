export const BIT_ON = 1
export const BIT_OFF = 0

export type Bit = 0 | 1
type ValidBitArray = Bit[]
export type ByteAddress = number
type ValidatedByteAddress = ByteAddress
export type BitPosition = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7
export type BitMemory = Uint8Array

export const MIN_BIT_POSITION: BitPosition = 0 as BitPosition
export const MAX_BIT_POSITION: BitPosition = 7 as BitPosition
export const MAX_BIT_COUNT: number = 8

export const BINARY_BASE: number = 2;
export const HEX_BASE: number = 16

export const BYTE_MASK: number = 0xFF

// Core bit manipulation functions
export const createBitMemory = (sizeInBytes: number): BitMemory =>
  new Uint8Array(sizeInBytes)

// Pure functions for bit mask operations
export const createBitMask = (bitPosition: BitPosition): number => 1 << bitPosition

export const setBitInByte = (byte: number, bitPosition: BitPosition): number => 
  byte | createBitMask(bitPosition)

export const clearBitInByte = (byte: number, bitPosition: BitPosition): number =>
  byte & (~createBitMask(bitPosition) & BYTE_MASK)

export const isBitSetInByte = (byte: number, bitPosition: BitPosition): boolean =>
  (byte & createBitMask(bitPosition)) !== BIT_OFF

const isValidAddressInternal = (memory: BitMemory, address: ByteAddress): address is ValidatedByteAddress => {
  return address < memory.length;
}

const validateAddress = (memory: BitMemory, address: ByteAddress) => {
  if (!isValidAddressInternal(memory, address)) {
    throw new Error(`Address ${address} out of bounds`)
  }
}

export const setBit = (
  memory: BitMemory,
  address: ByteAddress,
  bitPosition: BitPosition,
  value: Bit
): BitMemory => {
  validateAddress(memory, address);

  const currentByte = memory[address]
  const newByte = value === BIT_ON 
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
  validateAddress(memory, address);

  const byte = memory[address]
  return isBitSetInByte(byte, bitPosition) ? BIT_ON : BIT_OFF
}

export const setByte = (
  memory: BitMemory,
  address: ByteAddress,
  value: number
): BitMemory => {
  validateAddress(memory, address);

  const newMemory = new Uint8Array(memory)
  newMemory[address] = value & BYTE_MASK
  return newMemory
}

export const getByte = (
  memory: BitMemory,
  address: ByteAddress
): number => {
  validateAddress(memory, address);
  return memory[address]
}

// Higher-order functions for bit operations
export const flipBit = (
  memory: BitMemory,
  address: ByteAddress,
  bitPosition: BitPosition
): BitMemory => {
  const currentBit = getBit(memory, address, bitPosition)
  const flippedBit: Bit = currentBit === BIT_OFF ? BIT_ON : BIT_OFF
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
  for (let i = MIN_BIT_POSITION; i <= MAX_BIT_POSITION; i++) {
    const bitPosition = i as BitPosition
    bits.push(isBitSetInByte(byte, bitPosition) ? BIT_ON : BIT_OFF)
  }
  return bits
}

const isValidBitCount = (bits: Bit[]): bits is ValidBitArray => bits.length === MAX_BIT_COUNT

const validateBitCount = (bits: Bit[]) => {
  if (!isValidBitCount(bits)) {
    throw new Error(`Must provide exactly ${MAX_BIT_COUNT} bits`)
  }
}

export const bitsToByte = (bits: Bit[]): number => {
  validateBitCount(bits);

  return bits.reduce((byte: number, bit: Bit, index: number): number => {
    const bitPosition = index as BitPosition
    return bit === BIT_ON ? setBitInByte(byte, bitPosition) : byte
  }, BIT_OFF as number)
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
  Array.from(memory).reduce((count, byte) => count + countSetBitsInByte(byte), BIT_OFF)

// Pure function to check if position is within valid bit range
export const isInBitRange = (position: number): boolean =>
  position >= MIN_BIT_POSITION && position <= MAX_BIT_POSITION

// Pure function to check if position is outside valid bit range
export const isOutOfBitRange = (position: number): boolean =>
  !isInBitRange(position)

// Pure function to validate bit position from calculation
export const isInvalidBitPosition = (position: number): boolean => 
  !Number.isInteger(position) || isOutOfBitRange(position)

const RIGHTMOST_BIT_POSITION: Record<number, BitPosition> = {
    1: 0,    // 0x01 -> position 0
    2: 1,    // 0x02 -> position 1  
    4: 2,    // 0x04 -> position 2
    8: 3,    // 0x08 -> position 3
    16: 4,   // 0x10 -> position 4
    32: 5,   // 0x20 -> position 5
    64: 6,   // 0x40 -> position 6
    128: 7   // 0x80 -> position 7
  } as const

// Helper function to find first set bit in a byte
const findFirstSetBitInByte = (byte: number): BitPosition | null => {
  if (byte <= 0 || byte > BYTE_MASK) return null

  const rightmostBit = byte & -byte
  return RIGHTMOST_BIT_POSITION[rightmostBit] as BitPosition;
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

export const getTotalBitCapacity = (memory: BitMemory): number => memory.length * MAX_BIT_COUNT

export const memoryToHex = (memory: BitMemory): string =>
  Array.from(memory)
    .map(byte => byte.toString(HEX_BASE).padStart(2, "0"))
    .join(" ")

export const memoryToBinary = (memory: BitMemory): string =>
  Array.from(memory)
    .map(byte => byte.toString(BINARY_BASE).padStart(8, "0"))
    .join(" ")

// Validation functions
export const isValidBitPosition = (position: number): position is BitPosition =>
  Number.isInteger(position) && isInBitRange(position)

export const isValidAddress = (memory: BitMemory, address: number): boolean =>
  Number.isInteger(address) && address >= 0 && address < memory.length

export const isValidBit = (value: unknown): value is Bit =>
  value === 0 || value === 1
