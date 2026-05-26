import { getDict, getLocale } from '@/lib/i18n'
import { RegisterForm } from '@/components/auth/register-form'

export default async function RegisterPage() {
  const locale = await getLocale()
  const dict = await getDict(locale)

  return <RegisterForm t={dict.auth} />
}
