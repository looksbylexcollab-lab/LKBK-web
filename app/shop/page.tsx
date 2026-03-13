'use client'

import { useState, useRef } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ProductCard from '@/components/ProductCard'
import SaveModal from '@/components/SaveModal'
import VideoScrubber from '@/components/VideoScrubber'
import ImageCropSelector from '@/components/ImageCropSelector'
import type { SaveProduct } from '@/components/SaveModal'

interface Product extends SaveProduct {
  isExactMatch: boolean
  searchQuery: string | null
}

function isVideoUrl(url: string) {
  return /tiktok\.com|instagram\.com\/(reel|p\/|tv\/)|youtube\.com\/(watch|shorts)|youtu\.be/i.test(url)
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
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [videoFallbackBase64, setVideoFallbackBase64] = useState<string | null>(null)
  const [extracting, setExtracting] = useState(false)
  const [cropDataUrl, setCropDataUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function resetAll() {
    setProducts(null); setError(null); setScrapedProduct(null)
    setPreviewUrl(null); setVideoUrl(null); setVideoFallbackBase64(null); setCropDataUrl(null)
  }

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
    resetAll()

    if (isVideoUrl(url.trim())) {
      // Video flow — extract, then show scrubber or thumbnail
      setExtracting(true)
      try {
        const res = await fetch('/api/video-extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: url.trim() }),
        })
        const data = await res.json()

        if (data.videoUrl) {
          // Proxy through Next.js so browser can load CDN video without CORS issues
          setVideoFallbackBase64(data.thumbnailBase64 ?? null)
          setVideoUrl(`/api/video-proxy?url=${encodeURIComponent(data.videoUrl)}`)
        } else if (data.thumbnailBase64) {
          // No playable video, but we have a thumbnail — show crop selector
          // so user can circle the specific item they want to search
          setCropDataUrl(`data:image/jpeg;base64,${data.thumbnailBase64}`)
        } else if (data.thumbnailUrl) {
          // Last resort — try server-side fetch of the URL
          await search({ imageUrl: data.thumbnailUrl })
        } else {
          setError("Couldn't extract a thumbnail from that post. Make sure it's public, or upload a screenshot instead.")
        }
      } catch {
        setError('Network error. Please check your connection.')
      } finally {
        setExtracting(false)
      }
    } else {
      // Regular URL — scrape + visual search
      await search({ url: url.trim() })
    }
  }

  async function handleSaveFromUrl(e: React.FormEvent) {
    e.preventDefault()
    if (!url.trim()) return
    setSaving(true)
    setError(null)
    setScrapedProduct(null)
    setProducts(null)
    setVideoUrl(null)
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
    resetAll()
    const reader = new FileReader()
    reader.onload = () => {
      setCropDataUrl(reader.result as string)
    }
    reader.readAsDataURL(file)
    // Reset input so the same file can be re-selected
    e.target.value = ''
  }

  async function handleCropConfirm(croppedBase64: string) {
    setCropDataUrl(null)
    setPreviewUrl(`data:image/jpeg;base64,${croppedBase64}`)
    await search({ imageBase64: croppedBase64 })
  }

  async function handleFrameCapture(imageBase64: string) {
    setVideoUrl(null)
    setVideoFallbackBase64(null)
    await search({ imageBase64 })
  }

  function handleVideoError() {
    const fallback = videoFallbackBase64
    setVideoUrl(null)
    setVideoFallbackBase64(null)
    if (fallback) {
      // Show the extracted thumbnail in the crop selector so user can pick the area
      setCropDataUrl(`data:image/jpeg;base64,${fallback}`)
    } else {
      setError("Couldn't play this video. Try uploading a screenshot instead.")
    }
  }

  const isVideoMode = !!videoUrl
  const isCropMode = !!cropDataUrl
  const isBusy = loading || saving || extracting

  return (
    <>
      <Header />

      {/* Hero search */}
      <section className="bg-cream-200 border-b border-cream-400">
        <div className="max-w-3xl mx-auto px-8 py-20 text-center">
          <p className="label-caps mb-4">Visual Search</p>
          <h1 className="text-4xl md:text-5xl font-bold text-bark mb-4">
            Discover any product
          </h1>
          <p className="text-bark-muted text-sm mb-10 font-sans">
            Paste a link from Instagram, TikTok, or any website — or upload a photo.
          </p>

          <form className="flex gap-0 rounded-full overflow-hidden border border-cream-500 bg-white shadow-sm">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste a URL…"
              className="flex-1 bg-transparent px-6 py-4 text-bark placeholder-bark-subtle focus:outline-none text-sm font-sans"
            />
            <button
              type="submit"
              onClick={handleSaveFromUrl}
              disabled={isBusy || !url.trim()}
              className="bg-cream-300 hover:bg-cream-400 disabled:opacity-40 text-bark text-xs uppercase tracking-[0.15em] px-5 py-4 transition-colors whitespace-nowrap font-sans border-l border-cream-400"
            >
              {saving ? '…' : 'Save'}
            </button>
            <button
              type="button"
              onClick={handleUrlSearch}
              disabled={isBusy || !url.trim()}
              className="bg-bark hover:bg-bark-light disabled:opacity-40 text-white text-xs uppercase tracking-[0.15em] px-6 py-4 transition-colors whitespace-nowrap font-sans rounded-r-full"
            >
              {loading || extracting ? '…' : isVideoUrl(url) ? 'Open Video' : 'Find Similar'}
            </button>
          </form>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isBusy}
            className="mt-5 text-xs text-bark-muted hover:text-bark transition-colors font-sans uppercase tracking-widest"
          >
            or upload a photo
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />

          {previewUrl && !isVideoMode && (
            <div className="mt-8 flex flex-col items-center gap-3">
              <img src={previewUrl} alt="Preview" className="w-40 h-40 object-cover rounded-2xl border border-cream-400" />
              <button
                onClick={() => { setPreviewUrl(null); setProducts(null); setError(null) }}
                className="text-xs text-bark-subtle hover:text-bark-muted transition-colors font-sans uppercase tracking-widest"
              >
                clear
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Image crop selector */}
      {isCropMode && (
        <section className="max-w-2xl mx-auto px-4 py-12">
          <ImageCropSelector
            dataUrl={cropDataUrl!}
            onCrop={handleCropConfirm}
            onCancel={() => setCropDataUrl(null)}
          />
        </section>
      )}

      {/* Video scrubber */}
      {isVideoMode && (
        <section className="max-w-sm mx-auto px-4 py-12">
          <VideoScrubber
            videoUrl={videoUrl!}
            onCapture={handleFrameCapture}
            onCancel={() => setVideoUrl(null)}
            onVideoError={handleVideoError}
          />
        </section>
      )}

      {/* Scraped product direct save */}
      {scrapedProduct && (
        <section className="max-w-2xl mx-auto px-8 py-16">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px flex-1 bg-cream-400" />
            <p className="label-caps">Product found</p>
            <div className="h-px flex-1 bg-cream-400" />
          </div>
          <div className="flex gap-6 cream-card border border-cream-400 p-6">
            {scrapedProduct.imageUrl ? (
              <img src={scrapedProduct.imageUrl} alt={scrapedProduct.name} className="w-32 h-32 object-cover rounded-xl flex-shrink-0" />
            ) : (
              <div className="w-32 h-32 bg-cream-400 rounded-xl flex items-center justify-center text-bark-subtle text-3xl flex-shrink-0">◇</div>
            )}
            <div className="flex flex-col justify-between flex-1 min-w-0">
              <div>
                {scrapedProduct.brand && <p className="label-caps mb-1">{scrapedProduct.brand}</p>}
                <p className="text-bark font-bold text-lg leading-snug mb-2 font-sans">{scrapedProduct.name}</p>
                {scrapedProduct.estimatedPrice && <p className="text-tan-400 text-sm font-sans">{scrapedProduct.estimatedPrice}</p>}
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={() => setSaveTarget(scrapedProduct)} className="btn-dark px-6 py-2 text-xs">
                  Save Product
                </button>
                {scrapedProduct.shopUrl && (
                  <a href={scrapedProduct.shopUrl} target="_blank" rel="noopener noreferrer" className="btn-outline px-6 py-2 text-xs">
                    Shop Now
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Results */}
      {!isVideoMode && !isCropMode && (
        <section className="max-w-6xl mx-auto px-8 py-20 min-h-[40vh]">
          {(loading || saving || extracting) && (
            <div className="flex flex-col items-center justify-center py-28 text-bark-muted">
              <div className="w-8 h-8 border-2 border-bark border-t-transparent rounded-full animate-spin mb-6" />
              <p className="label-caps">
                {saving ? 'Fetching product…' : extracting ? 'Extracting video…' : 'Scanning image…'}
              </p>
            </div>
          )}

          {error && (
            <div className="text-center py-28">
              <p className="text-sm text-red-500 mb-2 font-sans">{error}</p>
              <p className="label-caps">Try a different URL or upload an image directly.</p>
            </div>
          )}

          {products && products.length === 0 && (
            <div className="text-center py-28 text-bark-muted">
              <div className="w-10 h-10 border border-cream-500 rounded-xl flex items-center justify-center mx-auto mb-6 text-xl">◇</div>
              <p className="text-sm mb-2 font-sans">No products found</p>
              <p className="label-caps">Try a clearer image or a direct product page URL.</p>
            </div>
          )}

          {products && products.length > 0 && (() => {
            const best = products[0]
            const rest = products.slice(1)
            return (
              <>
                {/* Best Result */}
                <div className="flex items-center gap-4 mb-8">
                  <div className="h-px flex-1 bg-cream-400" />
                  <p className="label-caps">Best Result</p>
                  <div className="h-px flex-1 bg-cream-400" />
                </div>
                <div className="max-w-sm mx-auto mb-14">
                  <ProductCard product={best} onSave={setSaveTarget} />
                </div>

                {/* Similar Items */}
                {rest.length > 0 && (
                  <>
                    <div className="flex items-center gap-4 mb-8">
                      <div className="h-px flex-1 bg-cream-400" />
                      <p className="label-caps">Similar Items</p>
                      <div className="h-px flex-1 bg-cream-400" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {rest.map((p, i) => (
                        <ProductCard key={i} product={p} onSave={setSaveTarget} />
                      ))}
                    </div>
                  </>
                )}

                <p className="label-caps text-center mt-12">
                  Prices are estimates · LKBK earns a commission on qualifying purchases
                </p>
              </>
            )
          })()}

          {!loading && !saving && !extracting && !products && !error && !scrapedProduct && (
            <div className="text-center py-28 text-bark-muted">
              <div className="w-10 h-10 border border-cream-500 rounded-xl flex items-center justify-center mx-auto mb-6 text-xl">◈</div>
              <p className="text-sm mb-2 font-sans">Paste a link to get started</p>
              <p className="label-caps">Works with Instagram, TikTok, Amazon, and more.</p>
            </div>
          )}
        </section>
      )}

      <SaveModal product={saveTarget} onClose={() => setSaveTarget(null)} />
      <Footer />
    </>
  )
}
