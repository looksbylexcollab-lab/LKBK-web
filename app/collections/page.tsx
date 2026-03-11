'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useAuth } from '@/components/AuthProvider'

interface Collection {
  id: string
  name: string
  item_count: number
  cover_images: string[]
}

export default function CollectionsPage() {
  const { user, supabase, loading } = useAuth()
  const router = useRouter()
  const [collections, setCollections] = useState<Collection[]>([])
  const [fetching, setFetching] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')

  useEffect(() => {
    if (!loading && !user) router.replace('/login')
  }, [user, loading, router])

  useEffect(() => {
    if (user) fetchCollections()
  }, [user])

  async function fetchCollections() {
    const { data } = await supabase
      .from('collections')
      .select(`id, name, collection_items(product:products(image_url))`)
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })

    setCollections(
      (data ?? []).map((c: { id: string; name: string; collection_items: { product: { image_url: string | null } }[] }) => ({
        id: c.id,
        name: c.name,
        item_count: c.collection_items.length,
        cover_images: c.collection_items
          .map((i) => i.product?.image_url)
          .filter(Boolean)
          .slice(0, 4) as string[],
      }))
    )
    setFetching(false)
  }

  async function handleCreate() {
    if (!newName.trim() || !user) return
    const { data } = await supabase
      .from('collections')
      .insert({ user_id: user.id, name: newName.trim() })
      .select('id')
      .single()
    if (data) {
      setNewName('')
      setCreating(false)
      await fetchCollections()
      router.push(`/collections/${data.id}`)
    }
  }

  if (loading || fetching) return null

  return (
    <>
      <Header />
      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">My Collections</h1>
          <button
            onClick={() => setCreating(true)}
            className="flex items-center gap-2 bg-black text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-gray-800 transition-colors"
          >
            <span>+</span> New Collection
          </button>
        </div>

        {creating && (
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-6">
            <p className="font-semibold mb-3">New Collection</p>
            <div className="flex gap-3">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Summer Fits, Resort Wear…"
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gray-400"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              />
              <button onClick={handleCreate} disabled={!newName.trim()} className="bg-black text-white text-sm font-semibold px-6 py-2.5 rounded-xl disabled:opacity-40">
                Create
              </button>
              <button onClick={() => setCreating(false)} className="text-gray-400 text-sm px-4">
                Cancel
              </button>
            </div>
          </div>
        )}

        {collections.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <div className="text-5xl mb-4">📁</div>
            <p className="text-xl font-medium mb-2">No collections yet</p>
            <p className="text-sm mb-6">Save products from visual search into curated collections.</p>
            <Link href="/shop" className="bg-black text-white font-semibold px-6 py-3 rounded-full text-sm">
              Start Discovering
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {collections.map((c) => (
              <Link key={c.id} href={`/collections/${c.id}`} className="group">
                <div className="rounded-2xl overflow-hidden bg-gray-100 aspect-square relative mb-3">
                  {c.cover_images.length === 0 ? (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-5xl">📁</div>
                  ) : c.cover_images.length < 4 ? (
                    <Image src={c.cover_images[0]} alt={c.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" unoptimized />
                  ) : (
                    <div className="grid grid-cols-2 h-full">
                      {c.cover_images.map((img, i) => (
                        <div key={i} className="relative overflow-hidden">
                          <Image src={img} alt="" fill className="object-cover group-hover:scale-105 transition-transform duration-300" unoptimized />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <p className="font-semibold text-sm">{c.name}</p>
                <p className="text-xs text-gray-400">{c.item_count} item{c.item_count !== 1 ? 's' : ''}</p>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  )
}
