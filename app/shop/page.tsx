'use client'

import { useState, useRef } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ProductCard from '@/components/ProductCard'
import SaveModal from '@/components/SaveModal'
import type { SaveProduct } from '@/components/SaveModal'

interface Product extends SaveProduct {
  isExactMatch: boolean
  searchQuery: string | null
}

export default function ShopPage() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [products, setProducts] = useState<Product[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saveTarget, setSaveTarget] = useState<SaveProduct | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [scrapedProduct, setScrapedProduct] = useState<SaveProduct | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function search(body: object) {
    setLoading(true)
    setError(null)
    setProducts(null)

    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok || data.error) setError(data.error ?? 'Something went wrong. Please try again.')
      else setProducts(data.products ?? [])
    } catch {
      setError('Network error. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  async function handleUrlSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!url.trim()) return
    setScrapedProduct(null)
    await search({ url: url.trim() })
  }

  async function handleSaveFromUrl(e: React.FormEvent) {
    e.preventDefault()
    if (!url.trim()) return
    setSaving(true)
    setError(null)
    setScrapedProduct(null)
    setProducts(null)
    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      })
      const data = await res.json()
      if (!res.ok || data.error) {
        setError(data.error ?? 'Could not extract product info from that URL.')
      } else {
        setScrapedProduct({
          name: data.name ?? 'Unknown Product',
          brand: data.brand ?? null,
          estimatedPrice: data.price ?? null,
          imageUrl: data.imageUrl ?? null,
          shopUrl: data.shopUrl ?? url.trim(),
          category: null,
        })
      }
    } catch {
      setError('Network error. Please check your connection.')
    } finally {
      setSaving(false)
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async () => {
      const dataUrl = reader.result as string
      setPreviewUrl(dataUrl)
      const imageBase64 = dataUrl.split(',')[1]
      await search({ imageBase64 })
    }
    reader.readAsDataURL(file)
  }

  return (
    <>
      <Header />

      {/* Hero search */}
      <section className="bg-charcoal">
        <div className="max-w-3xl mx-auto px-8 py-24 text-center">
          <p className="label-caps text-gold-300 mb-4">Visual Search</p>
          <div className="w-10 h-px bg-gold-300 mx-auto mb-8" />
          <h1 className="text-4xl md:text-5xl font-light text-pearl-100 tracking-wide mb-4">
            Discover any product
          </h1>
          <p className="text-pearl-400 text-sm font-light mb-12">
            Paste a link from Instagram, TikTok, or any website — or upload a photo.
          </p>

          <form className="flex gap-0">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste a URL…"
              className="flex-1 bg-white/5 border border-white/20 border-r-0 px-6 py-4 text-pearl-100 placeholder-pearl-400/50 focus:outline-none focus:border-gold-300 transition-colors text-sm font-light"
            />
            <button
              type="submit"
              onClick={handleSaveFromUrl}
              disabled={loading || saving || !url.trim()}
              className="bg-white/10 hover:bg-white/20 disabled:opacity-40 text-pearl-100 label-caps px-6 py-4 transition-colors whitespace-nowrap border border-white/20 border-r-0"
            >
              {saving ? '…' : 'Save'}
            </button>
            <button
              type="button"
              onClick={handleUrlSearch}
              disabled={loading || saving || !url.trim()}
              className="bg-gold-300 hover:bg-gold-200 disabled:opacity-40 text-charcoal label-caps px-6 py-4 transition-colors whitespace-nowrap"
            >
              {loading ? '…' : 'Find Similar'}
            </button>
          </form>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="mt-4 label-caps text-pearl-400 hover:text-gold-300 transition-colors"
          >
            or upload a photo
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />

          {previewUrl && (
            <div className="mt-8 flex flex-col items-center gap-3">
              <img
                src={previewUrl}
                alt="Uploaded photo"
                className="w-40 h-40 object-cover border border-white/20"
              />
              <button
                onClick={() => { setPreviewUrl(null); setProducts(null); setError(null) }}
                className="label-caps text-pearl-400/60 hover:text-pearl-400 transition-colors text-xs"
              >
                clear
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Scraped product direct save */}
      {scrapedProduct && (
        <section className="max-w-2xl mx-auto px-8 py-16">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px flex-1 bg-pearl-300" />
            <p className="label-caps text-charcoal-muted">Product found</p>
            <div className="h-px flex-1 bg-pearl-300" />
          </div>
          <div className="flex gap-6 border border-pearl-200 p-6">
            {scrapedProduct.imageUrl ? (
              <img src={scrapedProduct.imageUrl} alt={scrapedProduct.name} className="w-32 h-32 object-cover flex-shrink-0" />
            ) : (
              <div className="w-32 h-32 bg-pearl-100 flex items-center justify-center text-pearl-300 text-3xl flex-shrink-0">◇</div>
            )}
            <div className="flex flex-col justify-between flex-1 min-w-0">
              <div>
                {scrapedProduct.brand && (
                  <p className="label-caps text-charcoal-muted mb-1">{scrapedProduct.brand}</p>
                )}
                <p className="text-charcoal font-light text-lg leading-snug mb-2">{scrapedProduct.name}</p>
                {scrapedProduct.estimatedPrice && (
                  <p className="text-gold-400 text-sm">{scrapedProduct.estimatedPrice}</p>
                )}
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setSaveTarget(scrapedProduct)}
                  className="bg-charcoal hover:bg-charcoal-light text-pearl-100 label-caps px-6 py-3 transition-colors"
                >
                  Save Product
                </button>
                {scrapedProduct.shopUrl && (
                  <a
                    href={scrapedProduct.shopUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border border-pearl-300 hover:border-charcoal text-charcoal label-caps px-6 py-3 transition-colors"
                  >
                    Shop Now
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Results */}
      <section className="max-w-6xl mx-auto px-8 py-20 min-h-[40vh]">
        {(loading || saving) && (
          <div className="flex flex-col items-center justify-center py-28 text-charcoal-muted">
            <div className="w-8 h-8 border border-gold-300 border-t-transparent rounded-full animate-spin mb-6" />
            <p className="label-caps text-gold-400">{saving ? 'Fetching product…' : 'Scanning image…'}</p>
          </div>
        )}

        {error && (
          <div className="text-center py-28">
            <p className="text-sm text-red-400 mb-2">{error}</p>
            <p className="label-caps text-charcoal-muted">Try a different URL or upload an image directly.</p>
          </div>
        )}

        {products && products.length === 0 && (
          <div className="text-center py-28 text-charcoal-muted">
            <div className="w-10 h-10 border border-pearl-300 flex items-center justify-center mx-auto mb-6 text-xl">◇</div>
            <p className="text-sm font-light mb-2">No products found</p>
            <p className="label-caps">Try a clearer image or a direct product page URL.</p>
          </div>
        )}

        {products && products.length > 0 && (
          <>
            <div className="flex items-center gap-4 mb-10">
              <div className="h-px flex-1 bg-pearl-300" />
              <p className="label-caps text-charcoal-muted">
                {products.length} result{products.length !== 1 ? 's' : ''}
                {products[0]?.searchQuery ? ` — ${products[0].searchQuery}` : ''}
              </p>
              <div className="h-px flex-1 bg-pearl-300" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((p, i) => (
                <ProductCard key={i} product={p} onSave={setSaveTarget} />
              ))}
            </div>
            <p className="label-caps text-charcoal-muted text-center mt-12">
              Prices are estimates · LKBK earns a commission on qualifying purchases
            </p>
          </>
        )}

        {!loading && !saving && !products && !error && !scrapedProduct && (
          <div className="text-center py-28 text-charcoal-muted">
            <div className="w-10 h-10 border border-pearl-300 flex items-center justify-center mx-auto mb-6 text-xl">◈</div>
            <p className="text-sm font-light mb-2">Paste a link to get started</p>
            <p className="label-caps">Works with Instagram, TikTok, Amazon, and more.</p>
          </div>
        )}
      </section>

      <SaveModal product={saveTarget} onClose={() => setSaveTarget(null)} />
      <Footer />
    </>
  )
}
