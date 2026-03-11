import Image from 'next/image'
import type { SaveProduct } from './SaveModal'

interface ProductCardProps {
  product: SaveProduct & { isExactMatch: boolean }
  onSave: (product: SaveProduct) => void
}

export default function ProductCard({ product: p, onSave }: ProductCardProps) {
  return (
    <div className="bg-white border border-pearl-200 hover:border-gold-200 transition-all duration-300 group flex flex-col">
      {/* Image */}
      <div className="relative aspect-square bg-pearl-100 overflow-hidden">
        {p.imageUrl ? (
          <Image
            src={p.imageUrl}
            alt={p.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-pearl-300 text-4xl">◇</div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {p.isExactMatch && (
            <span className="bg-charcoal text-pearl-100 text-xs px-2.5 py-1 tracking-widest uppercase" style={{ fontSize: '9px' }}>
              Best Match
            </span>
          )}
        </div>

        {/* Save button */}
        <button
          onClick={() => onSave(p)}
          aria-label="Save product"
          className="absolute top-3 right-3 w-8 h-8 bg-white/90 border border-gold-200 flex items-center justify-center
                     opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gold-50"
        >
          <svg className="w-4 h-4 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      {/* Info */}
      <div className="p-5 flex flex-col flex-1 border-t border-pearl-200">
        {p.brand && (
          <p className="text-xs uppercase tracking-widest text-charcoal-muted mb-1.5" style={{ fontSize: '9px' }}>{p.brand}</p>
        )}
        <p className="text-sm font-light text-charcoal leading-snug mb-2 flex-1 line-clamp-2">{p.name}</p>

        <div className="flex items-center justify-between mb-4 mt-1">
          {p.estimatedPrice && (
            <p className="text-sm text-gold-400 font-light">{p.estimatedPrice}</p>
          )}
          <span className="text-xs border border-gold-200 text-gold-500 px-2 py-0.5 tracking-wider" style={{ fontSize: '9px' }}>
            1% CASHBACK
          </span>
        </div>

        <div className="flex gap-2">
          {p.shopUrl ? (
            <a
              href={p.shopUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center bg-charcoal hover:bg-charcoal-light text-pearl-100 label-caps py-2.5 transition-colors"
            >
              Shop Now
            </a>
          ) : (
            <button disabled className="flex-1 text-center bg-pearl-200 text-charcoal-muted label-caps py-2.5 cursor-not-allowed">
              Unavailable
            </button>
          )}
          <button
            onClick={() => onSave(p)}
            className="w-10 border border-pearl-300 hover:border-gold-300 flex items-center justify-center transition-colors hover:bg-gold-50"
            aria-label="Save"
          >
            <svg className="w-4 h-4 text-charcoal-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
