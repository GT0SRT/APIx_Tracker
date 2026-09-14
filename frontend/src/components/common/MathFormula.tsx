import { useMemo } from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'

interface MathFormulaProps {
  math: string
  displayMode?: boolean
  className?: string
}

export function MathFormula({ math, displayMode = false, className = '' }: MathFormulaProps) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(math, {
        displayMode,
        throwOnError: false,
        strict: false,
      })
    } catch {
      return math
    }
  }, [math, displayMode])

  if (displayMode) {
    return (
      <div
        className={`overflow-x-auto py-2 text-center select-all ${className}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    )
  }

  return (
    <span
      className={`inline-block select-all ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
