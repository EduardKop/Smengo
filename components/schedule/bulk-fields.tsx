'use client'

/**
 * Кастомные поля модалки массового добавления сотрудников:
 *  • CustomSelect — красивый выпадающий список (портал в body, чтобы не резался
 *    overflow модалки; стиль .smengo-pop как у остальных поповеров).
 *  • PositionInput — инпут должности с подсказками-плажками уже введённых /
 *    существующих должностей: ткнул — заполнилось.
 */

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from 'react'
import { createPortal } from 'react-dom'
import { Check, ChevronDown } from 'lucide-react'

/** Якорит портал-меню под триггером (fixed), закрывает по клику вне / Esc / скроллу */
function useAnchoredMenu(open: boolean, setOpen: (v: boolean) => void, triggerRef: React.RefObject<HTMLElement | null>) {
  const menuRef = useRef<HTMLDivElement>(null)
  const [style, setStyle] = useState<CSSProperties>({})

  useLayoutEffect(() => {
    if (!open) return
    const el = triggerRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const spaceBelow = window.innerHeight - r.bottom
    const openUp = spaceBelow < 240 && r.top > spaceBelow
    setStyle({
      position: 'fixed',
      left: r.left,
      minWidth: r.width,
      zIndex: 70,
      ...(openUp ? { bottom: window.innerHeight - r.top + 4 } : { top: r.bottom + 4 }),
    })
  }, [open, triggerRef])

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (triggerRef.current?.contains(e.target as Node)) return
      if (menuRef.current?.contains(e.target as Node)) return
      setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    const onScroll = () => setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', onScroll)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('resize', onScroll)
    }
  }, [open, setOpen, triggerRef])

  return { menuRef, style }
}

export interface SelectOption {
  value: string
  label: string
}

const triggerClass =
  'flex w-full cursor-pointer items-center justify-between gap-1 rounded-xl border border-border bg-[var(--surface)] px-3 py-2 text-left text-sm text-foreground outline-none transition-colors hover:border-foreground/25 focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/20'

export function CustomSelect({
  value,
  options,
  onChange,
  ariaLabel,
}: {
  value: string
  options: SelectOption[]
  onChange: (value: string) => void
  ariaLabel?: string
}) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const { menuRef, style } = useAnchoredMenu(open, setOpen, triggerRef)
  const selected = options.find((o) => o.value === value)

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((v) => !v)}
        className={triggerClass}
      >
        <span className={`min-w-0 truncate ${selected ? '' : 'text-muted-foreground'}`}>
          {selected ? selected.label : options[0]?.label}
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open &&
        createPortal(
          <div ref={menuRef} style={style} className="smengo-pop max-h-64 w-max overflow-y-auto p-1.5 text-[13px]">
            {options.map((o) => {
              const active = o.value === value
              return (
                <button
                  key={o.value}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    onChange(o.value)
                    setOpen(false)
                  }}
                  className="smengo-pop-item justify-between gap-3"
                  style={active ? { color: 'var(--accent)', fontWeight: 600 } : undefined}
                >
                  <span className="min-w-0 truncate">{o.label}</span>
                  {active && <Check className="h-3.5 w-3.5 shrink-0" />}
                </button>
              )
            })}
          </div>,
          document.body,
        )}
    </>
  )
}

export function PositionInput({
  value,
  onChange,
  suggestions,
  placeholder,
}: {
  value: string
  onChange: (value: string) => void
  /** Пул уже существующих/введённых должностей */
  suggestions: string[]
  placeholder?: string
}) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const { menuRef, style } = useAnchoredMenu(open, setOpen, wrapRef)

  const q = value.trim().toLowerCase()
  const filtered = suggestions
    .filter((s) => s && s.toLowerCase() !== q && (!q || s.toLowerCase().includes(q)))
    .slice(0, 8)
  const showMenu = open && filtered.length > 0

  return (
    <div ref={wrapRef} className="w-full">
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        maxLength={80}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setOpen(true)}
        className="w-full rounded-xl border border-border bg-[var(--surface)] px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-accent focus:ring-2 focus:ring-accent/20"
      />
      {showMenu &&
        createPortal(
          <div ref={menuRef} style={style} className="smengo-pop flex max-w-xs flex-wrap gap-1.5 p-2">
            {filtered.map((s) => (
              <button
                key={s}
                type="button"
                onMouseDown={(e) => {
                  // mousedown (до blur), чтобы клик успел заполнить инпут
                  e.preventDefault()
                  onChange(s)
                  setOpen(false)
                }}
                className="cursor-pointer rounded-full border border-border bg-[var(--surface)] px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:border-accent hover:bg-accent-soft hover:text-accent"
              >
                {s}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </div>
  )
}
