import { getTranslations } from 'next-intl/server'
import { logoutAction } from '@/lib/actions/auth'
import { LocaleSwitcher } from '@/components/locale-switcher'

export default async function DashboardPage() {
  const t = await getTranslations('nav')
  const tCommon = await getTranslations('common')

  return (
    <div className="p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">{t('dashboard')}</h1>
        <div className="flex items-center gap-3">
          <LocaleSwitcher />
          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90"
            >
              {tCommon('cancel')}
            </button>
          </form>
        </div>
      </div>
      <p className="mt-2 text-muted-foreground">
        {/* TODO: grid view goes here (Week 2+) */}
        Schedule grid coming soon.
      </p>
    </div>
  )
}
