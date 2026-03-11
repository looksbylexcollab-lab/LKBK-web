import Image from 'next/image'
import type { SaveProduct } from './SaveModal'

interface ProductCardProps {
  product: SaveProduct & { isExactMatch: boolean }
  onSave: (product: SaveProduct) => void
}

export default function ProductCard({ product: p, onSave }: ProductCardProps) {
  return (
    <div className="bg-white border border-cream-400 hover:border-cream-500 rounded-2xl transition-all duration-300 group flex flex-col overflow-hidden">
      {/* Image */}
      <div className="relative aspect-square bg-cream-200 overflow-hidden">
        {p.imageUrl ? (
          <Image
            src={p.imageUrl}
            alt={p.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-cream-500 text-4xl">◇</div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {p.isExactMatch && (
            <span className="bg-bark text-white text-xs px-2.5 py-1 rounded-full tracking-wide" style={{ fontSize: '9px' }}>
              Best Match
            </span>
          )}
        </div>

        {/* Save button */}
        <button
          onClick={() => onSave(p)}
          aria-label="Save product"
          className="absolute top-3 right-3 w-8 h-8 bg-white/90 border border-cream-400 rounded-full flex items-center justify-center
                     opacity-0 group-hover:opacity-100 transition-opacity hover:bg-cream-100"
        >
          <svg className="w-4 h-4 text-bark-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      {/* Info */}
      <div className="p-5 flex flex-col flex-1 border-t border-cream-300">
        {p.brand && (
          <p className="text-xs uppercase tracking-widest text-tan-400 mb-1.5 font-sans" style={{ fontSize: '9px' }}>{p.brand}</p>
        )}
        <p className="text-sm font-medium text-bark leading-snug mb-2 flex-1 line-clamp-2 font-sans">{p.name}</p>

        <div className="flex items-center justify-between mb-4 mt-1">
          {p.estimatedPrice && (
            <p className="text-sm text-bark font-medium font-sans">{p.estimatedPrice}</p>
          )}
          <span className="text-xs border border-cream-500 text-bark-muted px-2 py-0.5 rounded-full tracking-wide font-sans" style={{ fontSize: '9px' }}>
            1% CASHBACK
          </span>
        </div>

        <div className="flex gap-2">
          {p.shopUrl ? (
            <a
              href={p.shopUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center bg-bark hover:bg-bark-light text-white text-xs uppercase tracking-widest py-2.5 rounded-full transition-colors font-sans"
            >
              Shop Now
            </a>
          ) : (
            <button disabled className="flex-1 text-center bg-cream-300 text-bark-muted text-xs uppercase tracking-widest py-2.5 rounded-full cursor-not-allowed font-sans">
              Unavailable
            </button>
          )}
          <button
            onClick={() => onSave(p)}
            className="w-10 border border-cream-400 hover:border-bark rounded-full flex items-center justify-center transition-colors hover:bg-cream-300"
            aria-label="Save"
          >
            <svg className="w-4 h-4 text-bark-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
