const DEFAULT_ADMIN_EMAILS = [
  'thomas.flichy@kawa.coffee',
  'brieuc@kawa.coffee',
  'jean@kawa.coffee',
]

const ADMIN_EMAILS = (process.env.KAWA_ADMIN_EMAILS
  ? process.env.KAWA_ADMIN_EMAILS.split(',')
  : DEFAULT_ADMIN_EMAILS
)
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean)

export function isKawaStaffEmail(email: string | null | undefined) {
  if (!email) return false
  return ADMIN_EMAILS.includes(email.toLowerCase())
}

const STAFF_DISPLAY_NAMES: Record<string, string> = {
  'thomas.flichy@kawa.coffee': 'Thomas Flichy',
  'brieuc@kawa.coffee': 'Brieuc',
  'jean@kawa.coffee': 'Jean',
}

export function getStaffDisplayName(email: string | null | undefined) {
  if (!email) return 'Admin'
  return STAFF_DISPLAY_NAMES[email.toLowerCase()] ?? email
}
