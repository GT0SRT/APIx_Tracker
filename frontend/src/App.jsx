import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            APIx Tracker
          </h1>
          <p className="text-sm text-slate-400">
            Vite + React + Tailwind CSS setup is ready!
          </p>
        </div>

        <div className="pt-2">
          <button
            onClick={() => setCount((c) => c + 1)}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] transition-all duration-200 text-white font-medium rounded-xl shadow-lg shadow-indigo-600/30 cursor-pointer"
          >
            Count is {count}
          </button>
        </div>

        <div className="flex items-center justify-center gap-4 text-xs text-slate-500 pt-2 border-t border-slate-800">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            Vite 8
          </span>
          <span>•</span>
          <span>React 19</span>
          <span>•</span>
          <span>Tailwind CSS v4</span>
        </div>
      </div>
    </div>
  )
}

export default App
