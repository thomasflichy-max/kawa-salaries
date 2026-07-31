import { randomBytes, createHash } from 'crypto'

const RECOVERY_CODE_COUNT = 8

function generateCode(): string {
  // 8 random bytes = 64 bits of entropy, formatted in groups of 4 hex chars
  // for readability (e.g. a1b2-c3d4-e5f6-0718).
  const raw = randomBytes(8).toString('hex')
  return raw.match(/.{1,4}/g)!.join('-')
}

export function generateRecoveryCodes(): string[] {
  return Array.from({ length: RECOVERY_CODE_COUNT }, generateCode)
}

// Applied before hashing, both at generation and at verification time, so a
// code typed back with different casing or without dashes still matches.
export function normalizeRecoveryCode(input: string): string {
  return input.trim().toLowerCase().replace(/[^a-f0-9]/g, '')
}

// A fast hash (not bcrypt/argon2) is fine here — unlike a password, this is
// a single-use, 64-bit-random, server-generated secret, not something a
// human chose, so it isn't vulnerable to a dictionary/rainbow-table attack.
export function hashRecoveryCode(code: string): string {
  return createHash('sha256').update(normalizeRecoveryCode(code)).digest('hex')
}
