'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useAuth } from './AuthProvider'

export default function Header() {
  const { user, supabase, loading } = useAuth()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <header className="bg-white border-b border-gold-200 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-8 h-16 flex items-center justify-between">

        <Link href="/" className="text-base font-light tracking-luxury uppercase text-charcoal hover:text-gold-400 transition-colors">
          LKBK
        </Link>

        <nav className="flex items-center gap-10">
          <Link href="/shop" className="label-caps hover:text-charcoal transition-colors">
            Discover
          </Link>
          {user && (
            <>
              <Link href="/wishlists" className="label-caps hover:text-charcoal transition-colors">
                Wishlists
              </Link>
              <Link href="/collections" className="label-caps hover:text-charcoal transition-colors">
                Collections
              </Link>
            </>
          )}

          {!loading && (
            user ? (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen((o) => !o)}
                  className="w-8 h-8 rounded-full border border-gold-300 flex items-center justify-center text-gold-400 text-xs hover:bg-gold-50 transition-colors"
                >
                  {user.email?.[0]?.toUpperCase() ?? 'U'}
                </button>
                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                    <div className="absolute right-0 top-12 bg-white border border-gold-100 shadow-lg w-52 z-50">
                      <div className="px-5 py-3 border-b border-pearl-200">
                        <p className="text-xs text-charcoal-muted truncate">{user.email}</p>
                      </div>
                      <Link href="/wishlists" onClick={() => setMenuOpen(false)} className="block px-5 py-3 label-caps hover:bg-pearl-100 transition-colors">
                        Wishlists
                      </Link>
                      <Link href="/collections" onClick={() => setMenuOpen(false)} className="block px-5 py-3 label-caps hover:bg-pearl-100 transition-colors">
                        Collections
                      </Link>
                      <button onClick={signOut} className="w-full text-left px-5 py-3 label-caps text-red-400 hover:bg-red-50 transition-colors border-t border-pearl-200">
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="label-caps border border-gold-300 text-gold-500 px-6 py-2 hover:bg-gold-50 transition-colors"
              >
                Sign In
              </Link>
            )
          )}
        </nav>
      </div>
    </header>
  )
}
