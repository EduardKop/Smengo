import { getDict, getLocale } from '@/lib/i18n'
import { ResetPasswordForm } from '@/components/auth/reset-password-form'

export default async function ResetPasswordPage() {
  const locale = await getLocale()
  const dict = await getDict(locale)

  return <ResetPasswordForm t={dict.auth} />
}
