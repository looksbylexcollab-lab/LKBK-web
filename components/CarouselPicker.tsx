'use client'

export interface CarouselSlide {
  thumbnailUrl: string | null
  videoUrl: string | null
}

interface CarouselPickerProps {
  slides: CarouselSlide[]
  onSelect: (slide: CarouselSlide) => void
  onCancel: () => void
}

function proxied(url: string | null): string | null {
  if (!url) return null
  try {
    const { hostname } = new URL(url)
    if (
      hostname.includes('lookaside.instagram.com') ||
      hostname.includes('cdninstagram.com') ||
      hostname.includes('fbcdn.net')
    ) {
      return `/api/video-proxy?url=${encodeURIComponent(url)}`
    }
  } catch { /* ignore */ }
  return url
}

export default function CarouselPicker({ slides, onSelect, onCancel }: CarouselPickerProps) {
  return (
    <section className="max-w-sm mx-auto px-4 pb-12">
      <p className="label-caps text-center mb-6 pt-8">Choose a slide</p>

      <div className="grid grid-cols-3 gap-2">
        {slides.map((slide, i) => (
          <button
            key={i}
            onClick={() => onSelect(slide)}
            className="relative group aspect-square rounded-xl overflow-hidden border border-cream-400 bg-cream-200 hover:border-bark transition-colors"
          >
            {slide.thumbnailUrl ? (
              <img
                src={proxied(slide.thumbnailUrl)!}
                alt={`Slide ${i + 1}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-bark-subtle text-2xl">◇</div>
            )}
            {slide.videoUrl && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-black/50 flex items-center justify-center">
                  <svg width="12" height="12" fill="white" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            )}
            <div className="absolute inset-0 bg-bark/0 group-hover:bg-bark/10 transition-colors" />
          </button>
        ))}
      </div>

      <button
        onClick={onCancel}
        className="mt-6 w-full text-bark-muted hover:text-bark text-xs uppercase tracking-widest py-2 transition-colors font-sans"
      >
        Cancel
      </button>
    </section>
  )
}
