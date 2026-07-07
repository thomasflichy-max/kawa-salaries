const ADMIN_EMAIL_DOMAIN = (
  process.env.KAWA_ADMIN_EMAIL_DOMAIN ?? 'kawa.coffee'
).toLowerCase()

export function isKawaStaffEmail(email: string | null | undefined) {
  return email?.toLowerCase().endsWith(`@${ADMIN_EMAIL_DOMAIN}`) ?? false
}
