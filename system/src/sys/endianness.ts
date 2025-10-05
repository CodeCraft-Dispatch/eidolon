import { type BitMemory, type ByteAddress, setByte, getByte } from './binary'

export type Endianness = 'little' | 'big'
export type MultiByteValue = number | bigint

// System endianness detection
export const getSystemEndianness = (): Endianness => {
  const buffer = new ArrayBuffer(2)
  const view16 = new Uint16Array(buffer)
  const view8 = new Uint8Array(buffer)
  
  view16[0] = 0x0102
  return view8[0] === 0x01 ? 'big' : 'little'
}

// Convenience functions for endianness checking
export const isLittleEndian = (): boolean => getSystemEndianness() === 'little'
export const isBigEndian = (): boolean => getSystemEndianness() === 'big'

// Pure functions for byte swapping
export const swapBytes16 = (value: number): number =>
  ((value & 0xFF) << 8) | ((value >> 8) & 0xFF)

export const swapBytes32 = (value: number): number => {
  // Convert to unsigned 32-bit for consistent bit operations
  const unsigned = value >>> 0
  return (
    ((unsigned & 0xFF) << 24) |
    (((unsigned >> 8) & 0xFF) << 16) |
    (((unsigned >> 16) & 0xFF) << 8) |
    ((unsigned >> 24) & 0xFF)
  ) >>> 0 // Ensure unsigned result
}

export const swapBytes64 = (value: bigint): bigint => {
  const bytes = new Array(8)
  
  // Extract bytes from bigint
  for (let i = 0; i < 8; i++) {
    bytes[i] = Number((value >> BigInt(i * 8)) & 0xFFn)
  }
  
  // Reverse byte order
  bytes.reverse()
  
  // Reconstruct bigint
  let result = 0n
  for (let i = 0; i < 8; i++) {
    result |= BigInt(bytes[i]) << BigInt(i * 8)
  }
  
  return result
}

// Generic endianness conversion
export const convertEndianness = (
  value: MultiByteValue,
  fromEndian: Endianness,
  toEndian: Endianness,
  byteSize: 2 | 4 | 8
): MultiByteValue => {
  if (fromEndian === toEndian) return value
  
  switch (byteSize) {
    case 2:
      return swapBytes16(value as number)
    case 4:
      return swapBytes32(value as number)
    case 8:
      return swapBytes64(value as bigint)
    default:
      throw new Error(`Unsupported byte size: ${byteSize}`)
  }
}

// Bounds checking helpers
const checkBounds = (memory: BitMemory, address: ByteAddress, size: number, operation: string): void => {
  // Handle negative addresses explicitly
  if (address < 0) {
    throw new Error(`Address ${address} out of bounds for ${size * 8}-bit ${operation}`)
  }
  
  // Truncate fractional addresses to integer for bounds checking
  const truncatedAddress = Math.floor(address)
  if (truncatedAddress + size - 1 >= memory.length) {
    throw new Error(`Address ${truncatedAddress} out of bounds for ${size * 8}-bit ${operation}`)
  }
}

// 16-bit signed integer operations
export const writeInt16 = (
  memory: BitMemory,
  address: ByteAddress,
  value: number,
  endianness: Endianness = getSystemEndianness()
): BitMemory => {
  checkBounds(memory, address, 2, 'write')
  
  // Convert to 16-bit signed representation
  const signedValue = value < 0 ? (0x10000 + value) : value
  const byte0 = signedValue & 0xFF
  const byte1 = (signedValue >> 8) & 0xFF
  
  if (endianness === 'little') {
    return setByte(setByte(memory, address, byte0), address + 1, byte1)
  } else {
    return setByte(setByte(memory, address, byte1), address + 1, byte0)
  }
}

export const readInt16 = (
  memory: BitMemory,
  address: ByteAddress,
  endianness: Endianness = getSystemEndianness()
): number => {
  checkBounds(memory, address, 2, 'read')
  
  const byte0 = getByte(memory, address)
  const byte1 = getByte(memory, address + 1)
  
  const value = endianness === 'little'
    ? byte0 | (byte1 << 8)
    : (byte0 << 8) | byte1
    
  // Convert from unsigned to signed 16-bit
  return value > 0x7FFF ? value - 0x10000 : value
}

// 16-bit unsigned integer operations
export const writeUint16 = (
  memory: BitMemory,
  address: ByteAddress,
  value: number,
  endianness: Endianness = getSystemEndianness()
): BitMemory => {
  checkBounds(memory, address, 2, 'write')
  
  const byte0 = value & 0xFF
  const byte1 = (value >> 8) & 0xFF
  
  if (endianness === 'little') {
    return setByte(setByte(memory, address, byte0), address + 1, byte1)
  } else {
    return setByte(setByte(memory, address, byte1), address + 1, byte0)
  }
}

export const readUint16 = (
  memory: BitMemory,
  address: ByteAddress,
  endianness: Endianness = getSystemEndianness()
): number => {
  checkBounds(memory, address, 2, 'read')
  
  const byte0 = getByte(memory, address)
  const byte1 = getByte(memory, address + 1)
  
  return endianness === 'little'
    ? byte0 | (byte1 << 8)
    : (byte0 << 8) | byte1
}

// 32-bit signed integer operations
export const writeInt32 = (
  memory: BitMemory,
  address: ByteAddress,
  value: number,
  endianness: Endianness = getSystemEndianness()
): BitMemory => {
  checkBounds(memory, address, 4, 'write')
  
  // Convert to 32-bit unsigned representation for byte extraction
  const unsignedValue = value >>> 0
  const byte0 = unsignedValue & 0xFF
  const byte1 = (unsignedValue >> 8) & 0xFF
  const byte2 = (unsignedValue >> 16) & 0xFF
  const byte3 = (unsignedValue >> 24) & 0xFF
  
  if (endianness === 'little') {
    return setByte(
      setByte(
        setByte(
          setByte(memory, address, byte0),
          address + 1, byte1
        ),
        address + 2, byte2
      ),
      address + 3, byte3
    )
  } else {
    return setByte(
      setByte(
        setByte(
          setByte(memory, address, byte3),
          address + 1, byte2
        ),
        address + 2, byte1
      ),
      address + 3, byte0
    )
  }
}

export const readInt32 = (
  memory: BitMemory,
  address: ByteAddress,
  endianness: Endianness = getSystemEndianness()
): number => {
  checkBounds(memory, address, 4, 'read')
  
  const byte0 = getByte(memory, address)
  const byte1 = getByte(memory, address + 1)
  const byte2 = getByte(memory, address + 2)
  const byte3 = getByte(memory, address + 3)
  
  const value = endianness === 'little'
    ? byte0 | (byte1 << 8) | (byte2 << 16) | (byte3 << 24)
    : (byte0 << 24) | (byte1 << 16) | (byte2 << 8) | byte3
    
  // Convert from unsigned to signed 32-bit
  return value | 0
}

// 32-bit unsigned integer operations
export const writeUint32 = (
  memory: BitMemory,
  address: ByteAddress,
  value: number,
  endianness: Endianness = getSystemEndianness()
): BitMemory => {
  checkBounds(memory, address, 4, 'write')
  
  const unsignedValue = value >>> 0
  const byte0 = unsignedValue & 0xFF
  const byte1 = (unsignedValue >> 8) & 0xFF
  const byte2 = (unsignedValue >> 16) & 0xFF
  const byte3 = (unsignedValue >> 24) & 0xFF
  
  if (endianness === 'little') {
    return setByte(
      setByte(
        setByte(
          setByte(memory, address, byte0),
          address + 1, byte1
        ),
        address + 2, byte2
      ),
      address + 3, byte3
    )
  } else {
    return setByte(
      setByte(
        setByte(
          setByte(memory, address, byte3),
          address + 1, byte2
        ),
        address + 2, byte1
      ),
      address + 3, byte0
    )
  }
}

export const readUint32 = (
  memory: BitMemory,
  address: ByteAddress,
  endianness: Endianness = getSystemEndianness()
): number => {
  checkBounds(memory, address, 4, 'read')
  
  const byte0 = getByte(memory, address)
  const byte1 = getByte(memory, address + 1)
  const byte2 = getByte(memory, address + 2)
  const byte3 = getByte(memory, address + 3)
  
  const value = endianness === 'little'
    ? byte0 | (byte1 << 8) | (byte2 << 16) | (byte3 << 24)
    : (byte0 << 24) | (byte1 << 16) | (byte2 << 8) | byte3
    
  return value >>> 0 // Ensure unsigned
}

// 64-bit integer operations
export const writeInt64 = (
  memory: BitMemory,
  address: ByteAddress,
  value: bigint,
  endianness: Endianness = getSystemEndianness()
): BitMemory => {
  checkBounds(memory, address, 8, 'write')
  
  // Convert negative values to unsigned representation (two's complement)
  let unsignedValue = value
  if (value < 0n) {
    unsignedValue = (1n << 64n) + value
  }
  
  const bytes: number[] = []
  for (let i = 0; i < 8; i++) {
    bytes.push(Number((unsignedValue >> BigInt(i * 8)) & 0xFFn))
  }
  
  let result = memory
  if (endianness === 'little') {
    for (let i = 0; i < 8; i++) {
      result = setByte(result, address + i, bytes[i])
    }
  } else {
    for (let i = 0; i < 8; i++) {
      result = setByte(result, address + i, bytes[7 - i])
    }
  }
  
  return result
}

export const readInt64 = (
  memory: BitMemory,
  address: ByteAddress,
  endianness: Endianness = getSystemEndianness()
): bigint => {
  checkBounds(memory, address, 8, 'read')
  
  const bytes: number[] = []
  for (let i = 0; i < 8; i++) {
    bytes.push(getByte(memory, address + i))
  }
  
  let result = 0n
  if (endianness === 'little') {
    for (let i = 0; i < 8; i++) {
      result |= BigInt(bytes[i]) << BigInt(i * 8)
    }
  } else {
    for (let i = 0; i < 8; i++) {
      result |= BigInt(bytes[i]) << BigInt((7 - i) * 8)
    }
  }
  
  // Convert from unsigned to signed 64-bit using two's complement
  const maxSignedValue = (1n << 63n) - 1n
  if (result > maxSignedValue) {
    result = result - (1n << 64n)
  }
  
  return result
}

// 64-bit unsigned integer operations (alias for consistency)
export const writeUint64 = writeInt64
export const readUint64 = (
  memory: BitMemory,
  address: ByteAddress,
  endianness: Endianness = getSystemEndianness()
): bigint => {
  // For unsigned, we can use the signed read but ensure positive result
  const result = readInt64(memory, address, endianness)
  return result < 0n ? result + (1n << 64n) : result
}

// 32-bit float operations
export const writeFloat32 = (
  memory: BitMemory,
  address: ByteAddress,
  value: number,
  endianness: Endianness = getSystemEndianness()
): BitMemory => {
  checkBounds(memory, address, 4, 'write')
  
  const buffer = new ArrayBuffer(4)
  const floatView = new Float32Array(buffer)
  const byteView = new Uint8Array(buffer)
  
  floatView[0] = value
  
  if (endianness === 'little') {
    return setByte(
      setByte(
        setByte(
          setByte(memory, address, byteView[0]),
          address + 1, byteView[1]
        ),
        address + 2, byteView[2]
      ),
      address + 3, byteView[3]
    )
  } else {
    return setByte(
      setByte(
        setByte(
          setByte(memory, address, byteView[3]),
          address + 1, byteView[2]
        ),
        address + 2, byteView[1]
      ),
      address + 3, byteView[0]
    )
  }
}

export const readFloat32 = (
  memory: BitMemory,
  address: ByteAddress,
  endianness: Endianness = getSystemEndianness()
): number => {
  checkBounds(memory, address, 4, 'read')
  
  const buffer = new ArrayBuffer(4)
  const byteView = new Uint8Array(buffer)
  const floatView = new Float32Array(buffer)
  
  if (endianness === 'little') {
    byteView[0] = getByte(memory, address)
    byteView[1] = getByte(memory, address + 1)
    byteView[2] = getByte(memory, address + 2)
    byteView[3] = getByte(memory, address + 3)
  } else {
    byteView[3] = getByte(memory, address)
    byteView[2] = getByte(memory, address + 1)
    byteView[1] = getByte(memory, address + 2)
    byteView[0] = getByte(memory, address + 3)
  }
  
  return floatView[0]
}

// 64-bit float operations
export const writeFloat64 = (
  memory: BitMemory,
  address: ByteAddress,
  value: number,
  endianness: Endianness = getSystemEndianness()
): BitMemory => {
  checkBounds(memory, address, 8, 'write')
  
  const buffer = new ArrayBuffer(8)
  const floatView = new Float64Array(buffer)
  const byteView = new Uint8Array(buffer)
  
  floatView[0] = value
  
  let result = memory
  if (endianness === 'little') {
    for (let i = 0; i < 8; i++) {
      result = setByte(result, address + i, byteView[i])
    }
  } else {
    for (let i = 0; i < 8; i++) {
      result = setByte(result, address + i, byteView[7 - i])
    }
  }
  
  return result
}

export const readFloat64 = (
  memory: BitMemory,
  address: ByteAddress,
  endianness: Endianness = getSystemEndianness()
): number => {
  checkBounds(memory, address, 8, 'read')
  
  const buffer = new ArrayBuffer(8)
  const byteView = new Uint8Array(buffer)
  const floatView = new Float64Array(buffer)
  
  if (endianness === 'little') {
    for (let i = 0; i < 8; i++) {
      byteView[i] = getByte(memory, address + i)
    }
  } else {
    for (let i = 0; i < 8; i++) {
      byteView[7 - i] = getByte(memory, address + i)
    }
  }
  
  return floatView[0]
}