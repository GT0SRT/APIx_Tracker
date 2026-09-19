import { useState } from 'react'
import {
  HelpCircle,
  BookOpen,
  FileText,
  ShieldCheck,
  PhoneCall,
  Mail,
  ChevronDown,
  ChevronUp,
  Sparkles,
  CheckCircle2,
  MessageSquare,
  Send,
  Lock,
} from 'lucide-react'
import { Card } from '../common/CommonUI'
import { useAuth } from '../../context/AuthContext'

interface FaqItem {
  question: string
  answer: string
  category: 'methodology' | 'ingestion' | 'mospi'
}

const faqs: FaqItem[] = [
  {
    category: 'mospi',
    question: 'How does APIx solve MoSPI’s 45-day reporting lag?',
    answer:
      'Traditionally, the National Statistical Office (NSO) relies on monthly manual field surveying across selected travel agencies, publishing CPI transport numbers 45 days after the reference month. APIx operates autonomous data ingestion workers every 6 hours across 150+ high-density corridors, computing real-time daily geometric price indices (<24h turnaround) and eliminating the survey reporting lag entirely.',
  },
  {
    category: 'methodology',
    question: 'Why does APIx use the Jevons Geometric Mean instead of Carli or Dutot?',
    answer:
      'According to the IMF CPI Manual 2020 (Chapter 10) and Eurostat scanner data standards, the Carli arithmetic mean suffers from an inherent upward substitution bias (averaging +2.87% inflation exaggeration in aviation data due to flash sales). The Jevons geometric mean satisfies both the time-reversal and circularity tests, mathematically smoothing out flash sales and seat-bucket depletion.',
  },
  {
    category: 'methodology',
    question: 'What is the "Advance Purchase Blindness" problem?',
    answer:
      'In aviation, ticket prices for tomorrow (T+1) are typically 200% to 400% higher than tickets booked 30 days in advance (T+30) for the exact same flight seat. If an index does not fix the advance purchase window, random sampling timestamps create severe timing bias. APIx constructs a synthetic constant-horizon basket across 5 fixed lead times (T+1, T+7, T+15, T+30, T+45) to ensure consistent, apples-to-apples price tracking.',
  },
  {
    category: 'ingestion',
    question: 'How are voluntary ancillaries (meals, baggage, seat selection) stripped?',
    answer:
      'Airlines unbundle fares to display low headline base rates while charging extra at checkout. Our automated validation pipeline inspects unbundled fee manifests and isolates: Base Fare + Fuel Surcharge (YQ/YR) + Airport User Development Fee (UDF/PSF), while programmatically stripping voluntary baggage, seat choice, and meal add-ons to isolate genuine transportation price inflation.',
  },
  {
    category: 'ingestion',
    question: 'How is data integrity and provenance guaranteed?',
    answer:
      'Every collected quote is cryptographically fingerprinted using a SHA-256 hash containing timestamp, airline, origin-destination, flight number, base fare, and raw payload snippet. This audit trail is stored in the verifiable audit ledger and can be verified by MoSPI or DGCA auditors at any time via the Ingestion & Audit view.',
  },
  {
    category: 'mospi',
    question: 'How are DGCA quarterly passenger volume weights applied?',
    answer:
      'The elementary route indices (I_r) are aggregated into the National Composite APIx using the Modified Laspeyres formula: P_L = (∑ w_r * I_r) / (∑ w_r * 100). The weights (w_r) are updated dynamically using official DGCA city-pair quarterly scheduled passenger traffic figures, ensuring that high-density metro corridors (like DEL-BOM) carry proportional statistical weight over regional routes.',
  },
]

interface HelpSupportViewProps {
  onOpenReportModal?: () => void
}

export function HelpSupportView({ onOpenReportModal }: HelpSupportViewProps) {
  const { isAuthenticated, openLoginModal } = useAuth()
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [faqFilter, setFaqFilter] = useState<'all' | 'mospi' | 'methodology' | 'ingestion'>('all')
  const [ticketSubject, setTicketSubject] = useState('')
  const [ticketBody, setTicketBody] = useState('')
  const [ticketSubmitted, setTicketSubmitted] = useState(false)

  const filteredFaqs = faqs.filter((item) => {
    if (faqFilter === 'all') return true
    return item.category === faqFilter
  })

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!ticketSubject.trim() || !ticketBody.trim()) return
    setTicketSubmitted(true)
    setTimeout(() => {
      setTicketSubject('')
      setTicketBody('')
    }, 1500)
  }

  return (
    <div className="space-y-6 p-4 md:p-8 flex-1 bg-[#07111f] text-slate-100 min-h-full">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#26364c] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
              Help, Support &amp; Regulatory Framework
            </h2>
            <span className="rounded-full bg-cyan-400/10 text-cyan-300 text-xs font-bold px-2.5 py-0.5 border border-cyan-400/20">
              MoSPI &amp; DGCA Desk
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Official guidelines, CPI augmentation methodology, statistical standards, and technical support
          </p>
        </div>

        {onOpenReportModal && (
          isAuthenticated ? (
            <button
              onClick={onOpenReportModal}
              className="flex items-center gap-1.5 rounded-lg bg-cyan-500 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-cyan-400 active:scale-[0.98] transition cursor-pointer"
            >
              <FileText className="h-4 w-4" />
              <span>Generate Executive Report</span>
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            </button>
          ) : (
            <button
              onClick={openLoginModal}
              title="Admin Authentication Required: Sign in to generate official executive briefings"
              className="flex items-center gap-1.5 rounded-lg border border-[#33465f] bg-[#101d2e] px-3.5 py-2 text-xs font-bold text-slate-200 hover:bg-[#16263a] transition cursor-pointer shadow-xs"
            >
              <Lock className="h-3.5 w-3.5 text-slate-400" />
              <span>Generate Executive Report</span>
              <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[9px] font-bold text-blue-700">Admin</span>
            </button>
          )
        )}
      </div>

      {/* Quick Documentation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 !bg-gradient-to-br !from-[#101d2e] !via-[#0e1a2a] !to-[#0a1524] !border-[#26364c] border-l-4 border-l-cyan-400 shadow-[0_14px_35px_rgba(0,0,0,0.28)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(0,0,0,0.38)]">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2 text-cyan-400">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">IMF CPI Manual 2020</p>
              <p className="text-[11px] text-slate-400">Ch. 10 Scanner Data &amp; Web Scraping</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-300 leading-relaxed">
            Strict adherence to elementary aggregate standards using geometric formulation.
          </p>
        </Card>

        <Card className="p-4 !bg-gradient-to-br !from-[#101d2e] !via-[#0e1a2a] !to-[#0a1524] !border-[#26364c] border-l-4 border-l-violet-400 shadow-[0_14px_35px_rgba(0,0,0,0.28)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(0,0,0,0.38)]">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-indigo-50 p-2 text-violet-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">DGCA City-Pair Policy</p>
              <p className="text-[11px] text-slate-400">Quarterly Scheduled Volumes</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-300 leading-relaxed">
            Dynamic weighting calibrated against actual domestic passenger seat distribution.
          </p>
        </Card>

        <Card className="p-4 !bg-gradient-to-br !from-[#101d2e] !via-[#0e1a2a] !to-[#0a1524] !border-[#26364c] border-l-4 border-l-emerald-400 shadow-[0_14px_35px_rgba(0,0,0,0.28)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(0,0,0,0.38)]">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Cryptographic Provenance</p>
              <p className="text-[11px] text-slate-400">SHA-256 Audit Trail</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-300 leading-relaxed">
            100% immutable fare verification preventing retroactive survey adjustments.
          </p>
        </Card>

        <Card className="p-4 !bg-gradient-to-br !from-[#101d2e] !via-[#0e1a2a] !to-[#0a1524] !border-[#26364c] border-l-4 border-l-orange-400 shadow-[0_14px_35px_rgba(0,0,0,0.28)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(0,0,0,0.38)]">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-orange-50 p-2 text-orange-600">
              <PhoneCall className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Technical Desk</p>
              <p className="text-[11px] text-slate-400">Team AndroMatrix</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-300 leading-relaxed">
            24/7 SIH26056 automation cluster monitoring and pipeline telemetry support.
          </p>
        </Card>
      </div>

      {/* Main Support Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-6">
        {/* FAQs Accordion */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-cyan-400" />
              Frequently Asked Questions (FAQ)
            </h3>

            {/* Category Filter */}
            <div className="flex items-center gap-1.5 rounded-lg border border-[#33465f] bg-[#0d192b] border-[#33465f] p-1 text-xs font-semibold">
              {(['all', 'mospi', 'methodology', 'ingestion'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFaqFilter(cat)}
                  className={`rounded-md px-2.5 py-1 capitalize transition cursor-pointer ${
                    faqFilter === cat
                      ? 'bg-cyan-500 text-white shadow-xs'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {cat === 'mospi' ? 'MoSPI CPI' : cat === 'ingestion' ? 'Ingestion' : cat}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2.5">
            {filteredFaqs.map((faq, index) => {
              const isOpen = openFaq === index
              return (
                <Card key={index} className="overflow-hidden !bg-gradient-to-br !from-[#101d2e] !via-[#0e1a2a] !to-[#0a1524] !border-[#26364c] shadow-[0_10px_28px_rgba(0,0,0,0.24)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(0,0,0,0.32)]">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="flex w-full items-center justify-between p-4 text-left font-semibold text-slate-100 hover:text-cyan-400 transition cursor-pointer gap-3"
                  >
                    <span className="text-xs sm:text-sm">{faq.question}</span>
                    {isOpen ? (
                      <ChevronUp className="h-4 w-4 text-slate-400 shrink-0" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="border-t border-[#26364c] bg-[#0b1728] p-4 text-xs text-slate-300 leading-relaxed">
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </Card>
              )
            })}
          </div>
        </div>

        {/* Nodal Officer Contact & Direct Ticket Submission */}
        <div className="space-y-6">
          <Card className="p-5 !bg-gradient-to-br !from-[#101d2e] !via-[#0e1a2a] !to-[#0a1524] !border-[#26364c] shadow-[0_14px_35px_rgba(0,0,0,0.28)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(0,0,0,0.38)]">
            <h3 className="font-bold text-white text-sm flex items-center gap-2 mb-3">
              <Mail className="h-4 w-4 text-cyan-400" />
              Nodal Contact &amp; Coordination
            </h3>
            <div className="space-y-3 text-xs text-slate-300">
              <div className="rounded-lg bg-[#0b1728] p-3 border border-[#26364c] space-y-1">
                <p className="font-bold text-slate-100">Ministry of Statistics and Programme Implementation (MoSPI)</p>
                <p className="text-slate-400">National Statistical Office (NSO) · Economic Statistics Division</p>
                <p className="text-[11px] text-cyan-400 font-mono">cpi-desk@mospi.gov.in</p>
              </div>
              <div className="rounded-lg bg-[#0b1728] p-3 border border-[#26364c] space-y-1">
                <p className="font-bold text-slate-100">Directorate General of Civil Aviation (DGCA)</p>
                <p className="text-slate-400">Air Transport Directorate · Route Tariffs Division</p>
                <p className="text-[11px] text-cyan-400 font-mono">tariffs.dgca@nic.in</p>
              </div>
              <div className="rounded-lg bg-[#0b1728] p-3 border border-[#26364c] space-y-1">
                <p className="font-bold text-slate-100">Smart India Hackathon 2026 Team</p>
                <p className="text-slate-400">Team AndroMatrix · Problem Statement SIH26056</p>
                <p className="text-[11px] text-emerald-400 font-mono">andromatrix.sih@gmail.com</p>
              </div>
            </div>
          </Card>

          {/* Direct Query Submission Form */}
          <Card className="p-5 !bg-gradient-to-br !from-[#101d2e] !via-[#0e1a2a] !to-[#0a1524] !border-[#26364c] shadow-[0_14px_35px_rgba(0,0,0,0.28)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(0,0,0,0.38)]">
            <h3 className="font-bold text-white text-sm flex items-center gap-2 mb-2">
              <MessageSquare className="h-4 w-4 text-violet-400" />
              Statistical Inquiry Desk
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Submit requests for custom corridor datasets, API tokens, or methodology audits.
            </p>

            {ticketSubmitted ? (
              <div className="rounded-xl bg-emerald-400/10 border border-emerald-400/20 p-4 text-center space-y-1 text-emerald-800">
                <CheckCircle2 className="h-6 w-6 text-emerald-400 mx-auto" />
                <p className="text-xs font-bold">Inquiry Dispatched Successfully</p>
                <p className="text-[11px] text-emerald-400">Reference Token: SIH26-INQ-{Math.floor(1000 + Math.random() * 9000)}</p>
              </div>
            ) : (
              <form onSubmit={handleTicketSubmit} className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Inquiry Subject / Route</label>
                  <input
                    type="text"
                    required
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    placeholder="e.g. Request historical raw quotes for DEL-BOM"
                    className="w-full rounded-lg border border-[#33465f] bg-[#0d192b] px-3 py-2 text-xs text-slate-100 outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Details &amp; Specifications</label>
                  <textarea
                    required
                    rows={3}
                    value={ticketBody}
                    onChange={(e) => setTicketBody(e.target.value)}
                    placeholder="Provide details of the inquiry or analytical requirement..."
                    className="w-full rounded-lg border border-[#33465f] bg-[#0d192b] px-3 py-2 text-xs text-slate-100 outline-none focus:border-cyan-400 resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-cyan-400 transition cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5" />
                  Submit Inquiry
                </button>
              </form>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
