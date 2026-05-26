import { getDict, getLocale } from '@/lib/i18n'
import { LoginForm } from '@/components/auth/login-form'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams
  const locale = await getLocale()
  const dict = await getDict(locale)

  return <LoginForm t={dict.auth} urlError={params.error} />
}
