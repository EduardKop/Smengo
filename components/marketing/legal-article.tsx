import { getTranslations } from 'next-intl/server'

interface Props {
  namespace: 'legal.terms' | 'legal.privacy'
  sections: readonly string[]
}

export async function LegalArticle({ namespace, sections }: Props) {
  const t = await getTranslations(namespace)

  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
      <h1
        className="font-serif font-semibold text-foreground"
        style={{ fontSize: 'clamp(30px, 4vw, 42px)', letterSpacing: '-0.02em', lineHeight: 1.15 }}
      >
        {t('title')}
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">{t('updated')}</p>
      <p className="mt-8 whitespace-pre-line text-[15px] leading-[1.7] text-muted-foreground">
        {t('intro')}
      </p>
      {sections.map((key, i) => (
        <section key={key} className="mt-10">
          <h2 className="font-serif text-xl font-semibold text-foreground">
            {i + 1}. {t(`${key}Title`)}
          </h2>
          <p className="mt-3 whitespace-pre-line text-[15px] leading-[1.7] text-muted-foreground">
            {t(`${key}Body`)}
          </p>
        </section>
      ))}
    </article>
  )
}
