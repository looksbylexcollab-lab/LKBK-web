import { createClient } from '@supabase/supabase-js'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Image from 'next/image'

interface WishlistItem {
  id: string
  product: {
    name: string
    brand: string | null
    price: string | null
    image_url: string | null
    shop_url: string | null
  }
  is_claimed: boolean
  note: string | null
}

interface Wishlist {
  id: string
  name: string
  emoji: string | null
  user: { display_name: string }
  items: WishlistItem[]
}

async function getWishlist(shareToken: string): Promise<Wishlist | null> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data } = await supabase
    .from('wishlists')
    .select(`
      id, name, emoji,
      user:users(display_name),
      items:wishlist_items(
        id, is_claimed, note,
        product:products(name, brand, price, image_url, shop_url)
      )
    `)
    .eq('share_token', shareToken)
    .eq('is_public', true)
    .single()

  return data as Wishlist | null
}

export default async function WishlistPage({
  params,
}: {
  params: { shareToken: string }
}) {
  const wishlist = await getWishlist(params.shareToken)

  if (!wishlist) {
    return (
      <>
        <Header />
        <main className="max-w-2xl mx-auto px-6 py-20 text-center">
          <p className="text-2xl font-bold mb-2">Wishlist not found</p>
          <p className="text-gray-500">This wishlist may be private or the link may have expired.</p>
        </main>
        <Footer />
      </>
    )
  }

  const unclaimed = wishlist.items.filter((i) => !i.is_claimed)

  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="mb-10">
          <p className="text-gray-500 text-sm mb-1">
            Shared by {(wishlist.user as unknown as { display_name: string }).display_name}
          </p>
          <h1 className="text-4xl font-bold">
            {wishlist.emoji} {wishlist.name}
          </h1>
          <p className="text-gray-400 mt-2">{unclaimed.length} item{unclaimed.length !== 1 ? 's' : ''} available</p>
        </div>

        {unclaimed.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-xl font-medium">All items have been claimed!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {unclaimed.map((item) => {
              const p = item.product
              return (
                <div key={item.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  {p.image_url && (
                    <div className="relative aspect-square bg-gray-50">
                      <Image src={p.image_url} alt={p.name} fill className="object-cover" />
                    </div>
                  )}
                  <div className="p-4">
                    {p.brand && <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{p.brand}</p>}
                    <p className="font-semibold text-gray-900 mb-1 line-clamp-2">{p.name}</p>
                    {p.price && <p className="text-brand-600 font-medium text-sm mb-3">{p.price}</p>}
                    {item.note && <p className="text-gray-400 text-xs italic mb-3">&ldquo;{item.note}&rdquo;</p>}
                    {p.shop_url && (
                      <a
                        href={p.shop_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full text-center bg-black hover:bg-gray-800 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
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

        <p className="text-xs text-gray-400 mt-10 text-center">
          LKBK may earn a commission on qualifying purchases. <a href="/privacy" className="underline">Privacy Policy</a>
        </p>
      </main>
      <Footer />
    </>
  )
}
