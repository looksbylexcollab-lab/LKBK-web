'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useAuth } from '@/components/AuthProvider'

interface WishlistItem {
  id: string
  note: string | null
  is_claimed: boolean
  product: {
    id: string
    name: string
    brand: string | null
    price: string | null
    image_url: string | null
    shop_url: string | null
  }
}

interface Wishlist {
  id: string
  name: string
  emoji: string
  is_shared: boolean
  share_token: string | null
  items: WishlistItem[]
}

export default function WishlistDetailPage() {
  const { user, supabase, loading } = useAuth()
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const [wishlist, setWishlist] = useState<Wishlist | null>(null)
  const [fetching, setFetching] = useState(true)
  const [copied, setCopied] = useState(false)
  const [toggling, setToggling] = useState(false)

  useEffect(() => {
    if (!loading && !user) router.replace('/login')
  }, [user, loading, router])

  useEffect(() => {
    if (user && id) fetchWishlist()
  }, [user, id])

  async function fetchWishlist() {
    const { data } = await supabase
      .from('wishlists')
      .select(`id, name, emoji, is_shared, share_token,
        items:wishlist_items(id, note, is_claimed, product:products(id, name, brand, price, image_url, shop_url))`)
      .eq('id', id)
      .eq('user_id', user!.id)
      .single()

    if (!data) { router.replace('/wishlists'); return }
    setWishlist(data as unknown as Wishlist)
    setFetching(false)
  }

  async function toggleShare() {
    if (!wishlist) return
    setToggling(true)
    let token = wishlist.share_token
    if (!token) token = crypto.randomUUID()

    const newShared = !wishlist.is_shared
    await supabase.from('wishlists').update({ is_shared: newShared, share_token: token }).eq('id', wishlist.id)
    setWishlist((prev) => prev ? { ...prev, is_shared: newShared, share_token: token } : prev)
    setToggling(false)
  }

  async function removeItem(itemId: string) {
    await supabase.from('wishlist_items').delete().eq('id', itemId)
    setWishlist((prev) =>
      prev ? { ...prev, items: prev.items.filter((i) => i.id !== itemId) } : prev
    )
  }

  function copyShareLink() {
    if (!wishlist?.share_token) return
    navigator.clipboard.writeText(`${window.location.origin}/wishlist/${wishlist.share_token}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading || fetching || !wishlist) return null

  const unclaimedCount = wishlist.items.filter((i) => !i.is_claimed).length
  const claimedCount = wishlist.items.filter((i) => i.is_claimed).length

  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto px-6 py-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-3 mb-2">
          <Link href="/wishlists" className="text-gray-400 hover:text-gray-600 text-sm">Wishlists</Link>
          <span className="text-gray-300">/</span>
          <span className="text-sm text-gray-600">{wishlist.name}</span>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-1">{wishlist.emoji} {wishlist.name}</h1>
            <p className="text-gray-400 text-sm">
              {wishlist.items.length} item{wishlist.items.length !== 1 ? 's' : ''}
              {claimedCount > 0 && ` · ${claimedCount} claimed`}
            </p>
          </div>

          {/* Share controls */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {wishlist.is_shared && wishlist.share_token && (
              <button
                onClick={copyShareLink}
                className="flex items-center gap-2 text-sm border border-gray-200 rounded-full px-4 py-2 hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                {copied ? 'Copied!' : 'Copy link'}
              </button>
            )}
            <button
              onClick={toggleShare}
              disabled={toggling}
              className={`text-sm font-semibold px-4 py-2 rounded-full transition-colors ${
                wishlist.is_shared
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-black text-white hover:bg-gray-800'
              }`}
            >
              {toggling ? '…' : wishlist.is_shared ? '✓ Shared' : 'Share'}
            </button>
          </div>
        </div>

        {wishlist.is_shared && wishlist.share_token && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-8 flex items-center justify-between gap-4">
            <p className="text-sm text-gray-500 truncate">
              shoplkbk.com/wishlist/{wishlist.share_token}
            </p>
            <button onClick={copyShareLink} className="text-xs font-semibold text-black flex-shrink-0 hover:underline">
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        )}

        {wishlist.items.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <div className="text-5xl mb-4">🎁</div>
            <p className="text-xl font-medium mb-2">Your wishlist is empty</p>
            <p className="text-sm mb-6">Discover products and save them here.</p>
            <Link href="/shop" className="bg-black text-white font-semibold px-6 py-3 rounded-full text-sm">
              Discover Products
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {wishlist.items.map((item) => {
              const p = item.product
              return (
                <div
                  key={item.id}
                  className={`flex gap-4 p-4 bg-white border rounded-2xl transition-all group ${
                    item.is_claimed ? 'border-green-100 bg-green-50/30 opacity-70' : 'border-gray-100'
                  }`}
                >
                  <div className="relative w-20 h-20 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                    {p.image_url ? (
                      <Image src={p.image_url} alt={p.name} fill className="object-cover" unoptimized />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 text-2xl">🛍️</div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    {p.brand && <p className="text-xs text-gray-400 mb-0.5">{p.brand}</p>}
                    <p className="font-semibold text-sm line-clamp-2 mb-1">{p.name}</p>
                    {p.price && <p className="text-brand-600 text-xs font-semibold mb-1">{p.price}</p>}
                    {item.note && <p className="text-gray-400 text-xs italic">&ldquo;{item.note}&rdquo;</p>}
                    {item.is_claimed && (
                      <span className="inline-block mt-1 text-xs bg-green-100 text-green-700 font-medium px-2 py-0.5 rounded-full">
                        Claimed
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    {p.shop_url && !item.is_claimed && (
                      <a
                        href={p.shop_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs bg-black text-white font-semibold px-4 py-2 rounded-xl hover:bg-gray-800 transition-colors"
                      >
                        Shop
                      </a>
                    )}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-xs text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {unclaimedCount > 0 && wishlist.is_shared && (
          <p className="text-xs text-gray-400 mt-6 text-center">
            {unclaimedCount} item{unclaimedCount !== 1 ? 's' : ''} visible to gift givers ·{' '}
            <span className="text-gray-500">claimed items are hidden from the wishlist owner</span>
          </p>
        )}
      </main>
      <Footer />
    </>
  )
}
