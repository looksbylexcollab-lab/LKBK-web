'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useAuth } from '@/components/AuthProvider'

interface Item {
  id: string
  product: {
    id: string
    name: string
    brand: string | null
    price: string | null
    image_url: string | null
    shop_url: string | null
  }
}

interface Collection {
  id: string
  name: string
}

interface ScrapedProduct {
  name: string
  brand: string | null
  price: string | null
  imageUrl: string | null
  shopUrl: string | null
}

export default function CollectionDetailPage() {
  const { user, supabase, loading } = useAuth()
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const [collection, setCollection] = useState<Collection | null>(null)
  const [items, setItems] = useState<Item[]>([])
  const [fetching, setFetching] = useState(true)

  // Add product modal state
  const [showAddModal, setShowAddModal] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const [scraping, setScraping] = useState(false)
  const [scraped, setScraped] = useState<ScrapedProduct | null>(null)
  const [scrapeError, setScrapeError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!loading && !user) router.replace('/login')
  }, [user, loading, router])

  useEffect(() => {
    if (user && id) fetchCollection()
  }, [user, id])

  // Focus input when modal opens
  useEffect(() => {
    if (showAddModal) {
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      setUrlInput('')
      setScraped(null)
      setScrapeError(null)
      setSaved(false)
    }
  }, [showAddModal])

  async function fetchCollection() {
    const { data } = await supabase
      .from('collections')
      .select(`id, name, collection_items(id, product:products(id, name, brand, price, image_url, shop_url))`)
      .eq('id', id)
      .eq('user_id', user!.id)
      .single()

    if (!data) { router.replace('/collections'); return }
    setCollection({ id: data.id, name: data.name })
    setItems((data.collection_items ?? []) as unknown as Item[])
    setFetching(false)
  }

  async function removeItem(itemId: string) {
    await supabase.from('collection_items').delete().eq('id', itemId)
    setItems((prev) => prev.filter((i) => i.id !== itemId))
  }

  async function handleScrape() {
    if (!urlInput.trim()) return
    setScraping(true)
    setScraped(null)
    setScrapeError(null)
    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput.trim() }),
      })
      const data = await res.json()
      if (!res.ok || data.error) {
        setScrapeError(data.error ?? 'Could not extract product info from that URL.')
      } else {
        setScraped({
          name: data.name ?? 'Unknown Product',
          brand: data.brand ?? null,
          price: data.price ?? null,
          imageUrl: data.imageUrl ?? null,
          shopUrl: data.shopUrl ?? urlInput.trim(),
        })
      }
    } catch {
      setScrapeError('Network error. Please check your connection.')
    } finally {
      setScraping(false)
    }
  }

  async function handleAddToCollection() {
    if (!scraped || !user) return
    setSaving(true)
    const { data: prod, error } = await supabase
      .from('products')
      .insert({
        user_id: user.id,
        name: scraped.name,
        brand: scraped.brand,
        price: scraped.price,
        image_url: scraped.imageUrl,
        shop_url: scraped.shopUrl,
      })
      .select('id')
      .single()

    if (error || !prod) { setSaving(false); return }

    await supabase.from('collection_items').insert({ collection_id: id, product_id: prod.id })
    setSaved(true)
    setSaving(false)
    await fetchCollection()
    setTimeout(() => setShowAddModal(false), 800)
  }

  if (loading || fetching) return null

  return (
    <>
      <Header />
      <main className="max-w-5xl mx-auto px-6 py-12">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-sm font-sans">
          <Link href="/collections" className="text-bark-muted hover:text-bark transition-colors">Collections</Link>
          <span className="text-bark-subtle">/</span>
          <span className="text-bark">{collection?.name}</span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-bark">{collection?.name}</h1>
            <p className="text-bark-muted text-sm font-sans mt-1">{items.length} item{items.length !== 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-dark flex items-center gap-2 px-5 py-2.5 text-sm"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Product
          </button>
        </div>

        {/* Product grid */}
        {items.length === 0 ? (
          <div className="text-center py-24 text-bark-muted">
            <div className="w-16 h-16 bg-cream-300 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z" />
              </svg>
            </div>
            <p className="text-lg font-bold text-bark mb-2">This collection is empty</p>
            <p className="text-sm mb-6 font-sans">Paste a product URL or discover products to add.</p>
            <button onClick={() => setShowAddModal(true)} className="btn-dark inline-block px-6 py-3 text-sm">
              Add Your First Product
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((item) => {
              const p = item.product
              return (
                <div key={item.id} className="group bg-white border border-cream-400 rounded-2xl overflow-hidden hover:border-cream-500 transition-colors">
                  <div className="relative aspect-square bg-cream-200">
                    {p.image_url ? (
                      <Image src={p.image_url} alt={p.name} fill className="object-cover" unoptimized />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-cream-500 text-3xl">◇</div>
                    )}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="absolute top-2 right-2 w-7 h-7 bg-white/90 border border-cream-400 rounded-full flex items-center justify-center
                                 opacity-0 group-hover:opacity-100 transition-opacity text-bark-muted hover:text-red-500 text-xs"
                      title="Remove"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="p-3">
                    {p.brand && <p className="text-xs text-tan-400 mb-0.5 uppercase tracking-wide font-sans" style={{ fontSize: '9px' }}>{p.brand}</p>}
                    <p className="text-sm font-medium text-bark line-clamp-2 mb-1 font-sans">{p.name}</p>
                    {p.price && <p className="text-xs text-bark font-semibold mb-2 font-sans">{p.price}</p>}
                    {p.shop_url && (
                      <a
                        href={p.shop_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full text-center bg-bark hover:bg-bark-light text-white text-xs font-semibold py-2 rounded-full transition-colors font-sans"
                      >
                        Shop Now
                      </a>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
      <Footer />

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
          <div
            className="bg-white rounded-t-3xl md:rounded-2xl w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag handle (mobile) */}
            <div className="flex justify-center pt-3 pb-1 md:hidden">
              <div className="w-10 h-1 bg-cream-400 rounded-full" />
            </div>

            {/* Modal header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-cream-300">
              <h2 className="text-lg font-bold text-bark">Add Product</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 flex items-center justify-center text-bark-muted hover:text-bark rounded-full hover:bg-cream-200 transition-colors text-xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="px-6 py-5">
              {/* URL input */}
              <p className="text-sm text-bark-muted mb-3 font-sans">Paste a product URL from any website, Instagram, or TikTok.</p>
              <div className="flex gap-2 mb-4">
                <input
                  ref={inputRef}
                  type="url"
                  value={urlInput}
                  onChange={(e) => { setUrlInput(e.target.value); setScraped(null); setScrapeError(null) }}
                  placeholder="https://..."
                  className="flex-1 bg-cream-200 border border-cream-400 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-bark text-bark font-sans"
                  onKeyDown={(e) => e.key === 'Enter' && handleScrape()}
                />
                <button
                  onClick={handleScrape}
                  disabled={scraping || !urlInput.trim()}
                  className="btn-dark px-5 py-2.5 text-xs disabled:opacity-40 whitespace-nowrap"
                >
                  {scraping ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      Finding…
                    </span>
                  ) : 'Find Product'}
                </button>
              </div>

              {/* Error */}
              {scrapeError && (
                <p className="text-sm text-red-500 mb-4 font-sans">{scrapeError}</p>
              )}

              {/* Product preview */}
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

              {/* Save button */}
              <button
                onClick={handleAddToCollection}
                disabled={!scraped || saving || saved}
                className={`w-full py-3 rounded-xl font-semibold text-sm transition-all font-sans ${
                  saved
                    ? 'bg-green-500 text-white'
                    : scraped
                    ? 'bg-bark hover:bg-bark-light text-white'
                    : 'bg-cream-300 text-bark-subtle cursor-not-allowed'
                }`}
              >
                {saved ? '✓ Added to collection!' : saving ? 'Saving…' : `Add to ${collection?.name ?? 'Collection'}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
