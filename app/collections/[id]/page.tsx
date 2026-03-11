'use client'

import { useEffect, useState } from 'react'
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

export default function CollectionDetailPage() {
  const { user, supabase, loading } = useAuth()
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const [collection, setCollection] = useState<Collection | null>(null)
  const [items, setItems] = useState<Item[]>([])
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    if (!loading && !user) router.replace('/login')
  }, [user, loading, router])

  useEffect(() => {
    if (user && id) fetchCollection()
  }, [user, id])

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
          <h1 className="text-3xl font-bold text-bark">{collection?.name}</h1>
          <p className="text-bark-muted text-sm font-sans">{items.length} item{items.length !== 1 ? 's' : ''}</p>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-24 text-bark-muted">
            <div className="w-16 h-16 bg-cream-300 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z" />
              </svg>
            </div>
            <p className="text-lg font-bold text-bark mb-2">This collection is empty</p>
            <p className="text-sm mb-6 font-sans">Save products from visual search into this collection.</p>
            <Link href="/shop" className="btn-dark inline-block px-6 py-3 text-sm">
              Discover Products
            </Link>
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
    </>
  )
}
