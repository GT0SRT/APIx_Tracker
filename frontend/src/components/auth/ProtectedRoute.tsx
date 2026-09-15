import React from 'react'
import { Lock, ShieldAlert, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  title?: string
}

export function ProtectedRoute({ children, title = 'Protected Corridor Analytics' }: ProtectedRouteProps) {
  const { isAuthenticated, openLoginModal } = useAuth()
  const navigate = useNavigate()

  if (isAuthenticated) {
    return <>{children}</>
  }

  return (
    <div className="flex flex-1 items-center justify-center p-6 sm:p-12">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-lg">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 mb-5">
          <ShieldAlert className="h-8 w-8" />
        </div>

        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600 border border-slate-200 mb-3">
          Restricted MoSPI Access
        </span>

        <h2 className="text-xl font-bold tracking-tight text-slate-900 mb-2">
          Admin Authorization Required
        </h2>

        <p className="text-xs text-slate-500 leading-relaxed mb-6 max-w-md mx-auto">
          The view <span className="font-semibold text-slate-700">"{title}"</span> contains granular airline pricing,
          cross-carrier parity, advance purchase yield curves (T+1 to T+45), or ingestion audit logs.
          Unauthenticated public viewers are restricted to the <strong>National Overview</strong> and <strong>Help & Support</strong> views.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Overview</span>
          </button>

          <button
            onClick={openLoginModal}
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition cursor-pointer"
          >
            <Lock className="h-4 w-4" />
            <span>Sign In as Admin</span>
          </button>
        </div>
      </div>
    </div>
  )
}
