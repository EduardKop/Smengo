// Static, server-rendered colorful schedule grid for the hero.
// No interactivity — pure presentation.

interface Props {
  weekdays: string[]
  offLabel: string
}

const ROWS = [
  { name: 'Анна П.',    role: 'Шеф',      color: '#2f9e6f',
    week: ['09–21','09–21', null, '09–21','09–21', null, null] },
  { name: 'Игорь М.',   role: 'Повар',    color: '#2f9e6f',
    week: [null,    '10–22','10–22', null,  '14–02','14–02','10–18'] },
  { name: 'Лиза К.',    role: 'Хостес',   color: '#3b6fd4',
    week: ['17–23','17–23','17–23', null,  '17–23', null,  '17–23'] },
  { name: 'Дмитрий В.', role: 'Официант', color: '#3b6fd4',
    week: ['10–18', null,  '10–18','10–18','10–18', null,  '10–18'] },
  { name: 'Алексей Р.', role: 'Бариста',  color: '#7c5cc4',
    week: ['08–16','08–16', null,  '08–16','08–16','08–16', null] },
  { name: 'Олег С.',    role: 'Бармен',   color: '#7c5cc4',
    week: ['18–02', null,  '18–02','18–02','18–02', null,  '18–02'] },
]

export function HeroGridMockup({ weekdays, offLabel }: Props) {
  return (
    <div className="relative w-full">
      {/* Soft sand glow behind */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-6 rounded-[28px] opacity-60 blur-2xl"
        style={{ background: 'radial-gradient(60% 60% at 50% 50%, rgba(224,169,109,0.40), transparent 70%)' }}
      />

      <div className="relative overflow-hidden rounded-[20px] border border-white/10 bg-[#faf4ea] shadow-[0_30px_80px_-30px_rgba(0,0,0,0.55)]">
        {/* Inner header */}
        <div className="flex items-center justify-between border-b border-black/10 bg-white px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#1f1e1c]/55">
            smengo / график · неделя 22
          </span>
          <span className="text-[11px] font-semibold text-[#2f9e6f]">● online</span>
        </div>

        {/* Grid */}
        <div className="overflow-x-auto">
          <div
            className="grid min-w-[600px] text-[11.5px]"
            style={{ gridTemplateColumns: '150px repeat(7, minmax(64px,1fr))' }}
          >
            {/* Header */}
            <div className="border-b border-black/5 bg-white px-3 py-2">&nbsp;</div>
            {weekdays.map((w, i) => {
              const weekend = i >= 5
              return (
                <div
                  key={w}
                  className={`border-b border-black/5 px-1 py-2 text-center text-[10px] font-bold uppercase tracking-wider ${
                    weekend ? 'bg-[#fff1e8] text-[#b54a14]' : 'bg-white text-[#1f1e1c]/55'
                  }`}
                >
                  {w}
                </div>
              )
            })}

            {/* Rows */}
            {ROWS.map((r, ri) => (
              <RowFrag key={ri} row={r} weekdays={weekdays} offLabel={offLabel} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function RowFrag({
  row, weekdays, offLabel,
}: {
  row: typeof ROWS[number]
  weekdays: string[]
  offLabel: string
}) {
  return (
    <>
      <div className="flex items-center gap-2.5 border-b border-black/5 bg-white px-3 py-2.5">
        <span
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
          style={{ backgroundColor: row.color }}
        >
          {row.name.charAt(0)}
        </span>
        <span className="flex flex-col leading-tight">
          <span className="text-[12px] font-semibold text-[#1f1e1c]">{row.name}</span>
          <span
            className="mt-0.5 inline-flex w-fit rounded px-1 py-px text-[9px] font-bold uppercase tracking-wider"
            style={{ backgroundColor: `${row.color}1f`, color: row.color }}
          >
            {row.role}
          </span>
        </span>
      </div>
      {row.week.map((cell, i) => {
        const weekend = i >= 5
        return (
          <div
            key={i}
            className={`border-b border-black/5 p-1 ${weekend ? 'bg-[#fff1e8]/50' : 'bg-white'}`}
          >
            {cell ? (
              <div
                className="rounded-md px-1.5 py-1 text-center text-[10px] font-bold leading-tight text-white"
                style={{ backgroundColor: row.color }}
              >
                {cell}
              </div>
            ) : (
              <div className="flex h-full min-h-[32px] items-center justify-center text-[9px] font-bold uppercase tracking-wider text-[#1f1e1c]/30">
                {offLabel}
              </div>
            )}
          </div>
        )
      })}
      {/* spacer keys unused */}
      {weekdays.length === 0 ? null : null}
    </>
  )
}
