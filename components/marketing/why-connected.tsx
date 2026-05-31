interface Props {
  title: string
  subtitle: string
  oldWay: string
  oldTitle: string
  old1: string
  old2: string
  old3: string
  oldImgAlt: string
  newWay: string
  newTitle: string
  new1: string
  new2: string
  new3: string
  newImgAlt: string
  locale: string
}

function XIcon() {
  return (
    <span
      aria-hidden
      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
      style={{ background: '#1f1e1c' }}
    >
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <path d="M2 2l6 6M8 2l-6 6" stroke="#f5f3ef" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </span>
  )
}

function CheckIcon() {
  return (
    <span
      aria-hidden
      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
      style={{ background: '#e0a96d' }}
    >
      <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
        <path d="M1 4l3 3.5L10 1" stroke="#1f1e1c" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  )
}

const LEFT_IMAGE: Record<string, string> = {
  ru: '/before-left-ru.png',
  uk: '/before-left-uk.png',
  en: '/before-left-en.png',
}

const RIGHT_IMAGE: Record<string, string> = {
  ru: '/before-right-ru.png',
  uk: '/before-right-uk.png',
  en: '/before-right-en.png',
}

export function WhyConnected({
  title, subtitle,
  oldWay, oldTitle, old1, old2, old3, oldImgAlt,
  newWay, newTitle, new1, new2, new3, newImgAlt,
  locale,
}: Props) {
  const leftImg  = LEFT_IMAGE[locale]  ?? LEFT_IMAGE.ru
  const rightImg = RIGHT_IMAGE[locale] ?? RIGHT_IMAGE.ru

  return (
    <section className="bg-background px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-[1100px]">

        {/* Header */}
        <div className="mb-12 text-center">
          <h2
            className="mx-auto font-serif font-semibold text-foreground"
            style={{
              fontSize: 'clamp(28px, 3.4vw, 42px)',
              letterSpacing: '-0.02em',
              lineHeight: 1.18,
              maxWidth: 720,
            }}
          >
            {title}
          </h2>
          <p
            className="mx-auto mt-4 text-muted-foreground"
            style={{ maxWidth: 660, fontSize: 'clamp(15px, 1.5vw, 17px)', lineHeight: 1.6 }}
          >
            {subtitle}
          </p>
        </div>

        {/* Two cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

          {/* ── Left card: old way ── */}
          <div
            className="flex flex-col overflow-hidden rounded-3xl p-8 sm:p-10"
            style={{ background: '#eae6df' }}
          >
            {/* Eyebrow */}
            <p
              className="mb-4"
              style={{
                color: '#1f1e1c',
                fontFamily: 'var(--font-handwriting, cursive)',
                fontSize: 'clamp(22px, 2.2vw, 28px)',
                fontWeight: 700,
                lineHeight: 1,
              }}
            >
              {oldWay}
            </p>

            {/* Title */}
            <h3
              className="mb-6 font-sans font-bold"
              style={{ fontSize: 'clamp(20px, 2vw, 26px)', letterSpacing: '-0.02em', color: '#1f1e1c', lineHeight: 1.2 }}
            >
              {oldTitle}
            </h3>

            {/* List */}
            <ul className="mb-8 flex flex-col gap-4" role="list">
              {[old1, old2, old3].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <XIcon />
                  <span className="text-base leading-snug" style={{ color: '#1f1e1c' }}>{item}</span>
                </li>
              ))}
            </ul>

            {/* ── LEFT IMAGE (locale-specific) ── */}
            <div className="-mx-7 -mb-7 mt-auto overflow-hidden rounded-2xl sm:-mx-9 sm:-mb-9">
              <img
                src={leftImg}
                alt={oldImgAlt}
                className="h-auto w-full object-cover"
              />
            </div>
          </div>

          {/* ── Right card: with Smengo ── */}
          <div
            className="flex flex-col overflow-hidden rounded-3xl p-8 sm:p-10"
            style={{ background: '#1f1e1c' }}
          >
            {/* Eyebrow */}
            <p
              className="mb-4"
              style={{
                color: '#f5f3ef',
                fontFamily: 'var(--font-handwriting, cursive)',
                fontSize: 'clamp(22px, 2.2vw, 28px)',
                fontWeight: 700,
                lineHeight: 1,
              }}
            >
              {newWay}
            </p>

            {/* Title */}
            <h3
              className="mb-6 font-sans font-bold"
              style={{ fontSize: 'clamp(20px, 2vw, 26px)', letterSpacing: '-0.02em', color: '#f5f3ef', lineHeight: 1.2 }}
            >
              {newTitle}
            </h3>

            {/* List */}
            <ul className="mb-8 flex flex-col gap-4" role="list">
              {[new1, new2, new3].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckIcon />
                  <span className="text-base leading-snug" style={{ color: '#f5f3ef' }}>{item}</span>
                </li>
              ))}
            </ul>

            {/* ── RIGHT IMAGE (locale-specific) ── */}
            <div className="-mx-7 -mb-7 mt-auto overflow-hidden rounded-2xl sm:-mx-9 sm:-mb-9">
              <img
                src={rightImg}
                alt={newImgAlt}
                className="h-auto w-full object-cover"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
