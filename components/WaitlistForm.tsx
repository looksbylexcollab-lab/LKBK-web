'use client'

import { useState } from 'react'

export default function WaitlistForm({ source = 'landing' }: { source?: string }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source }),
      })
      const data = await res.json()
      if (!res.ok) {
        setErrorMsg(data.error ?? 'Something went wrong.')
        setStatus('error')
      } else {
        setStatus('success')
      }
    } catch {
      setErrorMsg('Network error. Please try again.')
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="flex items-center gap-3 bg-white border border-cream-400 rounded-2xl px-6 py-4 max-w-md">
        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
          <svg width="16" height="16" fill="none" stroke="#16a34a" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-bark font-sans">You&apos;re on the list!</p>
          <p className="text-xs text-bark-muted font-sans mt-0.5">We&apos;ll email you when beta opens.</p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md">
      <div className="flex gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="flex-1 bg-white border border-cream-400 rounded-full px-5 py-3 text-sm text-bark placeholder:text-bark-subtle focus:outline-none focus:ring-2 focus:ring-tan-300 font-sans"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="btn-dark px-6 py-3 text-sm disabled:opacity-60"
        >
          {status === 'loading' ? 'Joining…' : 'Join Waitlist'}
        </button>
      </div>
      {status === 'error' && (
        <p className="mt-2 text-xs text-red-500 font-sans">{errorMsg}</p>
      )}
    </form>
  )
}
