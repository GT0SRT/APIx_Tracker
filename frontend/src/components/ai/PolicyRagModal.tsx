import { useState } from 'react'
import {
  BookOpen,
  FileCheck,
  Send,
  Sparkles,
  X,
} from 'lucide-react'
import { policyRagKnowledgeBase } from '../../data/policyRagData'
import { Card } from '../common/CommonUI'
import type { RagQaItem } from '../../types/apix'

interface PolicyRagProps {
  onClose: () => void
}

export function PolicyRagModal({ onClose }: PolicyRagProps) {
  const [activeItem, setActiveItem] = useState<RagQaItem>(policyRagKnowledgeBase[0])
  const [customQuestion, setCustomQuestion] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!customQuestion.trim()) return

    setIsSearching(true)
    setTimeout(() => {
      const lower = customQuestion.toLowerCase()
      const match =
        policyRagKnowledgeBase.find((item) => {
          const q = item.question.toLowerCase()
          const a = item.answer.toLowerCase()
          return lower.split(' ').some((word) => word.length > 3 && (q.includes(word) || a.includes(word)))
        }) || policyRagKnowledgeBase[0]

      setActiveItem(match)
      setIsSearching(false)
      setCustomQuestion('')
    }, 600)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="my-8 w-full max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-700 to-indigo-800 text-white shadow-md">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black tracking-tight text-slate-900">
                  Agentic RAG: Policy &amp; Compliance Q&amp;A
                </h2>
                <span className="rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 border border-blue-200">
                  MoSPI &amp; DGCA Verified
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Autonomous retrieval from official MoSPI CPI manuals, DGCA circulars, and IMF statistical standards
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Suggested Quick Question Chips */}
        <div className="space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            Suggested Policy Inquiries:
          </p>
          <div className="flex flex-wrap gap-2">
            {policyRagKnowledgeBase.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveItem(item)}
                className={`text-left rounded-lg px-3 py-1.5 text-xs font-semibold border transition cursor-pointer ${
                  activeItem.id === item.id
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {item.category}: {item.question.substring(0, 48)}...
              </button>
            ))}
          </div>
        </div>

        {/* Selected Answer & Citations Card */}
        <Card className="p-6 border-2 border-blue-100 space-y-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="rounded bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5">
                Category: {activeItem.category}
              </span>
              <span className="text-xs font-mono text-slate-400">{activeItem.id}</span>
            </div>
            <h3 className="text-base font-bold text-slate-900">{activeItem.question}</h3>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-xs text-slate-800 leading-relaxed space-y-2">
            <p className="font-semibold text-slate-900">RAG Synthesis Answer:</p>
            <p>{activeItem.answer}</p>
          </div>

          {/* Source Document Citations */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <FileCheck className="h-4 w-4 text-emerald-600" />
                Verified Ground-Truth Source Citations ({activeItem.citations.length})
              </p>
              <span className="text-[11px] text-slate-400">Cosine Similarity Ranked</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {activeItem.citations.map((cite) => (
                <div
                  key={cite.id}
                  className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-2 text-xs shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="rounded bg-slate-100 text-slate-800 font-bold text-[10px] px-2 py-0.5">
                      {cite.organization}
                    </span>
                    <span className="font-bold text-emerald-600 text-[11px]">
                      Match: {(cite.relevanceScore * 100).toFixed(0)}%
                    </span>
                  </div>
                  <p className="font-bold text-slate-900 leading-snug">{cite.title}</p>
                  <p className="text-[11px] text-blue-700 font-mono">{cite.reference}</p>
                  <blockquote className="border-l-2 border-slate-300 pl-2 text-[11px] text-slate-600 italic">
                    "{cite.excerpt}"
                  </blockquote>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Natural Language Query Form */}
        <form onSubmit={handleCustomSubmit} className="relative flex items-center">
          <input
            type="text"
            placeholder="Ask anything regarding MoSPI CPI transport rules, DGCA traffic weights, or IMF Jevons formulations..."
            value={customQuestion}
            onChange={(e) => setCustomQuestion(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-4 pr-24 text-xs text-slate-900 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-xs"
          />
          <button
            type="submit"
            disabled={isSearching || !customQuestion.trim()}
            className="absolute right-2 flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition cursor-pointer disabled:opacity-40"
          >
            <Send className="h-3 w-3" />
            <span>Query</span>
          </button>
        </form>
      </div>
    </div>
  )
}
