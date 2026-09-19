import { useState } from 'react'
import {
  Lock,
  Mail,
  KeyRound,
  X,
  ShieldCheck,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export function LoginModal() {
  const { isLoginModalOpen, closeLoginModal, login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  if (!isLoginModalOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email.trim() || !password) {
      setError('Please provide both admin email and password.')
      return
    }

    setLoading(true)
    const result = await login(email.trim().toLowerCase(), password)
    setLoading(false)

    if (!result.success) {
      setError(result.error || 'Authentication failed. Please check credentials.')
    } else {
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        closeLoginModal()
      }, 700)
    }
  }

  const handleQuickDemoLogin = async () => {
    setError(null)
    setEmail('admin@mospi.gov.in')
    setPassword('Admin@mospi')
    setLoading(true)
    const result = await login('admin@mospi.gov.in', 'Admin@mospi')
    setLoading(false)

    if (!result.success) {
      setError(result.error || 'Authentication failed. Please check credentials.')
    } else {
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        closeLoginModal()
      }, 700)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200">
        {/* Institutional Top Header */}
        <div className="bg-[#0B2545] p-6 text-white border-b border-[#153454]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-md shadow-blue-600/30">
                <Lock className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white tracking-tight">
                  Admin Authorization
                </h2>
                <p className="text-[11px] text-blue-200/80">
                  MoSPI / DGCA Secure Statistical Portal
                </p>
              </div>
            </div>
            <button
              onClick={closeLoginModal}
              className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Form Content */}
        <div className="p-6">
          {success ? (
            <div className="flex flex-col items-center justify-center py-6 text-center space-y-3">
              <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Access Authorized</h3>
              <p className="text-xs text-slate-500">Unlocking complete live analytical dashboard...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-xs text-slate-500 leading-relaxed">
                Enter your administrative credentials to unlock live corridor elasticity, carrier
                parity metrics, anomaly telemetry, and cryptographic audit logs.
              </p>

              {/* Demo Credentials Helper Box */}
              <div className="rounded-xl border border-blue-200/80 bg-blue-50/60 p-3 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-900 text-[11px]">SIH 2026 Jury Evaluation Sandbox:</span>
                  <span className="rounded bg-blue-100 text-blue-800 text-[9px] font-bold px-1.5 py-0.5 border border-blue-200">Jury Clearance</span>
                </div>
                <div className="text-[11px] font-mono text-slate-700 flex flex-col gap-0.5">
                  <div>Evaluator ID: <strong className="text-blue-950 select-all">admin@mospi.gov.in</strong></div>
                  <div>Security Pass: <strong className="text-blue-950 select-all">Admin@mospi</strong></div>
                </div>
                <button
                  type="button"
                  onClick={handleQuickDemoLogin}
                  disabled={loading}
                  className="w-full mt-1 flex items-center justify-center gap-1.5 rounded-lg bg-blue-700/10 hover:bg-blue-700/20 text-blue-800 text-[11px] font-bold py-1.5 border border-blue-300/50 transition cursor-pointer"
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-blue-700" />
                  <span>One-Click Jury Evaluation Sign-In</span>
                </button>
              </div>

              {error && (
                <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50/80 p-3 text-xs text-red-700">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span className="leading-snug">{error}</span>
                </div>
              )}

              {/* Email field */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  Official Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@mospi.gov.in"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-blue-600 focus:bg-white focus:ring-1 focus:ring-blue-600 transition"
                  required
                />
              </div>

              {/* Password field */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <KeyRound className="h-3.5 w-3.5 text-slate-400" />
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-blue-600 focus:bg-white focus:ring-1 focus:ring-blue-600 transition"
                  required
                />
              </div>

              {/* Submit button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 active:scale-[0.99] transition cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4" />
                      <span>Authenticate as Admin</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
