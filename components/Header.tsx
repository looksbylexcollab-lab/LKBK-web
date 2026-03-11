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
    <header className="bg-white border-b border-cream-400 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-8 h-16 flex items-center justify-between">

        <Link href="/" className="text-lg font-bold tracking-wider text-bark font-sans hover:text-bark-muted transition-colors">
          LKBK
        </Link>

        <nav className="flex items-center gap-8">
          <Link href="/shop" className="text-sm text-bark-muted hover:text-bark transition-colors font-sans">
            Discover
          </Link>
          {user && (
            <>
              <Link href="/wishlists" className="text-sm text-bark-muted hover:text-bark transition-colors font-sans">
                Wishlists
              </Link>
              <Link href="/collections" className="text-sm text-bark-muted hover:text-bark transition-colors font-sans">
                Collections
              </Link>
            </>
          )}

          {!loading && (
            user ? (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen((o) => !o)}
                  className="w-8 h-8 rounded-full bg-cream-300 border border-cream-400 flex items-center justify-center text-bark text-xs font-medium hover:bg-cream-400 transition-colors font-sans"
                >
                  {user.email?.[0]?.toUpperCase() ?? 'U'}
                </button>
                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                    <div className="absolute right-0 top-12 bg-white border border-cream-400 shadow-lg rounded-xl w-52 z-50 overflow-hidden">
                      <div className="px-5 py-3 border-b border-cream-300">
                        <p className="text-xs text-bark-muted truncate font-sans">{user.email}</p>
                      </div>
                      <Link href="/wishlists" onClick={() => setMenuOpen(false)} className="block px-5 py-3 text-sm text-bark hover:bg-cream-200 transition-colors font-sans">
                        Wishlists
                      </Link>
                      <Link href="/collections" onClick={() => setMenuOpen(false)} className="block px-5 py-3 text-sm text-bark hover:bg-cream-200 transition-colors font-sans">
                        Collections
                      </Link>
                      <button onClick={signOut} className="w-full text-left px-5 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors border-t border-cream-300 font-sans">
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="btn-dark text-sm px-6 py-2"
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
