import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'



function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl p-8 space-y-6">

        <h1 className="text-2xl font-bold text-white text-center">
          React + Tailwind Starter
        </h1>

        <p className="text-slate-400 text-center text-sm">
          Clean UI foundation for scaling your app.
        </p>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Enter your name"
            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />

          <button className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] transition rounded-lg font-semibold text-white shadow-lg">
            Submit
          </button>
        </div>

        <div className="flex justify-between text-xs text-slate-500 pt-4 border-t border-slate-800">
          <span>Vite</span>
          <span>React</span>
          <span>TypeScript</span>
          <span>Tailwind v4</span>
        </div>

      </div>
    </div>
  )
}

export default App;
