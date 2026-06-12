interface JsonLdProps {
  /** Structured-data object; serialized to JSON and injected as ld+json. */
  data: unknown
}

/**
 * Renders a <script type="application/ld+json"> with the payload escaped so a
 * stray `</script>` (or `<`) in any value can never break out of the script
 * context. Today all our JSON-LD is server-controlled i18n content, but routing
 * every injection through one escaped helper keeps it safe if user data is ever
 * added to structured data later.
 */
export function JsonLd({ data }: JsonLdProps) {
  const json = JSON.stringify(data).replace(/</g, '\\u003c')
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
  )
}
