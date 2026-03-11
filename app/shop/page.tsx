'use client'

import { useState, useRef } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ProductCard from '@/components/ProductCard'

interface Product {
  name: string
  brand: string | null
  category: string | null
  estimatedPrice: string | null
  description: string | null
  isExactMatch: boolean
  imageUrl: string | null
  shopUrl: string | null
  searchQuery: string | null
}

export default function ShopPage() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState<Product[] | null>(null)
  const [error, setError] = useState<string | null>(null)
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

      if (!res.ok || data.error) {
        setError(data.error ?? 'Something went wrong. Please try again.')
      } else {
        setProducts(data.products ?? [])
      }
    } catch {
      setError('Network error. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  async function handleUrlSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!url.trim()) return
    await search({ url: url.trim() })
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async () => {
      const dataUrl = reader.result as string
      const imageBase64 = dataUrl.split(',')[1]
      await search({ imageBase64 })
    }
    reader.readAsDataURL(file)
  }

  return (
    <>
      <Header />

      <section className="bg-black text-white px-6 py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Discover any product</h1>
        <p className="text-gray-400 text-lg mb-10">
          Paste a link from Instagram, TikTok, or any website — or upload a photo.
        </p>

        <form onSubmit={handleUrlSearch} className="max-w-2xl mx-auto flex gap-3">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste a product or social media URL…"
            className="flex-1 bg-white/10 border border-white/20 rounded-full px-5 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-400 transition-colors"
          />
          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="bg-brand-500 hover:bg-brand-400 disabled:opacity-50 text-white font-semibold px-8 py-3 rounded-full transition-colors whitespace-nowrap"
          >
            {loading ? 'Searching…' : 'Search'}
          </button>
        </form>

        <div className="mt-4">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="text-gray-400 hover:text-white text-sm underline underline-offset-2 transition-colors"
          >
            or upload a photo
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-16 min-h-[40vh]">
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <div className="w-10 h-10 border-4 border-brand-400 border-t-transparent rounded-full animate-spin mb-4" />
            <p>Our AI is scanning the image…</p>
          </div>
        )}

        {error && (
          <div className="text-center py-20">
            <p className="text-red-500 font-medium">{error}</p>
            <p className="text-gray-400 text-sm mt-2">Try a different URL or upload an image directly.</p>
          </div>
        )}

        {products && products.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <p className="text-xl font-medium mb-2">No products found</p>
            <p className="text-sm">Try a clearer image or a direct product page URL.</p>
          </div>
        )}

        {products && products.length > 0 && (
          <>
            <p className="text-sm text-gray-500 mb-8">
              Found {products.length} product{products.length !== 1 ? 's' : ''}
              {products[0].searchQuery ? ` for "${products[0].searchQuery}"` : ''}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((p, i) => (
                <ProductCard key={i} product={p} />
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-10 text-center">
              LKBK earns a commission on qualifying purchases through affiliate links. Prices shown are estimates.
            </p>
          </>
        )}

        {!loading && !products && !error && (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-4">🔍</p>
            <p className="text-lg font-medium mb-1">Paste a link to get started</p>
            <p className="text-sm">Works with Instagram, TikTok, Amazon, and more.</p>
          </div>
        )}
      </section>

      <Footer />
    </>
  )
}
