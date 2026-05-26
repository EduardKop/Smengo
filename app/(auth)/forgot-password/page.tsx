import { getDict, getLocale } from '@/lib/i18n'
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form'

export default async function ForgotPasswordPage() {
  const locale = await getLocale()
  const dict = await getDict(locale)

  return <ForgotPasswordForm t={dict.auth} />
}
