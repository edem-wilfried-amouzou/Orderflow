import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-xl rounded-2xl bg-white p-8 shadow-lg ring-1 ring-slate-200">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">
          OrderFlow
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900">
          Tailwind v4 is working
        </h1>
        <p className="mt-3 text-base text-slate-600">
          This page is styled with Tailwind classes through the Vite plugin.
        </p>

        <button
          type="button"
          onClick={() => setCount((value) => value + 1)}
          className="mt-6 inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-500"
        >
          Count is {count}
        </button>
      </div>
    </main>
  )
}

export default App
