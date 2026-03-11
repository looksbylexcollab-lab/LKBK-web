import Image from 'next/image'
import type { SaveProduct } from './SaveModal'

interface ProductCardProps {
  product: SaveProduct & { isExactMatch: boolean }
  onSave: (product: SaveProduct) => void
}

export default function ProductCard({ product: p, onSave }: ProductCardProps) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col group">
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
        {/* Save button — appears on hover on desktop, always visible on mobile */}
        <button
          onClick={() => onSave(p)}
          aria-label="Save product"
          className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm
                     opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity hover:scale-110 active:scale-95"
        >
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      <div className="p-4 flex flex-col flex-1">
        {p.brand && <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{p.brand}</p>}
        <p className="font-semibold text-gray-900 mb-1 line-clamp-2 flex-1 text-sm">{p.name}</p>
        {p.estimatedPrice && (
          <p className="text-brand-600 font-semibold text-sm mb-2">{p.estimatedPrice}</p>
        )}
        <span className="inline-block text-xs bg-green-50 text-green-700 font-medium px-2 py-0.5 rounded-full mb-3 self-start">
          1% cashback
        </span>
        <div className="flex gap-2 mt-auto">
          {p.shopUrl ? (
            <a
              href={p.shopUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center bg-black hover:bg-gray-800 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
            >
              Shop Now
            </a>
          ) : (
            <button disabled className="flex-1 text-center bg-gray-100 text-gray-400 text-sm font-semibold py-2.5 rounded-xl cursor-not-allowed">
              Unavailable
            </button>
          )}
          <button
            onClick={() => onSave(p)}
            className="w-10 h-10 border border-gray-200 rounded-xl flex items-center justify-center hover:bg-gray-50 transition-colors flex-shrink-0"
            aria-label="Save to wishlist or collection"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
