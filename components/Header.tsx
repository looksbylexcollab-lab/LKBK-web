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
    <header className="bg-black text-white sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold tracking-tight">LKBK</Link>

        <nav className="flex items-center gap-6">
          <Link href="/shop" className="text-sm text-gray-300 hover:text-white transition-colors">
            Shop
          </Link>
          {user && (
            <>
              <Link href="/wishlists" className="text-sm text-gray-300 hover:text-white transition-colors">
                Wishlists
              </Link>
              <Link href="/collections" className="text-sm text-gray-300 hover:text-white transition-colors">
                Collections
              </Link>
            </>
          )}
          <Link href="/about" className="text-sm text-gray-300 hover:text-white transition-colors hidden md:block">
            About
          </Link>

          {!loading && (
            user ? (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen((o) => !o)}
                  className="w-9 h-9 bg-brand-500 rounded-full flex items-center justify-center text-white font-semibold text-sm hover:bg-brand-400 transition-colors"
                >
                  {user.email?.[0]?.toUpperCase() ?? 'U'}
                </button>
                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                    <div className="absolute right-0 top-12 bg-white text-gray-900 rounded-xl shadow-lg border border-gray-100 w-48 z-50 overflow-hidden">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                      </div>
                      <Link href="/wishlists" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-gray-50 transition-colors">
                        ❤️ Wishlists
                      </Link>
                      <Link href="/collections" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-gray-50 transition-colors">
                        📁 Collections
                      </Link>
                      <button onClick={signOut} className="w-full text-left flex items-center gap-2 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors border-t border-gray-100">
                        Sign out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="bg-brand-500 hover:bg-brand-400 text-white text-sm font-semibold px-5 py-2 rounded-full transition-colors"
              >
                Sign in
              </Link>
            )
          )}
        </nav>
      </div>
    </header>
  )
}
