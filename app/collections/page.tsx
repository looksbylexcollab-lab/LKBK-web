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

function CollectionMosaic({ images }: { images: string[] }) {
  if (images.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-cream-300">
        <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="text-cream-500">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
        </svg>
      </div>
    )
  }

  if (images.length === 1) {
    return (
      <div className="relative w-full h-full">
        <Image src={images[0]} alt="" fill className="object-cover" unoptimized />
      </div>
    )
  }

  if (images.length === 2) {
    return (
      <div className="flex w-full h-full gap-0.5">
        {images.map((img, i) => (
          <div key={i} className="relative flex-1">
            <Image src={img} alt="" fill className="object-cover" unoptimized />
          </div>
        ))}
      </div>
    )
  }

  // 3+ images: large left (~60%) + 2 stacked right (~40%)
  return (
    <div className="flex w-full h-full gap-0.5">
      <div className="relative" style={{ flex: '1.5' }}>
        <Image src={images[0]} alt="" fill className="object-cover" unoptimized />
      </div>
      <div className="flex flex-col gap-0.5" style={{ flex: '1' }}>
        <div className="relative flex-1">
          <Image src={images[1]} alt="" fill className="object-cover" unoptimized />
        </div>
        <div className="relative flex-1">
          <Image src={images[2]} alt="" fill className="object-cover" unoptimized />
        </div>
      </div>
    </div>
  )
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
          .slice(0, 3) as string[],
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
      <main className="max-w-3xl mx-auto px-6 py-12">

        {/* Page header */}
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-bark">Collections</h1>
          <button
            onClick={() => setCreating((v) => !v)}
            className="w-10 h-10 bg-bark hover:bg-bark-light text-white rounded-full flex items-center justify-center transition-colors text-xl leading-none"
            aria-label="New collection"
          >
            +
          </button>
        </div>
        <p className="text-bark-muted text-sm mb-8 font-sans">Organize your saved finds into themed collections.</p>

        {/* Create form */}
        {creating && (
          <div className="bg-cream-300 border border-cream-400 rounded-2xl p-5 mb-6">
            <p className="font-semibold text-bark mb-3 font-sans text-sm">New Collection</p>
            <div className="flex gap-3">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Summer Fits, Resort Wear…"
                className="flex-1 bg-white border border-cream-400 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-bark text-bark font-sans"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              />
              <button onClick={handleCreate} disabled={!newName.trim()} className="btn-dark px-5 py-2.5 text-xs disabled:opacity-40">
                Create
              </button>
              <button onClick={() => setCreating(false)} className="text-bark-muted text-sm px-3 font-sans">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Empty state */}
        {collections.length === 0 ? (
          <div className="text-center py-24 text-bark-muted">
            <div className="w-16 h-16 bg-cream-300 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
              </svg>
            </div>
            <p className="text-lg font-bold text-bark mb-2">No collections yet</p>
            <p className="text-sm mb-6 font-sans">Save products from visual search into curated collections.</p>
            <Link href="/shop" className="btn-dark inline-block px-6 py-3 text-sm">
              Start Discovering
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {collections.map((c) => (
              <Link key={c.id} href={`/collections/${c.id}`} className="group block">
                <div className="bg-cream-300 rounded-2xl overflow-hidden border border-cream-400 hover:border-cream-500 transition-colors">
                  {/* Mosaic */}
                  <div className="relative overflow-hidden" style={{ aspectRatio: '4/3' }}>
                    <CollectionMosaic images={c.cover_images} />
                  </div>
                  {/* Footer */}
                  <div className="px-4 py-3.5 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-bark text-sm font-sans">{c.name}</p>
                      <p className="text-xs text-bark-muted font-sans mt-0.5">{c.item_count} item{c.item_count !== 1 ? 's' : ''}</p>
                    </div>
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-bark-muted flex-shrink-0">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  )
}
