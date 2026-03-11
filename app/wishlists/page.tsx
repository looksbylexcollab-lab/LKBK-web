'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useAuth } from '@/components/AuthProvider'

interface Wishlist {
  id: string
  name: string
  emoji: string
  is_shared: boolean
  share_token: string | null
  item_count: number
  claimed_count: number
}

export default function WishlistsPage() {
  const { user, supabase, loading } = useAuth()
  const router = useRouter()
  const [wishlists, setWishlists] = useState<Wishlist[]>([])
  const [fetching, setFetching] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [newEmoji, setNewEmoji] = useState('❤️')

  useEffect(() => {
    if (!loading && !user) router.replace('/login')
  }, [user, loading, router])

  useEffect(() => {
    if (user) fetchWishlists()
  }, [user])

  async function fetchWishlists() {
    const { data } = await supabase
      .from('wishlists')
      .select(`id, name, emoji, is_shared, share_token, wishlist_items(is_claimed)`)
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })

    setWishlists(
      (data ?? []).map((w: { id: string; name: string; emoji: string; is_shared: boolean; share_token: string | null; wishlist_items: { is_claimed: boolean }[] }) => ({
        id: w.id,
        name: w.name,
        emoji: w.emoji,
        is_shared: w.is_shared,
        share_token: w.share_token,
        item_count: w.wishlist_items.length,
        claimed_count: w.wishlist_items.filter((i) => i.is_claimed).length,
      }))
    )
    setFetching(false)
  }

  async function handleCreate() {
    if (!newName.trim() || !user) return
    const token = crypto.randomUUID()
    const { data } = await supabase
      .from('wishlists')
      .insert({ user_id: user.id, name: newName.trim(), emoji: newEmoji, share_token: token })
      .select('id')
      .single()
    if (data) {
      setNewName('')
      setCreating(false)
      await fetchWishlists()
      router.push(`/wishlists/${data.id}`)
    }
  }

  if (loading || fetching) return null

  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">My Wishlists</h1>
          <button
            onClick={() => setCreating(true)}
            className="flex items-center gap-2 bg-black text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-gray-800 transition-colors"
          >
            <span>+</span> New Wishlist
          </button>
        </div>

        {creating && (
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-6 space-y-4">
            <p className="font-semibold">New Wishlist</p>
            <div className="flex gap-2">
              {['❤️','🎁','🛍️','⭐','✨','🎀','💫','🌸'].map((e) => (
                <button
                  key={e}
                  onClick={() => setNewEmoji(e)}
                  className={`text-xl w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                    newEmoji === e ? 'bg-gray-200 ring-2 ring-black' : 'hover:bg-gray-100'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Birthday Wishlist, Holiday Gift Ideas…"
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gray-400"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              />
              <button onClick={handleCreate} disabled={!newName.trim()} className="bg-black text-white text-sm font-semibold px-6 py-2.5 rounded-xl disabled:opacity-40">
                Create
              </button>
              <button onClick={() => setCreating(false)} className="text-gray-400 text-sm px-4">Cancel</button>
            </div>
          </div>
        )}

        {wishlists.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <div className="text-5xl mb-4">❤️</div>
            <p className="text-xl font-medium mb-2">No wishlists yet</p>
            <p className="text-sm mb-6">Create a wishlist and share it with friends and family.</p>
            <Link href="/shop" className="bg-black text-white font-semibold px-6 py-3 rounded-full text-sm">
              Start Discovering
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {wishlists.map((w) => (
              <Link
                key={w.id}
                href={`/wishlists/${w.id}`}
                className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl hover:border-gray-200 hover:shadow-sm transition-all"
              >
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                  {w.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold">{w.name}</p>
                  <p className="text-sm text-gray-400">
                    {w.item_count} item{w.item_count !== 1 ? 's' : ''}
                    {w.claimed_count > 0 && ` · ${w.claimed_count} claimed`}
                  </p>
                </div>
                {w.is_shared && (
                  <span className="text-xs bg-green-50 text-green-700 font-medium px-2.5 py-1 rounded-full flex-shrink-0">
                    Shared
                  </span>
                )}
                <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  )
}
