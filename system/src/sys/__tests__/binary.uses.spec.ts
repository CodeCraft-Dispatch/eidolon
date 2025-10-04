import { describe, it, expect, beforeEach } from 'vitest'
import {
  type Bit,
  type BitMemory,
  type ByteAddress,
  type BitPosition,
  createBitMemory,
  setBit,
  getBit,
  setByte,
  getByte,
  flipBit,
  setBits,
  byteToBits,
  getMemoryBits,
  setMemoryBits,
  countSetBits,
  memoryToHex
} from '../binary'

describe('binary usage scenarios', () => {
  describe('status flags and system state', () => {
    let statusMemory: BitMemory

    beforeEach(() => {
      statusMemory = createBitMemory(1) // 8 status flags
    })

    it('should manage system status flags', () => {
      // Define flag positions
      const FLAGS = {
        POWER_ON: 0 as BitPosition,
        NETWORK_CONNECTED: 1 as BitPosition,
        DATABASE_READY: 2 as BitPosition,
        CACHE_ENABLED: 3 as BitPosition,
        DEBUG_MODE: 4 as BitPosition,
        MAINTENANCE_MODE: 5 as BitPosition,
        BACKUP_RUNNING: 6 as BitPosition,
        ERROR_STATE: 7 as BitPosition
      }

      // System startup sequence
      let systemState = setBit(statusMemory, 0, FLAGS.POWER_ON, 1)
      expect(getBit(systemState, 0, FLAGS.POWER_ON)).toBe(1)

      systemState = setBit(systemState, 0, FLAGS.NETWORK_CONNECTED, 1)
      systemState = setBit(systemState, 0, FLAGS.DATABASE_READY, 1)
      systemState = setBit(systemState, 0, FLAGS.CACHE_ENABLED, 1)

      // Check if system is ready (multiple flags)
      const isSystemReady = 
        getBit(systemState, 0, FLAGS.POWER_ON) === 1 &&
        getBit(systemState, 0, FLAGS.NETWORK_CONNECTED) === 1 &&
        getBit(systemState, 0, FLAGS.DATABASE_READY) === 1

      expect(isSystemReady).toBe(true)

      // Enable debug mode
      systemState = setBit(systemState, 0, FLAGS.DEBUG_MODE, 1)
      
      // Check status byte
      const statusByte = getByte(systemState, 0)
      expect(statusByte).toBe(31) // 0b00011111 (first 5 flags set)

      // Emergency: enter maintenance mode
      systemState = setBit(systemState, 0, FLAGS.MAINTENANCE_MODE, 1)
      expect(getBit(systemState, 0, FLAGS.MAINTENANCE_MODE)).toBe(1)
    })

    it('should toggle system flags dynamically', () => {
      const FLAGS = {
        AUTO_SAVE: 0 as BitPosition,
        NOTIFICATIONS: 1 as BitPosition,
        DARK_MODE: 2 as BitPosition
      }

      // Toggle user preferences
      let preferences = statusMemory
      
      // User toggles dark mode
      preferences = flipBit(preferences, 0, FLAGS.DARK_MODE)
      expect(getBit(preferences, 0, FLAGS.DARK_MODE)).toBe(1)
      
      // Toggle again
      preferences = flipBit(preferences, 0, FLAGS.DARK_MODE)
      expect(getBit(preferences, 0, FLAGS.DARK_MODE)).toBe(0)

      // Enable multiple features at once
      const operations = [
        { address: 0 as ByteAddress, bitPosition: FLAGS.AUTO_SAVE, value: 1 as Bit },
        { address: 0 as ByteAddress, bitPosition: FLAGS.NOTIFICATIONS, value: 1 as Bit }
      ]
      preferences = setBits(preferences, operations)

      expect(getBit(preferences, 0, FLAGS.AUTO_SAVE)).toBe(1)
      expect(getBit(preferences, 0, FLAGS.NOTIFICATIONS)).toBe(1)
    })
  })

  describe('permissions and access control', () => {
    let permissionsMemory: BitMemory

    beforeEach(() => {
      permissionsMemory = createBitMemory(4) // 32 permission bits
    })

    it('should manage user permissions matrix', () => {
      // Define permission structure
      const PERMISSIONS = {
        READ_USER: { address: 0 as ByteAddress, bit: 0 as BitPosition },
        WRITE_USER: { address: 0 as ByteAddress, bit: 1 as BitPosition },
        DELETE_USER: { address: 0 as ByteAddress, bit: 2 as BitPosition },
        READ_ADMIN: { address: 0 as ByteAddress, bit: 3 as BitPosition },
        WRITE_ADMIN: { address: 0 as ByteAddress, bit: 4 as BitPosition },
        DELETE_ADMIN: { address: 0 as ByteAddress, bit: 5 as BitPosition },
        SYSTEM_CONFIG: { address: 0 as ByteAddress, bit: 6 as BitPosition },
        AUDIT_ACCESS: { address: 0 as ByteAddress, bit: 7 as BitPosition },
        
        // File operations
        READ_FILES: { address: 1 as ByteAddress, bit: 0 as BitPosition },
        WRITE_FILES: { address: 1 as ByteAddress, bit: 1 as BitPosition },
        EXECUTE_FILES: { address: 1 as ByteAddress, bit: 2 as BitPosition },
        
        // Network operations
        NETWORK_READ: { address: 2 as ByteAddress, bit: 0 as BitPosition },
        NETWORK_WRITE: { address: 2 as ByteAddress, bit: 1 as BitPosition },
        
        // Database operations
        DB_READ: { address: 3 as ByteAddress, bit: 0 as BitPosition },
        DB_WRITE: { address: 3 as ByteAddress, bit: 1 as BitPosition },
        DB_ADMIN: { address: 3 as ByteAddress, bit: 2 as BitPosition }
      }

      // Set basic user permissions
      let userPerms = permissionsMemory
      userPerms = setBit(userPerms, PERMISSIONS.READ_USER.address, PERMISSIONS.READ_USER.bit, 1)
      userPerms = setBit(userPerms, PERMISSIONS.READ_FILES.address, PERMISSIONS.READ_FILES.bit, 1)
      userPerms = setBit(userPerms, PERMISSIONS.NETWORK_READ.address, PERMISSIONS.NETWORK_READ.bit, 1)
      userPerms = setBit(userPerms, PERMISSIONS.DB_READ.address, PERMISSIONS.DB_READ.bit, 1)

      // Check if user can read
      const canRead = 
        getBit(userPerms, PERMISSIONS.READ_USER.address, PERMISSIONS.READ_USER.bit) === 1 &&
        getBit(userPerms, PERMISSIONS.READ_FILES.address, PERMISSIONS.READ_FILES.bit) === 1

      expect(canRead).toBe(true)

      // Upgrade to admin permissions
      const adminUpgrade = [
        { address: PERMISSIONS.WRITE_USER.address, bitPosition: PERMISSIONS.WRITE_USER.bit, value: 1 as Bit },
        { address: PERMISSIONS.READ_ADMIN.address, bitPosition: PERMISSIONS.READ_ADMIN.bit, value: 1 as Bit },
        { address: PERMISSIONS.WRITE_ADMIN.address, bitPosition: PERMISSIONS.WRITE_ADMIN.bit, value: 1 as Bit },
        { address: PERMISSIONS.SYSTEM_CONFIG.address, bitPosition: PERMISSIONS.SYSTEM_CONFIG.bit, value: 1 as Bit }
      ]
      
      const adminPerms = setBits(userPerms, adminUpgrade)

      // Verify admin permissions
      expect(getBit(adminPerms, PERMISSIONS.WRITE_ADMIN.address, PERMISSIONS.WRITE_ADMIN.bit)).toBe(1)
      expect(getBit(adminPerms, PERMISSIONS.SYSTEM_CONFIG.address, PERMISSIONS.SYSTEM_CONFIG.bit)).toBe(1)

      // Count total permissions
      const totalPermissions = countSetBits(adminPerms)
      expect(totalPermissions).toBeGreaterThan(4) // More than basic user
    })

    it('should implement role-based access control', () => {
      // Define roles as bit patterns
      const ROLES = {
        GUEST: [0, 0, 0, 0, 0, 0, 0, 1] as Bit[], // Minimal access
        USER: [1, 1, 0, 0, 1, 0, 0, 1] as Bit[],  // Read/write user data, read files
        MODERATOR: [1, 1, 1, 1, 1, 1, 0, 1] as Bit[], // Extended permissions
        ADMIN: [1, 1, 1, 1, 1, 1, 1, 1] as Bit[]  // Full access
      }

      // Assign user role
      let userAccess = setMemoryBits(permissionsMemory, 0, ROLES.USER)
      let userBits = getMemoryBits(userAccess, 0)
      expect(userBits).toEqual(ROLES.USER)

      // Promote to moderator
      userAccess = setMemoryBits(userAccess, 0, ROLES.MODERATOR)
      userBits = getMemoryBits(userAccess, 0)
      expect(userBits).toEqual(ROLES.MODERATOR)

      // Check specific permission
      expect(getBit(userAccess, 0, 2)).toBe(1) // Delete permission
    })
  })

  describe('data structures and algorithms', () => {
    describe('bloom filter implementation', () => {
      let bloomFilter: BitMemory
      const FILTER_SIZE = 128 // 1024 bits

      beforeEach(() => {
        bloomFilter = createBitMemory(FILTER_SIZE)
      })

      const hash1 = (item: string): number => {
        let hash = 0
        for (let i = 0; i < item.length; i++) {
          hash = (hash * 31 + item.charCodeAt(i)) % (FILTER_SIZE * 8)
        }
        return Math.abs(hash)
      }

      const hash2 = (item: string): number => {
        let hash = 0
        for (let i = 0; i < item.length; i++) {
          hash = (hash * 37 + item.charCodeAt(i)) % (FILTER_SIZE * 8)
        }
        return Math.abs(hash)
      }

      const hash3 = (item: string): number => {
        let hash = 0
        for (let i = 0; i < item.length; i++) {
          hash = (hash * 41 + item.charCodeAt(i)) % (FILTER_SIZE * 8)
        }
        return Math.abs(hash)
      }

      const addToBloomFilter = (filter: BitMemory, item: string): BitMemory => {
        const pos1 = hash1(item)
        const pos2 = hash2(item)
        const pos3 = hash3(item)

        let newFilter = setBit(filter, Math.floor(pos1 / 8), (pos1 % 8) as BitPosition, 1)
        newFilter = setBit(newFilter, Math.floor(pos2 / 8), (pos2 % 8) as BitPosition, 1)
        newFilter = setBit(newFilter, Math.floor(pos3 / 8), (pos3 % 8) as BitPosition, 1)

        return newFilter
      }

      const checkBloomFilter = (filter: BitMemory, item: string): boolean => {
        const pos1 = hash1(item)
        const pos2 = hash2(item)
        const pos3 = hash3(item)

        return getBit(filter, Math.floor(pos1 / 8), (pos1 % 8) as BitPosition) === 1 &&
               getBit(filter, Math.floor(pos2 / 8), (pos2 % 8) as BitPosition) === 1 &&
               getBit(filter, Math.floor(pos3 / 8), (pos3 % 8) as BitPosition) === 1
      }

      it('should implement a working bloom filter', () => {
        const items = ['apple', 'banana', 'cherry', 'date', 'elderberry']
        
        // Add items to bloom filter
        let filter = bloomFilter
        items.forEach(item => {
          filter = addToBloomFilter(filter, item)
        })

        // Check that all added items are detected
        items.forEach(item => {
          expect(checkBloomFilter(filter, item)).toBe(true)
        })

        // Check for items not added (may have false positives)
        const notAdded = ['grape', 'kiwi', 'mango']
        const falsePositives = notAdded.filter(item => checkBloomFilter(filter, item))
        
        // Should have some false positives but not all
        expect(falsePositives.length).toBeLessThan(notAdded.length)
      })
    })

    describe('bit set operations', () => {
      let setA: BitMemory
      let setB: BitMemory

      beforeEach(() => {
        setA = createBitMemory(8) // 64-element bit set
        setB = createBitMemory(8)
      })

      const addToSet = (set: BitMemory, element: number): BitMemory => {
        if (element < 0 || element >= 64) throw new Error('Element out of range')
        const address = Math.floor(element / 8)
        const bitPos = element % 8
        return setBit(set, address, bitPos as BitPosition, 1)
      }

      const isInSet = (set: BitMemory, element: number): boolean => {
        if (element < 0 || element >= 64) return false
        const address = Math.floor(element / 8)
        const bitPos = element % 8
        return getBit(set, address, bitPos as BitPosition) === 1
      }

      const unionSets = (setA: BitMemory, setB: BitMemory): BitMemory => {
        let result = createBitMemory(8)
        for (let i = 0; i < 8; i++) {
          const byteA = getByte(setA, i)
          const byteB = getByte(setB, i)
          result = setByte(result, i, byteA | byteB)
        }
        return result
      }

      const intersectionSets = (setA: BitMemory, setB: BitMemory): BitMemory => {
        let result = createBitMemory(8)
        for (let i = 0; i < 8; i++) {
          const byteA = getByte(setA, i)
          const byteB = getByte(setB, i)
          result = setByte(result, i, byteA & byteB)
        }
        return result
      }

      it('should implement bit set operations', () => {
        // Create set A: {1, 5, 10, 15, 20}
        let testSetA = setA
        testSetA = addToSet(testSetA, 1)
        testSetA = addToSet(testSetA, 5)
        testSetA = addToSet(testSetA, 10)
        testSetA = addToSet(testSetA, 15)
        testSetA = addToSet(testSetA, 20)

        // Create set B: {5, 10, 25, 30}
        let testSetB = setB
        testSetB = addToSet(testSetB, 5)
        testSetB = addToSet(testSetB, 10)
        testSetB = addToSet(testSetB, 25)
        testSetB = addToSet(testSetB, 30)

        // Test membership
        expect(isInSet(testSetA, 1)).toBe(true)
        expect(isInSet(testSetA, 2)).toBe(false)
        expect(isInSet(testSetB, 25)).toBe(true)

        // Test union: {1, 5, 10, 15, 20, 25, 30}
        const unionSet = unionSets(testSetA, testSetB)
        expect(isInSet(unionSet, 1)).toBe(true)
        expect(isInSet(unionSet, 5)).toBe(true)
        expect(isInSet(unionSet, 25)).toBe(true)
        expect(isInSet(unionSet, 30)).toBe(true)

        // Test intersection: {5, 10}
        const intersectionSet = intersectionSets(testSetA, testSetB)
        expect(isInSet(intersectionSet, 5)).toBe(true)
        expect(isInSet(intersectionSet, 10)).toBe(true)
        expect(isInSet(intersectionSet, 1)).toBe(false)
        expect(isInSet(intersectionSet, 25)).toBe(false)

        // Count elements
        expect(countSetBits(testSetA)).toBe(5)
        expect(countSetBits(testSetB)).toBe(4)
        expect(countSetBits(intersectionSet)).toBe(2)
      })
    })
  })

  describe('protocol and packet handling', () => {
    describe('network packet flags', () => {
      let packetHeader: BitMemory

      beforeEach(() => {
        packetHeader = createBitMemory(2) // 16-bit header
      })

      it('should handle TCP-like packet flags', () => {
        // TCP-like flags in first byte
        const FLAGS = {
          FIN: 0 as BitPosition,  // Finish
          SYN: 1 as BitPosition,  // Synchronize
          RST: 2 as BitPosition,  // Reset
          PSH: 3 as BitPosition,  // Push
          ACK: 4 as BitPosition,  // Acknowledge
          URG: 5 as BitPosition,  // Urgent
          ECE: 6 as BitPosition,  // ECN Echo
          CWR: 7 as BitPosition   // Congestion Window Reduced
        }

        // Connection establishment (SYN)
        let packet = setBit(packetHeader, 0, FLAGS.SYN, 1)
        expect(getBit(packet, 0, FLAGS.SYN)).toBe(1)

        // Response (SYN + ACK)
        packet = setBit(packet, 0, FLAGS.ACK, 1)
        const isSynAck = 
          getBit(packet, 0, FLAGS.SYN) === 1 && 
          getBit(packet, 0, FLAGS.ACK) === 1
        expect(isSynAck).toBe(true)

        // Connection established (ACK only)
        packet = setBit(packet, 0, FLAGS.SYN, 0) // Clear SYN
        expect(getBit(packet, 0, FLAGS.ACK)).toBe(1)
        expect(getBit(packet, 0, FLAGS.SYN)).toBe(0)

        // Data transmission with push
        packet = setBit(packet, 0, FLAGS.PSH, 1)
        expect(getBit(packet, 0, FLAGS.PSH)).toBe(1)

        // Connection termination
        packet = setBit(packet, 0, FLAGS.FIN, 1)
        expect(getBit(packet, 0, FLAGS.FIN)).toBe(1)

        // Format packet header for debugging
        const headerByte = getByte(packet, 0)
        const flagBits = byteToBits(headerByte)
        // byteToBits now returns LSB-first, so bit position N is at index N
        expect(flagBits[FLAGS.FIN]).toBe(1)
        expect(flagBits[FLAGS.ACK]).toBe(1)
        expect(flagBits[FLAGS.PSH]).toBe(1)
      })

      it('should handle custom protocol with validation', () => {
        // Custom protocol: first 4 bits = version, next 4 bits = type
        // Second byte: 8 feature flags

        const version = 3 // Version 3 (4 bits)
        const type = 5    // Message type 5 (4 bits)

        // Set version in upper 4 bits of first byte
        let packet = packetHeader
        if (version & 8) packet = setBit(packet, 0, 7, 1)
        if (version & 4) packet = setBit(packet, 0, 6, 1)
        if (version & 2) packet = setBit(packet, 0, 5, 1)
        if (version & 1) packet = setBit(packet, 0, 4, 1)

        // Set type in lower 4 bits of first byte
        if (type & 8) packet = setBit(packet, 0, 3, 1)
        if (type & 4) packet = setBit(packet, 0, 2, 1)
        if (type & 2) packet = setBit(packet, 0, 1, 1)
        if (type & 1) packet = setBit(packet, 0, 0, 1)

        // Extract and verify
        const headerByte = getByte(packet, 0)
        const extractedVersion = (headerByte >> 4) & 0x0F
        const extractedType = headerByte & 0x0F

        expect(extractedVersion).toBe(version)
        expect(extractedType).toBe(type)

        // Set feature flags in second byte
        const FEATURES = {
          COMPRESSION: 0 as BitPosition,
          ENCRYPTION: 1 as BitPosition,
          PRIORITY: 2 as BitPosition,
          FRAGMENTED: 3 as BitPosition
        }

        packet = setBit(packet, 1, FEATURES.COMPRESSION, 1)
        packet = setBit(packet, 1, FEATURES.ENCRYPTION, 1)

        expect(getBit(packet, 1, FEATURES.COMPRESSION)).toBe(1)
        expect(getBit(packet, 1, FEATURES.ENCRYPTION)).toBe(1)
        expect(getBit(packet, 1, FEATURES.PRIORITY)).toBe(0)
      })
    })
  })

  describe('gaming and graphics', () => {
    describe('sprite collision detection', () => {
      let collisionMask: BitMemory

      beforeEach(() => {
        collisionMask = createBitMemory(8) // 8x8 sprite collision mask
      })

      it('should implement 2D collision detection', () => {
        // Create a simple sprite pattern (L-shape)
        // Row 0: 1000 0000
        // Row 1: 1000 0000  
        // Row 2: 1000 0000
        // Row 3: 1111 0000
        
        let sprite = collisionMask
        
        // Set L-shape pattern
        sprite = setBit(sprite, 0, 7, 1) // Row 0, col 0
        sprite = setBit(sprite, 1, 7, 1) // Row 1, col 0
        sprite = setBit(sprite, 2, 7, 1) // Row 2, col 0
        sprite = setBit(sprite, 3, 7, 1) // Row 3, col 0
        sprite = setBit(sprite, 3, 6, 1) // Row 3, col 1
        sprite = setBit(sprite, 3, 5, 1) // Row 3, col 2
        sprite = setBit(sprite, 3, 4, 1) // Row 3, col 3

        // Check collision points
        const hasCollisionAt = (row: number, col: number): boolean => {
          return getBit(sprite, row, (7 - col) as BitPosition) === 1
        }

        expect(hasCollisionAt(0, 0)).toBe(true)  // Top of L
        expect(hasCollisionAt(3, 0)).toBe(true)  // Bottom left of L
        expect(hasCollisionAt(3, 3)).toBe(true)  // Bottom right of L
        expect(hasCollisionAt(0, 3)).toBe(false) // Empty space
        expect(hasCollisionAt(1, 1)).toBe(false) // Empty space

        // Count collision pixels
        const collisionPixels = countSetBits(sprite)
        expect(collisionPixels).toBe(7) // L-shape has 7 pixels
      })
    })

    describe('feature flags for game state', () => {
      let gameState: BitMemory

      beforeEach(() => {
        gameState = createBitMemory(2) // 16 game state flags
      })

      it('should manage complex game state', () => {
        // Player state flags (first byte)
        const PLAYER_FLAGS = {
          ALIVE: 0 as BitPosition,
          INVULNERABLE: 1 as BitPosition,
          HAS_KEY: 2 as BitPosition,
          HAS_WEAPON: 3 as BitPosition,
          CAN_JUMP: 4 as BitPosition,
          CAN_SWIM: 5 as BitPosition,
          IS_FLYING: 6 as BitPosition,
          IS_INVISIBLE: 7 as BitPosition
        }

        // Game world flags (second byte)
        const WORLD_FLAGS = {
          DOOR_UNLOCKED: 0 as BitPosition,
          BOSS_DEFEATED: 1 as BitPosition,
          SECRET_FOUND: 2 as BitPosition,
          RAIN_ACTIVE: 3 as BitPosition,
          NIGHT_TIME: 4 as BitPosition,
          MUSIC_PLAYING: 5 as BitPosition,
          CUTSCENE_ACTIVE: 6 as BitPosition,
          PAUSED: 7 as BitPosition
        }

        // Initialize player
        let state = setBit(gameState, 0, PLAYER_FLAGS.ALIVE, 1)
        state = setBit(state, 0, PLAYER_FLAGS.CAN_JUMP, 1)

        // Player finds key and weapon
        state = setBit(state, 0, PLAYER_FLAGS.HAS_KEY, 1)
        state = setBit(state, 0, PLAYER_FLAGS.HAS_WEAPON, 1)

        // Unlock door with key
        if (getBit(state, 0, PLAYER_FLAGS.HAS_KEY) === 1) {
          state = setBit(state, 1, WORLD_FLAGS.DOOR_UNLOCKED, 1)
        }

        expect(getBit(state, 1, WORLD_FLAGS.DOOR_UNLOCKED)).toBe(1)

        // Player defeats boss
        const canDefeatBoss = 
          getBit(state, 0, PLAYER_FLAGS.ALIVE) === 1 &&
          getBit(state, 0, PLAYER_FLAGS.HAS_WEAPON) === 1

        if (canDefeatBoss) {
          state = setBit(state, 1, WORLD_FLAGS.BOSS_DEFEATED, 1)
        }

        expect(getBit(state, 1, WORLD_FLAGS.BOSS_DEFEATED)).toBe(1)

        // Environmental effects
        state = setBit(state, 1, WORLD_FLAGS.RAIN_ACTIVE, 1)
        state = setBit(state, 1, WORLD_FLAGS.NIGHT_TIME, 1)

        // Power-up: temporary invulnerability
        state = setBit(state, 0, PLAYER_FLAGS.INVULNERABLE, 1)
        // ... after timeout
        state = setBit(state, 0, PLAYER_FLAGS.INVULNERABLE, 0)

        // Save game state as hex for persistence
        const saveData = memoryToHex(state)
        expect(saveData).toMatch(/^[0-9a-f]{2} [0-9a-f]{2}$/)
      })
    })
  })

  describe('real-world integration patterns', () => {
    it('should handle configuration management', () => {
      // Application configuration flags
      const config = createBitMemory(4)
      
      // Feature flags
      let settings = setBit(config, 0, 0, 1) // Enable logging
      settings = setBit(settings, 0, 1, 1)   // Enable caching
      settings = setBit(settings, 0, 2, 0)   // Disable debug mode
      settings = setBit(settings, 0, 3, 1)   // Enable compression

      // User preference flags
      settings = setBit(settings, 1, 0, 1)   // Dark theme
      settings = setBit(settings, 1, 1, 0)   // Disable animations
      settings = setBit(settings, 1, 2, 1)   // Enable notifications

      // Performance flags
      settings = setBit(settings, 2, 0, 1)   // Enable GPU acceleration
      settings = setBit(settings, 2, 1, 0)   // Disable telemetry

      // Serialize configuration
      const configHash = memoryToHex(settings)
      expect(configHash).toHaveLength(11) // "xx xx xx xx" format

      // Validate critical settings
      const loggingEnabled = getBit(settings, 0, 0) === 1
      const debugMode = getBit(settings, 0, 2) === 1
      
      expect(loggingEnabled).toBe(true)
      expect(debugMode).toBe(false)
    })

    it('should implement circuit breaker pattern', () => {
      // Circuit breaker state using bit flags
      const circuitState = createBitMemory(1)
      
      const CIRCUIT_FLAGS = {
        CLOSED: 0 as BitPosition,      // Normal operation
        OPEN: 1 as BitPosition,        // Circuit is open (failing)
        HALF_OPEN: 2 as BitPosition,   // Testing state
        HEALTHY: 3 as BitPosition,     // Health check passed
        FAILED: 4 as BitPosition,      // Recent failure
        TIMEOUT: 5 as BitPosition,     // Request timeout
        OVERLOAD: 6 as BitPosition,    // System overload
        MANUAL: 7 as BitPosition       // Manually opened
      }

      // Initial state: closed and healthy
      let state = setBit(circuitState, 0, CIRCUIT_FLAGS.CLOSED, 1)
      state = setBit(state, 0, CIRCUIT_FLAGS.HEALTHY, 1)

      // Simulate failure
      state = setBit(state, 0, CIRCUIT_FLAGS.FAILED, 1)
      state = setBit(state, 0, CIRCUIT_FLAGS.HEALTHY, 0)

      // Open circuit due to failures
      if (getBit(state, 0, CIRCUIT_FLAGS.FAILED) === 1) {
        state = setBit(state, 0, CIRCUIT_FLAGS.CLOSED, 0)
        state = setBit(state, 0, CIRCUIT_FLAGS.OPEN, 1)
      }

      expect(getBit(state, 0, CIRCUIT_FLAGS.OPEN)).toBe(1)
      expect(getBit(state, 0, CIRCUIT_FLAGS.CLOSED)).toBe(0)

      // After timeout, try half-open
      state = setBit(state, 0, CIRCUIT_FLAGS.OPEN, 0)
      state = setBit(state, 0, CIRCUIT_FLAGS.HALF_OPEN, 1)

      // Success in half-open, close circuit
      state = setBit(state, 0, CIRCUIT_FLAGS.HALF_OPEN, 0)
      state = setBit(state, 0, CIRCUIT_FLAGS.CLOSED, 1)
      state = setBit(state, 0, CIRCUIT_FLAGS.HEALTHY, 1)
      state = setBit(state, 0, CIRCUIT_FLAGS.FAILED, 0)

      expect(getBit(state, 0, CIRCUIT_FLAGS.CLOSED)).toBe(1)
      expect(getBit(state, 0, CIRCUIT_FLAGS.HEALTHY)).toBe(1)
    })
  })
})