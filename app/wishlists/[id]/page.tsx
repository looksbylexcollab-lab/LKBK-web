'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useAuth } from '@/components/AuthProvider'

interface WishlistItem {
  id: string
  note: string | null
  size: string | null
  color: string | null
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

function ItemDetails({ item, onSave }: {
  item: WishlistItem
  onSave: (id: string, size: string, color: string, note: string) => Promise<void>
}) {
  const [open, setOpen] = useState(false)
  const [size, setSize] = useState(item.size ?? '')
  const [color, setColor] = useState(item.color ?? '')
  const [note, setNote] = useState(item.note ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const hasSavedDetails = item.size || item.color || item.note

  async function handleSave() {
    setSaving(true)
    await onSave(item.id, size, color, note)
    setSaving(false)
    setSaved(true)
    setTimeout(() => { setSaved(false); setOpen(false) }, 800)
  }

  return (
    <div className="mt-2">
      {/* Saved details summary */}
      {!open && hasSavedDetails && (
        <div className="flex flex-wrap gap-2 mt-1 mb-1">
          {item.size && (
            <span className="inline-flex items-center gap-1 text-xs bg-cream-300 text-bark px-2.5 py-1 rounded-full font-sans">
              <span className="text-bark-muted">Size</span> {item.size}
            </span>
          )}
          {item.color && (
            <span className="inline-flex items-center gap-1 text-xs bg-cream-300 text-bark px-2.5 py-1 rounded-full font-sans">
              <span className="text-bark-muted">Color</span> {item.color}
            </span>
          )}
          {item.note && (
            <span className="text-xs text-bark-muted italic font-sans">&ldquo;{item.note}&rdquo;</span>
          )}
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="text-xs text-tan-400 hover:text-bark transition-colors font-sans underline underline-offset-2"
      >
        {open ? 'Cancel' : hasSavedDetails ? 'Edit details' : '+ Add size, color & note'}
      </button>

      {/* Inline edit form */}
      {open && (
        <div className="mt-3 bg-cream-200 rounded-2xl p-4 space-y-3 border border-cream-400">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-bark-muted mb-1 font-sans uppercase tracking-wide" style={{ fontSize: '10px' }}>Size</label>
              <input
                type="text"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                placeholder="e.g. M, 8, 28x30"
                className="w-full bg-white border border-cream-400 rounded-xl px-3 py-2 text-sm text-bark focus:outline-none focus:border-bark font-sans"
              />
            </div>
            <div>
              <label className="block text-xs text-bark-muted mb-1 font-sans uppercase tracking-wide" style={{ fontSize: '10px' }}>Color</label>
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="e.g. Black, Ivory"
                className="w-full bg-white border border-cream-400 rounded-xl px-3 py-2 text-sm text-bark focus:outline-none focus:border-bark font-sans"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-bark-muted mb-1 font-sans uppercase tracking-wide" style={{ fontSize: '10px' }}>Note for gift giver</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. This runs small, order up a size!"
              rows={2}
              className="w-full bg-white border border-cream-400 rounded-xl px-3 py-2 text-sm text-bark focus:outline-none focus:border-bark font-sans resize-none"
            />
          </div>
          <button
            onClick={handleSave}
            disabled={saving || saved}
            className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors font-sans ${
              saved ? 'bg-green-500 text-white' : 'bg-bark hover:bg-bark-light text-white'
            }`}
          >
            {saved ? '✓ Saved!' : saving ? 'Saving…' : 'Save Details'}
          </button>
        </div>
      )}
    </div>
  )
}

export default function WishlistDetailPage() {
  const { user, supabase, loading } = useAuth()
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const [wishlist, setWishlist] = useState<Wishlist | null>(null)
  const [fetching, setFetching] = useState(true)
  const [copied, setCopied] = useState(false)
  const [toggling, setToggling] = useState(false)

  // Add product modal
  const [showAddModal, setShowAddModal] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const [scraping, setScraping] = useState(false)
  const [scraped, setScraped] = useState<{ name: string; brand: string | null; price: string | null; imageUrl: string | null; shopUrl: string | null } | null>(null)
  const [scrapeError, setScrapeError] = useState<string | null>(null)
  const [addSaving, setAddSaving] = useState(false)
  const [addSaved, setAddSaved] = useState(false)
  const urlInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!loading && !user) router.replace('/login')
  }, [user, loading, router])

  useEffect(() => {
    if (user && id) fetchWishlist()
  }, [user, id])

  useEffect(() => {
    if (showAddModal) {
      setTimeout(() => urlInputRef.current?.focus(), 50)
    } else {
      setUrlInput(''); setScraped(null); setScrapeError(null); setAddSaved(false)
    }
  }, [showAddModal])

  async function handleScrape() {
    if (!urlInput.trim()) return
    setScraping(true); setScraped(null); setScrapeError(null)
    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput.trim() }),
      })
      const data = await res.json()
      if (!res.ok || data.error) setScrapeError(data.error ?? 'Could not extract product info from that URL.')
      else setScraped({ name: data.name ?? 'Unknown Product', brand: data.brand ?? null, price: data.price ?? null, imageUrl: data.imageUrl ?? null, shopUrl: data.shopUrl ?? urlInput.trim() })
    } catch { setScrapeError('Network error. Please check your connection.') }
    finally { setScraping(false) }
  }

  async function handleAddToWishlist() {
    if (!scraped || !user || !wishlist) return
    setAddSaving(true)
    const { data: prod, error } = await supabase
      .from('products')
      .insert({ user_id: user.id, name: scraped.name, brand: scraped.brand, price: scraped.price, image_url: scraped.imageUrl, shop_url: scraped.shopUrl })
      .select('id').single()
    if (error || !prod) { setAddSaving(false); return }
    await supabase.from('wishlist_items').insert({ wishlist_id: wishlist.id, product_id: prod.id })
    setAddSaved(true); setAddSaving(false)
    await fetchWishlist()
    setTimeout(() => setShowAddModal(false), 800)
  }

  async function fetchWishlist() {
    const { data } = await supabase
      .from('wishlists')
      .select(`id, name, emoji, is_shared, share_token,
        items:wishlist_items(id, note, size, color, is_claimed, product:products(id, name, brand, price, image_url, shop_url))`)
      .eq('id', id)
      .eq('user_id', user!.id)
      .single()

    if (!data) { router.replace('/wishlists'); return }
    setWishlist(data as unknown as Wishlist)
    setFetching(false)
  }

  async function saveItemDetails(itemId: string, size: string, color: string, note: string) {
    await supabase
      .from('wishlist_items')
      .update({ size: size || null, color: color || null, note: note || null })
      .eq('id', itemId)
    setWishlist((prev) =>
      prev ? {
        ...prev,
        items: prev.items.map((i) =>
          i.id === itemId ? { ...i, size: size || null, color: color || null, note: note || null } : i
        ),
      } : prev
    )
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
      <main className="max-w-2xl mx-auto px-6 py-12">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-sm font-sans">
          <Link href="/wishlists" className="text-bark-muted hover:text-bark transition-colors">Wishlists</Link>
          <span className="text-bark-subtle">/</span>
          <span className="text-bark">{wishlist.name}</span>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-bark">{wishlist.emoji} {wishlist.name}</h1>
            <p className="text-bark-muted text-sm font-sans mt-1">
              {wishlist.items.length} item{wishlist.items.length !== 1 ? 's' : ''}
              {claimedCount > 0 && ` · ${claimedCount} claimed`}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setShowAddModal(true)}
              className="w-10 h-10 bg-bark hover:bg-bark-light text-white rounded-full flex items-center justify-center transition-colors text-xl leading-none"
              aria-label="Add product"
            >
              +
            </button>
            {wishlist.is_shared && wishlist.share_token && (
              <button
                onClick={copyShareLink}
                className="flex items-center gap-2 text-sm border border-cream-400 rounded-full px-4 py-2 hover:bg-cream-300 transition-colors text-bark font-sans"
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
              className={`text-sm font-semibold px-4 py-2 rounded-full transition-colors font-sans ${
                wishlist.is_shared
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-bark text-white hover:bg-bark-light'
              }`}
            >
              {toggling ? '…' : wishlist.is_shared ? '✓ Shared' : 'Share'}
            </button>
          </div>
        </div>

        {/* Share link banner */}
        {wishlist.is_shared && wishlist.share_token && (
          <div className="bg-cream-300 border border-cream-400 rounded-xl px-4 py-3 mb-8 flex items-center justify-between gap-4">
            <p className="text-sm text-bark-muted truncate font-sans">
              shoplkbk.com/wishlist/{wishlist.share_token}
            </p>
            <button onClick={copyShareLink} className="text-xs font-semibold text-bark flex-shrink-0 hover:underline font-sans">
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        )}

        {/* Items */}
        {wishlist.items.length === 0 ? (
          <div className="text-center py-24 text-bark-muted">
            <div className="w-16 h-16 bg-cream-300 rounded-2xl flex items-center justify-center mx-auto mb-5 text-3xl">🎁</div>
            <p className="text-lg font-bold text-bark mb-2">Your wishlist is empty</p>
            <p className="text-sm mb-6 font-sans">Discover products and save them here.</p>
            <Link href="/shop" className="btn-dark inline-block px-6 py-3 text-sm">
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
                  className={`p-4 bg-white border rounded-2xl transition-all group ${
                    item.is_claimed ? 'border-green-100 bg-green-50/30 opacity-60' : 'border-cream-400'
                  }`}
                >
                  <div className="flex gap-4">
                    {/* Image */}
                    <div className="relative w-20 h-20 bg-cream-200 rounded-xl overflow-hidden flex-shrink-0">
                      {p.image_url ? (
                        <Image src={p.image_url} alt={p.name} fill className="object-cover" unoptimized />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-cream-500 text-2xl">◇</div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      {p.brand && <p className="text-xs text-tan-400 uppercase tracking-wide font-sans mb-0.5" style={{ fontSize: '9px' }}>{p.brand}</p>}
                      <p className="font-semibold text-sm text-bark line-clamp-2 mb-0.5 font-sans">{p.name}</p>
                      {p.price && <p className="text-xs font-semibold text-bark font-sans">{p.price}</p>}
                      {item.is_claimed && (
                        <span className="inline-block mt-1 text-xs bg-green-100 text-green-700 font-medium px-2 py-0.5 rounded-full font-sans">
                          Claimed
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      {p.shop_url && !item.is_claimed && (
                        <a
                          href={p.shop_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs bg-bark hover:bg-bark-light text-white font-semibold px-4 py-2 rounded-full transition-colors font-sans"
                        >
                          Shop
                        </a>
                      )}
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-xs text-cream-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all font-sans"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  {/* Details editor */}
                  {!item.is_claimed && (
                    <ItemDetails item={item} onSave={saveItemDetails} />
                  )}
                </div>
              )
            })}
          </div>
        )}

        {unclaimedCount > 0 && wishlist.is_shared && (
          <p className="text-xs text-bark-subtle mt-6 text-center font-sans">
            {unclaimedCount} item{unclaimedCount !== 1 ? 's' : ''} visible to gift givers ·{' '}
            claimed items are hidden from the wishlist owner
          </p>
        )}
      </main>
      <Footer />

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-white rounded-t-3xl md:rounded-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-center pt-3 pb-1 md:hidden">
              <div className="w-10 h-1 bg-cream-400 rounded-full" />
            </div>
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-cream-300">
              <h2 className="text-lg font-bold text-bark">Add Product</h2>
              <button onClick={() => setShowAddModal(false)} className="w-8 h-8 flex items-center justify-center text-bark-muted hover:text-bark rounded-full hover:bg-cream-200 transition-colors text-xl leading-none">×</button>
            </div>
            <div className="px-6 py-5">
              <p className="text-sm text-bark-muted mb-3 font-sans">Paste a product URL from any website, Instagram, or TikTok.</p>
              <div className="flex gap-2 mb-4">
                <input
                  ref={urlInputRef}
                  type="url"
                  value={urlInput}
                  onChange={(e) => { setUrlInput(e.target.value); setScraped(null); setScrapeError(null) }}
                  placeholder="https://..."
                  className="flex-1 bg-cream-200 border border-cream-400 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-bark text-bark font-sans"
                  onKeyDown={(e) => e.key === 'Enter' && handleScrape()}
                />
                <button onClick={handleScrape} disabled={scraping || !urlInput.trim()} className="btn-dark px-5 py-2.5 text-xs disabled:opacity-40 whitespace-nowrap">
                  {scraping ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                      Finding…
                    </span>
                  ) : 'Find Product'}
                </button>
              </div>
              {scrapeError && <p className="text-sm text-red-500 mb-4 font-sans">{scrapeError}</p>}
              {scraped && (
                <div className="bg-cream-200 rounded-2xl p-4 flex gap-4 mb-5">
                  {scraped.imageUrl ? (
                    <img src={scraped.imageUrl} alt={scraped.name} className="w-20 h-20 object-cover rounded-xl flex-shrink-0" />
                  ) : (
                    <div className="w-20 h-20 bg-cream-400 rounded-xl flex items-center justify-center text-cream-500 text-2xl flex-shrink-0">◇</div>
                  )}
                  <div className="flex-1 min-w-0">
                    {scraped.brand && <p className="text-xs text-tan-400 uppercase tracking-wide font-sans mb-0.5" style={{ fontSize: '9px' }}>{scraped.brand}</p>}
                    <p className="text-sm font-semibold text-bark leading-snug line-clamp-2 font-sans">{scraped.name}</p>
                    {scraped.price && <p className="text-xs text-bark-muted mt-1 font-sans">{scraped.price}</p>}
                  </div>
                </div>
              )}
              <button
                onClick={handleAddToWishlist}
                disabled={!scraped || addSaving || addSaved}
                className={`w-full py-3 rounded-xl font-semibold text-sm transition-all font-sans ${
                  addSaved ? 'bg-green-500 text-white' : scraped ? 'bg-bark hover:bg-bark-light text-white' : 'bg-cream-300 text-bark-subtle cursor-not-allowed'
                }`}
              >
                {addSaved ? '✓ Added to wishlist!' : addSaving ? 'Saving…' : `Add to ${wishlist.name}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
