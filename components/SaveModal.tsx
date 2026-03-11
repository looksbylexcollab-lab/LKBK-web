'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './AuthProvider'

export interface SaveProduct {
  name: string
  brand: string | null
  estimatedPrice: string | null
  imageUrl: string | null
  shopUrl: string | null
  category: string | null
}

interface SaveModalProps {
  product: SaveProduct | null
  onClose: () => void
}

type Tab = 'wishlists' | 'collections'

interface ListOption {
  id: string
  name: string
  emoji?: string
  itemCount: number
}

const EMOJIS = ['❤️', '🎁', '🛍️', '⭐', '✨', '🎀', '💫', '🌸', '👗', '👠']

export default function SaveModal({ product, onClose }: SaveModalProps) {
  const { user, supabase } = useAuth()
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('wishlists')
  const [options, setOptions] = useState<ListOption[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [newEmoji, setNewEmoji] = useState('❤️')

  const fetchOptions = useCallback(async () => {
    if (!user) return
    if (tab === 'wishlists') {
      const { data } = await supabase
        .from('wishlists')
        .select('id, name, emoji, wishlist_items(count)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      setOptions(
        (data ?? []).map((w: { id: string; name: string; emoji: string; wishlist_items: { count: number }[] }) => ({
          id: w.id,
          name: w.name,
          emoji: w.emoji,
          itemCount: w.wishlist_items?.[0]?.count ?? 0,
        }))
      )
    } else {
      const { data } = await supabase
        .from('collections')
        .select('id, name, collection_items(count)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      setOptions(
        (data ?? []).map((c: { id: string; name: string; collection_items: { count: number }[] }) => ({
          id: c.id,
          name: c.name,
          emoji: '📁',
          itemCount: c.collection_items?.[0]?.count ?? 0,
        }))
      )
    }
  }, [user, supabase, tab])

  useEffect(() => {
    if (user && product) fetchOptions()
  }, [user, product, fetchOptions])

  async function handleSave() {
    if (!selected || !product || !user) return
    setSaving(true)

    const { data: prod, error } = await supabase
      .from('products')
      .insert({
        user_id: user.id,
        name: product.name,
        brand: product.brand,
        category: product.category,
        price: product.estimatedPrice,
        image_url: product.imageUrl,
        shop_url: product.shopUrl,
      })
      .select('id')
      .single()

    if (error || !prod) { setSaving(false); return }

    if (tab === 'wishlists') {
      await supabase.from('wishlist_items').insert({ wishlist_id: selected, product_id: prod.id })
    } else {
      await supabase.from('collection_items').insert({ collection_id: selected, product_id: prod.id })
    }

    setSaved(true)
    setSaving(false)
    setTimeout(onClose, 900)
  }

  async function handleCreate() {
    if (!newName.trim() || !user) return
    if (tab === 'wishlists') {
      const { data } = await supabase
        .from('wishlists')
        .insert({ user_id: user.id, name: newName.trim(), emoji: newEmoji })
        .select('id')
        .single()
      if (data) { setSelected(data.id); await fetchOptions(); setCreating(false); setNewName('') }
    } else {
      const { data } = await supabase
        .from('collections')
        .insert({ user_id: user.id, name: newName.trim() })
        .select('id')
        .single()
      if (data) { setSelected(data.id); await fetchOptions(); setCreating(false); setNewName('') }
    }
  }

  if (!product) return null

  // Not signed in — prompt sign in
  if (!user) {
    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-end md:items-center justify-center p-4" onClick={onClose}>
        <div className="bg-white rounded-2xl p-8 w-full max-w-sm text-center" onClick={(e) => e.stopPropagation()}>
          <div className="text-4xl mb-3">❤️</div>
          <p className="text-xl font-bold mb-2">Sign in to save</p>
          <p className="text-gray-500 text-sm mb-6">Create a free account to save products to your wishlists and collections.</p>
          <button onClick={() => router.push('/login')} className="w-full bg-black text-white font-semibold py-3 rounded-xl">
            Sign in / Sign up
          </button>
          <button onClick={onClose} className="mt-3 w-full text-gray-400 text-sm">Not now</button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end md:items-center justify-center" onClick={onClose}>
      <div
        className="bg-white rounded-t-3xl md:rounded-2xl w-full max-w-md flex flex-col"
        style={{ maxHeight: '85vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 md:hidden">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-4 pb-4 border-b border-gray-100">
          <h2 className="text-lg font-bold">Save product</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors text-xl leading-none">
            ×
          </button>
        </div>

        {/* Product preview */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} className="w-14 h-14 rounded-xl object-cover bg-gray-100 flex-shrink-0" />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center text-2xl flex-shrink-0">🛍️</div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm leading-tight line-clamp-2">{product.name}</p>
            {product.brand && <p className="text-xs text-gray-400 mt-0.5">{product.brand}</p>}
            {product.estimatedPrice && <p className="text-brand-600 text-xs font-medium mt-0.5">{product.estimatedPrice}</p>}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex px-6 pt-4 gap-6 border-b border-gray-100">
          {(['wishlists', 'collections'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setSelected(null); setCreating(false) }}
              className={`text-sm font-semibold pb-3 border-b-2 capitalize transition-colors ${
                tab === t ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
          {options.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelected(item.id)}
              className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all ${
                selected === item.id
                  ? 'border-black bg-gray-50'
                  : 'border-gray-100 hover:border-gray-200'
              }`}
            >
              <span className="text-2xl">{item.emoji}</span>
              <div className="flex-1 text-left">
                <p className="font-medium text-sm">{item.name}</p>
                <p className="text-xs text-gray-400">
                  {item.itemCount} item{item.itemCount !== 1 ? 's' : ''}
                </p>
              </div>
              {selected === item.id && (
                <div className="w-5 h-5 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          ))}

          {/* Create new */}
          {creating ? (
            <div className="border-2 border-gray-200 rounded-xl p-3 space-y-3">
              {tab === 'wishlists' && (
                <div>
                  <p className="text-xs text-gray-400 mb-2">Pick an emoji</p>
                  <div className="flex flex-wrap gap-2">
                    {EMOJIS.map((e) => (
                      <button
                        key={e}
                        onClick={() => setNewEmoji(e)}
                        className={`text-xl w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                          newEmoji === e ? 'bg-gray-100 ring-2 ring-black' : 'hover:bg-gray-50'
                        }`}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={tab === 'wishlists' ? 'e.g. Birthday Wishlist' : 'e.g. Summer Fits'}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gray-400"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              />
              <div className="flex gap-2">
                <button onClick={() => setCreating(false)} className="flex-1 text-sm text-gray-500 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!newName.trim()}
                  className="flex-1 text-sm bg-black text-white rounded-xl py-2.5 font-semibold disabled:opacity-40 transition-opacity"
                >
                  Create
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setCreating(true)}
              className="w-full flex items-center gap-3 p-3.5 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-500 transition-colors"
            >
              <div className="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center flex-shrink-0">
                <span className="text-lg leading-none">+</span>
              </div>
              <span className="text-sm font-medium">
                New {tab === 'wishlists' ? 'wishlist' : 'collection'}
              </span>
            </button>
          )}
        </div>

        {/* Save button */}
        <div className="px-6 pt-3 pb-6 border-t border-gray-100">
          <button
            onClick={handleSave}
            disabled={!selected || saving || saved}
            className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all ${
              saved
                ? 'bg-green-500 text-white'
                : selected
                ? 'bg-black hover:bg-gray-800 text-white'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {saved ? '✓ Saved!' : saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
