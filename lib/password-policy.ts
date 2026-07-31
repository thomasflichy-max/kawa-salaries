// PCI-DSS SAQ A requirement 8.3.6 (mandatory since 2025-03-31): passwords
// must be at least 12 characters and mix letters and digits. Enforced here
// server-side since HTML's `minLength` is only a UX hint, not a boundary.
export const PASSWORD_MIN_LENGTH = 12

export function validatePassword(password: string): string | null {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Le mot de passe doit contenir au moins ${PASSWORD_MIN_LENGTH} caractères.`
  }
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return 'Le mot de passe doit contenir à la fois des lettres et des chiffres.'
  }
  return null
}
