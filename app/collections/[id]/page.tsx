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
        <div className="flex items-center gap-3 mb-2">
          <Link href="/collections" className="text-gray-400 hover:text-gray-600 text-sm">Collections</Link>
          <span className="text-gray-300">/</span>
          <span className="text-sm text-gray-600">{collection?.name}</span>
        </div>

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">{collection?.name}</h1>
          <p className="text-gray-400 text-sm">{items.length} item{items.length !== 1 ? 's' : ''}</p>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <div className="text-5xl mb-4">🛍️</div>
            <p className="text-xl font-medium mb-2">This collection is empty</p>
            <p className="text-sm mb-6">Save products from visual search into this collection.</p>
            <Link href="/shop" className="bg-black text-white font-semibold px-6 py-3 rounded-full text-sm">
              Discover Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((item) => {
              const p = item.product
              return (
                <div key={item.id} className="group bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                  <div className="relative aspect-square bg-gray-50">
                    {p.image_url ? (
                      <Image src={p.image_url} alt={p.name} fill className="object-cover" unoptimized />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 text-3xl">🛍️</div>
                    )}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="absolute top-2 right-2 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center shadow-sm
                                 opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-red-500 text-xs"
                      title="Remove"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="p-3">
                    {p.brand && <p className="text-xs text-gray-400 mb-0.5">{p.brand}</p>}
                    <p className="text-sm font-medium line-clamp-2 mb-1">{p.name}</p>
                    {p.price && <p className="text-xs text-brand-600 font-semibold mb-2">{p.price}</p>}
                    {p.shop_url && (
                      <a
                        href={p.shop_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full text-center bg-black text-white text-xs font-semibold py-2 rounded-lg hover:bg-gray-800 transition-colors"
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
