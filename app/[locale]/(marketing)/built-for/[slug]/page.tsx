import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { routing, type Locale } from '@/i18n/routing'
import {
  RestaurantIcon, RetailIcon, ServicesIcon, ClinicIcon, LogisticsIcon,
  ProductionIcon, SalesIcon, ITIcon, ArbitrageIcon,
  type IndustrySlug,
} from '@/components/marketing/built-for-icons'

export const revalidate = 3600

const VALID_SLUGS: IndustrySlug[] = [
  'restaurants', 'retail', 'services', 'clinics',
  'logistics', 'production', 'sales', 'it', 'arbitrage',
]

const ICON_FOR: Record<IndustrySlug, (p: { size?: number }) => React.ReactElement> = {
  restaurants: RestaurantIcon,
  retail: RetailIcon,
  services: ServicesIcon,
  clinics: ClinicIcon,
  logistics: LogisticsIcon,
  production: ProductionIcon,
  sales: SalesIcon,
  it: ITIcon,
  arbitrage: ArbitrageIcon,
}

export async function generateStaticParams() {
  const params: { locale: Locale; slug: IndustrySlug }[] = []
  for (const locale of routing.locales) {
    for (const slug of VALID_SLUGS) params.push({ locale, slug })
  }
  return params
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  if (!VALID_SLUGS.includes(slug as IndustrySlug)) return {}
  const t = await getTranslations({ locale, namespace: 'marketing.builtFor' })
  return {
    title: `Smengo · ${t(`items.${slug}` as Parameters<typeof t>[0])}`,
  }
}

export default async function BuiltForPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>
}) {
  const { locale, slug } = await params
  if (!VALID_SLUGS.includes(slug as IndustrySlug)) notFound()
  setRequestLocale(locale)

  const t = await getTranslations({ locale, namespace: 'marketing.builtFor' })
  const label = t(`items.${slug}` as Parameters<typeof t>[0])
  const Icon = ICON_FOR[slug as IndustrySlug]

  // Only restaurants has full content for now
  if (slug !== 'restaurants') {
    return <ComingSoonPage label={label} Icon={Icon} />
  }

  return <RestaurantsPage label={label} Icon={Icon} />
}

// ──────────────────────────────────────────────────────────────────────
// Coming-soon placeholder for non-restaurants pages
// ──────────────────────────────────────────────────────────────────────
function ComingSoonPage({ label, Icon }: { label: string; Icon: (p: { size?: number }) => React.ReactElement }) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-32 text-center">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/60">
        <Icon size={40} />
      </div>
      <h1 className="font-serif text-4xl font-semibold tracking-tight text-foreground">
        {label}
      </h1>
      <p className="mt-4 text-muted-foreground">
        {/* TODO: нужен контент — короткое промо-описание сегмента (1–2 предложения) для placeholder-страниц,
            пока готовим полноценный лендинг отрасли. */}
        Страница для этой отрасли в разработке. Smengo уже отлично работает для таких команд — напишите нам, чтобы получить персональную демонстрацию.
      </p>
      <div className="mt-8">
        <Link
          href="/register"
          className="inline-flex items-center rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-[var(--accent-hover)]"
        >
          Попробовать бесплатно
        </Link>
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────────────────────────────
// RESTAURANTS — full page (6 blocks)
// ──────────────────────────────────────────────────────────────────────
function RestaurantsPage({ label, Icon }: { label: string; Icon: (p: { size?: number }) => React.ReactElement }) {
  return (
    <div className="bg-background">
      {/* ── Block 1: Hero with live demo ───────────────────────────── */}
      <section className="px-4 pb-16 pt-20 sm:px-6 sm:pt-24">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          <div>
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted/60">
                <Icon size={26} />
              </span>
              <p className="text-[13px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                График смен для кафе и ресторанов
              </p>
            </div>

            <h1
              className="font-serif font-semibold text-foreground"
              style={{ fontSize: 'clamp(36px, 5vw, 56px)', letterSpacing: '-0.02em', lineHeight: 1.05 }}
            >
              {label}: график без хаоса <br className="hidden sm:block" />
              и закрытые смены вовремя
            </h1>

            <p className="mt-5 max-w-xl text-[17px] text-muted-foreground" style={{ lineHeight: 1.55 }}>
              Перестаньте сводить графики в Excel и переписываться в чатах. Видите весь месяц команды,
              ловите дыры в покрытии до того, как они превратятся в пустой зал.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                href="/register"
                className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-[var(--accent-hover)]"
              >
                Начать бесплатно
              </Link>
              <Link
                href="/pricing"
                className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:bg-muted/60"
              >
                Посмотреть тарифы
              </Link>
              <span className="text-sm text-muted-foreground">14 дней, без карты</span>
            </div>
          </div>

          {/* Live demo placeholder */}
          <div className="relative overflow-hidden rounded-3xl border border-border bg-muted/30 p-6 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.25)]">
            {/* TODO: нужен контент — интерактивная мини-демка графика для ресторанной команды
                (примерный состав: 5–7 сотрудников, 7 дней, статусы «в смене / выходной / отпуск»).
                Пока ставим картинку-заглушку. */}
            <div className="flex aspect-[4/3] items-center justify-center rounded-2xl border border-dashed border-border bg-background/60 text-sm text-muted-foreground">
              Здесь будет интерактивная демка графика смен —<br />нужен контент: компонент GridPreview для отрасли.
            </div>
          </div>
        </div>
      </section>

      {/* ── Block 2: Pain → Solution (3 pairs) ─────────────────────── */}
      <section className="px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 max-w-2xl">
            <h2
              className="font-serif font-semibold text-foreground"
              style={{ fontSize: 'clamp(28px, 3.4vw, 40px)', letterSpacing: '-0.02em', lineHeight: 1.15 }}
            >
              Знакомые сцены. Решаются за минуту.
            </h2>
            <p className="mt-3 text-muted-foreground">
              Не абстрактные галочки — конкретные ситуации, в которых живут менеджеры кафе и ресторанов.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
            {[
              {
                pain: 'Официант не вышел в пятницу вечером — узнаёте за час до открытия.',
                fix: 'Видите дыру в покрытии заранее: алерт срабатывает, как только смена становится «тонкой».',
              },
              {
                pain: 'Каждое изменение графика — обзвон, переписки в трёх чатах и пересылка таблицы.',
                fix: 'Меняете смену в один клик. Сотрудник получает уведомление, команда видит актуальную версию.',
              },
              {
                pain: 'В выходные дни — то перебор смен и переплата, то нехватка и хаос на кухне.',
                fix: 'Smengo показывает покрытие по позициям: «Кухня · Сб — 2 слота свободны». Решаете заранее, а не в моменте.',
              },
            ].map((pair, i) => (
              <div key={i} className="rounded-2xl border border-border bg-background p-6">
                <p className="text-[13px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                  Боль
                </p>
                <p className="mt-2 text-foreground">{pair.pain}</p>
                <div className="my-5 h-px bg-border" />
                <p className="text-[13px] font-semibold uppercase tracking-[0.06em]" style={{ color: 'var(--accent)' }}>
                  Со Smengo
                </p>
                <p className="mt-2 text-foreground">{pair.fix}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Block 3: 3 steps to start ──────────────────────────────── */}
      <section className="bg-muted/30 px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2
              className="mx-auto font-serif font-semibold text-foreground"
              style={{ fontSize: 'clamp(28px, 3.4vw, 38px)', letterSpacing: '-0.02em', maxWidth: 520, lineHeight: 1.18 }}
            >
              Запуститесь за 3 шага. Без обучения.
            </h2>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {[
              { n: 1, title: 'Зарегистрируйтесь', desc: 'Email и название заведения. Без карты, без долгих форм.' },
              { n: 2, title: 'Импортируйте команду', desc: 'CSV или вручную: 30 сотрудников добавляются за 5 минут.' },
              { n: 3, title: 'Опубликуйте график', desc: 'Сотрудники получают уведомление в Telegram или на email — все знают свои смены.' },
            ].map((s) => (
              <div key={s.n} className="flex flex-col items-start gap-4">
                <div
                  className="flex items-center justify-center rounded-full text-[15px] font-semibold"
                  style={{ width: 34, height: 34, background: 'var(--accent-soft)', color: 'var(--accent)' }}
                >
                  {s.n}
                </div>
                <div>
                  <h3 className="font-sans text-lg font-semibold text-foreground">{s.title}</h3>
                  <p className="mt-1.5 text-[15px] text-muted-foreground" style={{ lineHeight: 1.55 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Block 4: ROI / money benefit ──────────────────────────── */}
      <section className="px-4 py-20 sm:px-6">
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h2
              className="font-serif font-semibold text-foreground"
              style={{ fontSize: 'clamp(28px, 3.4vw, 40px)', letterSpacing: '-0.02em', lineHeight: 1.15 }}
            >
              Не переплачивайте за лишние смены. <br className="hidden sm:block" />
              Не теряйте выручку на недоукомплектованных.
            </h2>
            <p className="mt-4 max-w-xl text-muted-foreground">
              Smengo показывает покрытие по позициям и по часам — видно, где смена «провисает», а где
              ставите двух человек туда, где хватит одного.
            </p>
            <ul className="mt-6 flex flex-col gap-3 text-foreground">
              <li className="flex items-start gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: 'var(--accent)' }} />
                Среднее покрытие смены — наглядной метрикой
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: 'var(--accent)' }} />
                Сводка часов по сотруднику за период — без ручных подсчётов
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: 'var(--accent)' }} />
                Алерты по перевыполнению часов до конца месяца
              </li>
            </ul>
          </div>

          {/* Metric card */}
          <div className="rounded-3xl border border-border bg-muted/30 p-8 text-center">
            {/* TODO: нужен контент — точная цифра/метрика для CIS-рынка (например: «в среднем -12%
                переплат за смены через 1–2 месяца использования»). Сейчас стоит ориентир-заглушка. */}
            <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Среднее улучшение покрытия
            </p>
            <p className="mt-3 font-serif text-6xl font-semibold text-foreground">+18%</p>
            <p className="mt-3 text-sm text-muted-foreground">
              на основе анонимных данных пилотных команд. <br />
              Нужен контент: финальная цифра и методика расчёта.
            </p>
          </div>
        </div>
      </section>

      {/* ── Block 5: Testimonial / social proof ────────────────────── */}
      <section className="bg-muted/30 px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-4xl">
          {/* TODO: нужен контент — 1–2 реальных отзыва от владельцев кафе/ресторанов
              (имя, заведение, город, короткая цитата). Пока — текст-заглушка. */}
          <figure className="rounded-3xl border border-border bg-background p-8 sm:p-10">
            <blockquote
              className="font-serif text-foreground"
              style={{ fontSize: 'clamp(20px, 2vw, 26px)', lineHeight: 1.4, letterSpacing: '-0.01em' }}
            >
              «Раньше тратили 2 часа в неделю на составление графика — теперь 15 минут. Конфликты
              видны заранее, и мы перестали "тушить пожары" по утрам в субботу.»
            </blockquote>
            <figcaption className="mt-6 flex items-center gap-3 text-sm">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-foreground font-semibold">А</span>
              <div>
                <p className="font-medium text-foreground">Александр, управляющий</p>
                <p className="text-muted-foreground">Сеть кофеен (заглушка — нужен реальный отзыв)</p>
              </div>
            </figcaption>
          </figure>
        </div>
      </section>

      {/* ── Block 6: Final CTA ────────────────────────────────────── */}
      <section className="px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-3xl rounded-3xl border border-border bg-background p-10 text-center sm:p-14">
          <h2
            className="font-serif font-semibold text-foreground"
            style={{ fontSize: 'clamp(28px, 3.4vw, 42px)', letterSpacing: '-0.02em', lineHeight: 1.15 }}
          >
            Соберите график вашего кафе за один вечер.
          </h2>
          <p className="mt-4 text-muted-foreground">
            14 дней полного доступа. Без карты. Настройка — 5 минут.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/register"
              className="rounded-lg bg-accent px-6 py-3 text-base font-medium text-white hover:bg-[var(--accent-hover)]"
            >
              Начать бесплатно
            </Link>
            <Link
              href="/pricing"
              className="rounded-lg border border-border px-6 py-3 text-base font-medium text-foreground hover:bg-muted/60"
            >
              Посмотреть тарифы
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
