import { useState, useRef, useEffect } from 'react'
import {
  Send,
  Sparkles,
  RefreshCw,
  ExternalLink,
  X as XIcon,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import botAvatar from '../../assets/bot-avatar.png'
import { policyRagKnowledgeBase } from '../../data/policyRagData'

interface Message {
  id: string
  sender: 'user' | 'bot'
  text: string
  timestamp: string
  actionLabel?: string
  actionRoute?: string
}

const presetQueries = [
  'How does APIx eliminate MoSPI’s 45-day lag?',
  'Explain Jevons vs Carli index bias',
  'Why do T+1 fares surge 200%–400%?',
  'How are seat add-ons stripped?',
  'How are DGCA quarterly traffic weights applied?',
  'What is IMF Chapter 10 compliance?',
  'Is scraping verified with SHA-256?',
]

function getBotReply(query: string): { reply: string; actionLabel?: string; actionRoute?: string } {
  const q = query.toLowerCase()

  if (q.includes('45-day') || q.includes('lag') || q.includes('nowcast')) {
    return {
      reply:
        'Traditional MoSPI CPI relies on monthly manual field surveys, creating a 45-day reporting lag. APIx replaces this with automated high-frequency price capture every 6 hours across 150+ routes, providing instant (<24h) real-time transport inflation nowcasts for NSO and RBI.',
      actionLabel: 'View Index Series',
      actionRoute: '/index-series',
    }
  }

  if (q.includes('jevons') || q.includes('carli') || q.includes('formula') || q.includes('laspeyres') || q.includes('imf') || q.includes('chapter 10')) {
    return {
      reply:
        'According to the IMF CPI Manual (2020, Chapter 10: Scanner & Web-Scraped Data), volatile intraday dynamic airfares suffer from severe upward substitution bias when aggregated using the arithmetic Carli formula (often called the "Carli bounce" or upward drift). The Jevons Elementary Geometric Mean satisfies both the time reversal test (I(t/0) * I(0/t) = 1) and transitivity. This mathematically prevents high-frequency dynamic airline price fluctuations from artificially inflating the national Consumer Price Index.',
      actionLabel: 'Explore Mathematical Formulation',
      actionRoute: '/methodology',
    }
  }

  if (q.includes('strip') || q.includes('addon') || q.includes('add-on') || q.includes('ancillary') || q.includes('baggage') || q.includes('meal') || q.includes('seat')) {
    return {
      reply:
        'Under MoSPI CPI guidelines (Item Code 6.2.01) and DGCA AIC regulations, voluntary optional add-ons such as pre-booked hot meals, extra baggage allowances, and preferred seat selection fees represent changes in service consumption quantity or quality rather than pure transport price inflation. APIx isolates pure Base Fare + Fuel Surcharge (ATF) + Airport Development Fee (UDF/PSF), stripping all voluntary add-ons prior to index calculation.',
      actionLabel: 'Inspect Fare Breakdown',
      actionRoute: '/overview',
    }
  }

  if (q.includes('dgca') || q.includes('weight') || q.includes('passenger') || q.includes('volume') || q.includes('modified laspeyres')) {
    return {
      reply:
        'The composite national Airfare Price Index is computed via the Modified Laspeyres formulation: P_L = [sum(I_r * w_r) / sum(w_r)] * 100. The route weight w_r is derived from the Directorate General of Civil Aviation (DGCA) Quarterly Domestic Air Transport Traffic Reports. High-density trunk routes like DEL-BOM (512k monthly pax) receive a 14.8% weight share, while regional UDAN corridors receive calibrated proportional shares, preventing regional flights from distorting national inflation trends.',
      actionLabel: 'View Route Weights & Parity',
      actionRoute: '/routes-horizons',
    }
  }

  if (q.includes('t+1') || q.includes('surge') || q.includes('elasticity') || q.includes('booking') || q.includes('horizon') || q.includes('constant-horizon')) {
    return {
      reply:
        'Airline dynamic pricing yields 200%–400% price differences between a flight booked for tomorrow (T+1) versus one booked 45 days in advance (T+45). Measuring prices on inconsistent booking horizons introduces severe temporal sampling bias. APIx samples five fixed lead-time windows (T+1, T+7, T+15, T+30, T+45) every 6 hours, maintaining matched-model price constancy across time in accordance with UK ONS and Eurostat multilateral airfare guidelines.',
      actionLabel: 'Analyze Booking Horizons',
      actionRoute: '/routes-horizons',
    }
  }

  if (q.includes('sha') || q.includes('provenance') || q.includes('audit') || q.includes('hash') || q.includes('security') || q.includes('tamper')) {
    return {
      reply:
        'Every scraped fare quote is hashed with a cryptographic SHA-256 seal alongside raw DOM metadata and carrier timestamp. This provides an immutable audit trail guaranteeing 100% provenance compliance for MoSPI official statistical verification.',
      actionLabel: 'Open Ingestion Audit',
      actionRoute: '/audit-logs',
    }
  }

  if (q.includes('forecast') || q.includes('ml') || q.includes('predict') || q.includes('model') || q.includes('mae')) {
    return {
      reply:
        'APIx utilizes a multi-horizon predictive forecasting model calibrated across 1.2M historical quotes to project fare trajectories 45 days in advance (T+1 to T+45) with 94.2% accuracy and an MAE of ₹148. This enables proactive inflation warning before flights take off.',
      actionLabel: 'View ML Forecasting',
      actionRoute: '/ai-intelligence',
    }
  }

  if (q.includes('hampel') || q.includes('outlier') || q.includes('iqr') || q.includes('filter') || q.includes('clean')) {
    return {
      reply:
        'To protect against temporary web artifacts, bot-detection redirects, and scraping glitches, APIx applies a rolling 3-sigma Hampel filter combined with IQR interquartile bounds. Only genuine market quotes are aggregated into the elementary Jevons price relatives.',
      actionLabel: 'Inspect Telemetry Logs',
      actionRoute: '/audit-logs',
    }
  }

  if (q.includes('carrier') || q.includes('indigo') || q.includes('parity') || q.includes('monopoly') || q.includes('cci') || q.includes('hhi')) {
    return {
      reply:
        'APIx computes the Herfindahl-Hirschman Index (HHI) across airlines on each city-pair corridor. Routes with high concentration (e.g. Leh, Srinagar, Port Blair) are tracked for price gouging to alert the Competition Commission of India (CCI) and DGCA tariff surveillance cells.',
      actionLabel: 'View Routes & Parity',
      actionRoute: '/routes-horizons',
    }
  }

  // Dynamic lookup in policyRagKnowledgeBase for semantic policy inquiries
  const words = q.split(/\s+/).filter((w) => w.length > 3)
  let bestMatch = null
  let maxMatches = 0

  for (const item of policyRagKnowledgeBase) {
    const textToSearch = `${item.category} ${item.question} ${item.answer}`.toLowerCase()
    let score = 0
    for (const word of words) {
      if (textToSearch.includes(word)) score++
    }
    if (score > maxMatches) {
      maxMatches = score
      bestMatch = item
    }
  }

  if (bestMatch && maxMatches >= 2) {
    const citation = bestMatch.citations[0]
      ? `\n\n[Grounded Authority: ${bestMatch.citations[0].organization} — ${bestMatch.citations[0].title}]`
      : ''
    return {
      reply: `${bestMatch.answer}${citation}`,
      actionLabel: 'Read Methodology Guidelines',
      actionRoute: '/methodology',
    }
  }

  return {
    reply:
      'APIx Tracker operates as a DPI-ready augmentation engine for MoSPI. It ingests live domestic quotes across 150+ corridors every 6 hours, executing automated Hampel/IQR outlier rejection, Jevons geometric index computation, and multi-horizon predictive forecasting.',
    actionLabel: 'Read Methodology & Impact',
    actionRoute: '/methodology',
  }
}

export function FloatingChatBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const navigate = useNavigate()

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      sender: 'bot',
      text: 'Namaste! I am your APIx Statistical Copilot. Ask me anything about real-time airfare CPI calculation, Jevons geometric indexing, MoSPI 45-day nowcasting, or dynamic surge analysis.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ])

  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen, isTyping])

  const sendMessage = (textToSend?: string) => {
    const query = (textToSend || input).trim()
    if (!query) return

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    setTimeout(() => {
      const response = getBotReply(query)
      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionLabel: response.actionLabel,
        actionRoute: response.actionRoute,
      }
      setMessages((prev) => [...prev, botMsg])
      setIsTyping(false)
    }, 600)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      {/* Floating Chat Window (Expanded View) - Styled with Website Single Theme (#0B2545 / #133A6B) */}
      {isOpen && (
        <div className="mb-3 flex w-[92vw] max-w-[390px] sm:w-[410px] h-[430px] max-h-[72vh] flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl backdrop-blur-lg overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-[#0B2545] via-[#133A6B] to-[#0B2545] px-4 py-3 text-white">
            <div className="flex items-center gap-2.5">
              {/* Clean Avatar Container matching Website Theme */}
              <div
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/20 border border-blue-400/30 p-1 text-white shadow-inner overflow-hidden shrink-0"
                title="APIx AI Bot"
              >
                <img
                  src={botAvatar}
                  alt="APIx Bot"
                  className="h-full w-full object-contain drop-shadow"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold tracking-tight">APIx Copilot</p>
                </div>
                <p className="text-[10px] text-blue-200/80">MoSPI CPI Intelligence &amp; Analytics</p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-slate-300">
              <button
                onClick={() => {
                  setMessages([
                    {
                      id: 'welcome-reset',
                      sender: 'bot',
                      text: 'Chat history cleared. How can I assist your MoSPI or aviation price indexing research?',
                      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    },
                  ])
                }}
                className="p-1.5 hover:text-white rounded-lg hover:bg-white/10 transition cursor-pointer"
                title="Reset conversation"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:text-white rounded-lg hover:bg-white/10 transition cursor-pointer"
                title="Close chat"
              >
                <XIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Quick Preset Queries Pill Bar */}
          <div className="border-b border-slate-100 bg-slate-50/80 px-3 py-2 overflow-x-auto no-scrollbar flex items-center gap-1.5 shrink-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
              <Sparkles className="h-2.5 w-2.5 text-amber-500" /> Quick:
            </span>
            {presetQueries.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => sendMessage(preset)}
                className="whitespace-nowrap rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition cursor-pointer shrink-0 shadow-2xs"
              >
                {preset}
              </button>
            ))}
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {/* Bot Avatar Icon in chat messages - clean, without colored circular background */}
                {m.sender === 'bot' && (
                  <div className="h-6 w-6 flex items-center justify-center shrink-0 mt-1">
                    <img src={botAvatar} alt="Bot" className="h-full w-full object-contain filter drop-shadow-xs" />
                  </div>
                )}

                <div className="flex flex-col max-w-[85%]">
                  <div
                    className={`rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-blue-600 text-white shadow-sm font-medium self-end'
                        : 'bg-white text-slate-800 border border-slate-200/80 shadow-xs self-start'
                    }`}
                  >
                    <p>{m.text}</p>

                    {/* Contextual Action Link */}
                    {m.actionRoute && m.actionLabel && (
                      <button
                        onClick={() => {
                          navigate(m.actionRoute!)
                          setIsOpen(false)
                        }}
                        className="mt-2.5 inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-700 hover:bg-blue-100 transition cursor-pointer border border-blue-200"
                      >
                        <span>{m.actionLabel}</span>
                        <ExternalLink className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                  <span
                    className={`mt-1 px-1 text-[9px] text-slate-400 ${
                      m.sender === 'user' ? 'text-right' : 'text-left'
                    }`}
                  >
                    {m.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 flex items-center justify-center shrink-0">
                  <img src={botAvatar} alt="Bot" className="h-full w-full object-contain filter drop-shadow-xs" />
                </div>
                <div className="flex items-center gap-1.5 rounded-2xl bg-white border border-slate-200/80 px-3.5 py-2.5 text-xs text-slate-500 w-fit shadow-xs">
                  <span className="h-2 w-2 rounded-full bg-blue-500 animate-bounce"></span>
                  <span className="h-2 w-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.2s]"></span>
                  <span className="h-2 w-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Box */}
          <div className="border-t border-slate-200 bg-white p-2.5">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-1.5 focus-within:border-blue-600 focus-within:bg-white focus-within:ring-1 focus-within:ring-blue-600 transition">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask query on CPI index, surge, or data..."
                className="flex-1 bg-transparent text-xs text-slate-800 placeholder-slate-400 outline-none"
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim()}
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:hover:bg-blue-600 transition cursor-pointer shrink-0 shadow-xs"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Chat Bot Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center justify-center transition-all duration-300 cursor-pointer focus:outline-none"
        aria-label={isOpen ? 'Close AI Assistant Chat' : 'Open AI Assistant Chat'}
        title={isOpen ? 'Close AI Copilot' : 'Ask APIx AI Copilot'}
      >
        {isOpen ? (
          <div className="flex h-13 w-13 items-center justify-center rounded-full bg-[#0B2545] text-white shadow-xl hover:bg-[#133A6B] active:scale-95 transition-all border border-slate-700/50">
            <XIcon className="h-6 w-6 text-white transition-transform duration-200 group-hover:rotate-90 drop-shadow" />
          </div>
        ) : (
          <div className="relative flex h-22 w-22 items-center justify-center transition-transform duration-300 group-hover:scale-110 active:scale-95">
            <img
              src={botAvatar}
              alt="APIx AI Copilot"
              className="h-full w-full object-contain filter drop-shadow-xl select-none pointer-events-none"
            />
          </div>
        )}
      </button>
    </div>
  )
}

