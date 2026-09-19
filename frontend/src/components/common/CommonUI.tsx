import React, { useState } from 'react'
import { Info } from 'lucide-react'

// =========================================================
// SHADCN-INSPIRED CARD PRIMITIVES
// =========================================================

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
  children: React.ReactNode
  hoverEffect?: boolean
}

export function Card({
  children,
  className = '',
  hoverEffect = true,
  ...props
}: CardProps) {
  return (
    <div
      className={`
        rounded-xl border border-slate-200/80 bg-white
        shadow-xs
        transition-all duration-200 ease-out
        ${hoverEffect ? 'hover:shadow-sm hover:border-slate-300/80' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({
  className = '',
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props}>
      {children}
    </div>
  )
}

export function CardTitle({
  className = '',
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={`text-base font-bold leading-tight tracking-tight text-slate-900 ${className}`}
      {...props}
    >
      {children}
    </h3>
  )
}

export function CardDescription({
  className = '',
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={`text-xs text-slate-500 leading-relaxed ${className}`} {...props}>
      {children}
    </p>
  )
}

export function CardContent({
  className = '',
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`p-6 pt-0 ${className}`} {...props}>
      {children}
    </div>
  )
}

// =========================================================
// MINIMALIST BADGE SYSTEM
// =========================================================

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'blue' | 'saffron' | 'emerald' | 'outline' | 'purple'
  className?: string
  children: React.ReactNode
}

export function Badge({
  variant = 'default',
  className = '',
  children,
  ...props
}: BadgeProps) {
  const variantStyles = {
    default: 'bg-slate-100 text-slate-700 border-slate-200/80',
    blue: 'bg-blue-50 text-blue-700 border-blue-200/80',
    saffron: 'bg-orange-50 text-orange-700 border-orange-200/80',
    emerald: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
    purple: 'bg-purple-50 text-purple-700 border-purple-200/80',
    outline: 'bg-transparent text-slate-600 border-slate-200',
  }[variant]

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5
        text-[10px] font-bold tracking-wide transition-colors
        ${variantStyles}
        ${className}
      `}
      {...props}
    >
      {children}
    </span>
  )
}

// =========================================================
// REFINED METRIC INFO POPOVER
// =========================================================

export function MetricInfo({
  text,
  align = 'left',
}: {
  text: string
  align?: 'left' | 'right'
}) {
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
        className="p-1 rounded-full text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
        aria-label="Information"
      >
        <Info className="h-3.5 w-3.5" />
      </button>

      {open && (
        <div
          className={`
            absolute top-full mt-2 w-72 max-w-[calc(100vw-3rem)]
            rounded-xl border border-slate-800 bg-slate-900/95 text-slate-100
            p-3 text-[11px] leading-relaxed shadow-2xl backdrop-blur-md z-50
            pointer-events-none animate-in fade-in zoom-in-95 duration-150
            ${align === 'right' ? 'right-0' : 'left-0'}
          `}
        >
          {text}
        </div>
      )}
    </div>
  )
}

// =========================================================
// HIGH-CONTRAST CHART TOOLTIP
// =========================================================

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
    <div className="rounded-xl border border-slate-200/90 bg-white/95 px-4 py-2.5 text-xs shadow-xl backdrop-blur-md ring-1 ring-black/5">
      {label && <p className="mb-1.5 font-bold text-slate-900">{label}</p>}
      <div className="space-y-1">
        {payload.map((entry) => (
          <div key={entry.name} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-slate-600 font-medium">
              <span
                className="h-2 w-2 rounded-full shrink-0"
                style={{ backgroundColor: entry.color || '#2563EB' }}
              />
              {entry.name}
            </span>
            <span className="font-extrabold text-slate-900">
              {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
              {entry.unit ? ` ${entry.unit}` : ''}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
