import { useState } from 'react'
import { Info } from 'lucide-react'

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-xl border border-slate-200/90 bg-white shadow-xs transition-all duration-200 hover:shadow-md ${className}`}>
      {children}
    </section>
  )
}

export function MetricInfo({ text, align = 'left' }: { text: string; align?: 'left' | 'right' }) {
  const [open, setOpen] = useState(false)
  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="p-0.5 rounded-full text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
        aria-label="Information"
      >
        <Info className="h-3.5 w-3.5" />
      </button>
      {open && (
        <div
          className={`absolute top-full mt-1.5 w-72 max-w-[calc(100vw-3rem)] rounded-lg border border-slate-700 bg-slate-900 text-slate-100 p-2.5 text-[11px] leading-relaxed shadow-xl z-50 pointer-events-none ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {text}
        </div>
      )}
    </div>
  )
}

export function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: { name: string; value: number; color?: string; unit?: string }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-slate-200 bg-white/95 px-3.5 py-2 text-xs shadow-lg backdrop-blur">
      <p className="mb-1 font-semibold text-slate-800">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color || '#2563eb' }} className="font-medium">
          {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
          {entry.unit ? ` ${entry.unit}` : ''}
        </p>
      ))}
    </div>
  )
}
