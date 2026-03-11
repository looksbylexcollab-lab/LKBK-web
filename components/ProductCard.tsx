import Image from 'next/image'

interface Product {
  name: string
  brand: string | null
  estimatedPrice: string | null
  imageUrl: string | null
  shopUrl: string | null
  isExactMatch: boolean
}

export default function ProductCard({ product: p }: { product: Product }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
      <div className="relative aspect-square bg-gray-50">
        {p.imageUrl ? (
          <Image src={p.imageUrl} alt={p.name} fill className="object-cover" unoptimized />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">🛍️</div>
        )}
        {p.isExactMatch && (
          <span className="absolute top-3 left-3 bg-brand-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
            Best match
          </span>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        {p.brand && (
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{p.brand}</p>
        )}
        <p className="font-semibold text-gray-900 mb-1 line-clamp-2 flex-1">{p.name}</p>
        {p.estimatedPrice && (
          <p className="text-brand-600 font-semibold text-sm mb-3">{p.estimatedPrice}</p>
        )}
        <div className="flex items-center gap-1 mb-3">
          <span className="text-xs bg-green-50 text-green-700 font-medium px-2 py-0.5 rounded-full">
            1% cashback
          </span>
        </div>
        {p.shopUrl ? (
          <a
            href={p.shopUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center bg-black hover:bg-gray-800 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
          >
            Shop Now
          </a>
        ) : (
          <button disabled className="block w-full text-center bg-gray-100 text-gray-400 text-sm font-semibold py-2.5 rounded-xl cursor-not-allowed">
            Unavailable
          </button>
        )}
      </div>
    </div>
  )
}
