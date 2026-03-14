'use client'

import { useState } from 'react'

export interface CarouselSlide {
  thumbnailUrl: string | null
  videoUrl: string | null
}

interface CarouselPickerProps {
  slides: CarouselSlide[]
  onSelect: (slide: CarouselSlide) => void
  onCancel: () => void
}

export default function CarouselPicker({ slides, onSelect, onCancel }: CarouselPickerProps) {
  const [index, setIndex] = useState(0)
  const current = slides[index]

  return (
    <section className="max-w-sm mx-auto px-4 pb-12">
      {/* Main image viewer */}
      <div className="relative mt-8 rounded-2xl overflow-hidden bg-cream-200 aspect-[3/4]">
        {current.thumbnailUrl ? (
          <img
            key={index}
            src={current.thumbnailUrl}
            alt={`Slide ${index + 1}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-bark-subtle text-4xl">◇</div>
        )}

        {/* Prev arrow */}
        {index > 0 && (
          <button
            onClick={() => setIndex(i => i - 1)}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow text-bark text-lg font-light"
          >
            ‹
          </button>
        )}

        {/* Next arrow */}
        {index < slides.length - 1 && (
          <button
            onClick={() => setIndex(i => i + 1)}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow text-bark text-lg font-light"
          >
            ›
          </button>
        )}

        {/* Video play badge */}
        {current.videoUrl && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center">
              <svg width="16" height="16" fill="white" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        )}

        {/* Slide counter pill */}
        <div className="absolute top-3 right-3 bg-black/40 text-white text-xs font-sans px-2.5 py-1 rounded-full">
          {index + 1} / {slides.length}
        </div>
      </div>

      {/* Dot strip */}
      <div className="flex justify-center gap-1.5 mt-4">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`rounded-full transition-all ${
              i === index ? 'w-4 h-1.5 bg-bark' : 'w-1.5 h-1.5 bg-cream-500'
            }`}
          />
        ))}
      </div>

      {/* Thumbnail strip */}
      <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
        {slides.map((slide, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-colors ${
              i === index ? 'border-bark' : 'border-transparent'
            }`}
          >
            {slide.thumbnailUrl ? (
              <img src={slide.thumbnailUrl} alt={`Slide ${i + 1}`} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-cream-300 flex items-center justify-center text-bark-subtle text-sm">◇</div>
            )}
          </button>
        ))}
      </div>

      {/* Actions */}
      <button
        onClick={() => onSelect(current)}
        className="mt-6 w-full btn-dark py-3 text-xs"
      >
        {current.videoUrl ? 'Open Video' : 'Search this photo'}
      </button>
      <button
        onClick={onCancel}
        className="mt-3 w-full text-bark-muted hover:text-bark text-xs uppercase tracking-widest py-2 transition-colors font-sans"
      >
        Cancel
      </button>
    </section>
  )
}
