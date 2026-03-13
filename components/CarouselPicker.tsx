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

export default function CarouselPicker({ slides, onSelect, onCancel }: CarouselPickerProps) {
  return (
    <div className="max-w-2xl mx-auto px-8 py-12">
      <div className="flex items-center gap-4 mb-8">
        <div className="h-px flex-1 bg-cream-400" />
        <p className="label-caps">Choose a slide</p>
        <div className="h-px flex-1 bg-cream-400" />
      </div>

      <div className="grid grid-cols-3 gap-3">
        {slides.map((slide, i) => (
          <button
            key={i}
            onClick={() => onSelect(slide)}
            className="relative group aspect-square rounded-2xl overflow-hidden border border-cream-400 bg-cream-200 hover:border-bark transition-colors"
          >
            {slide.thumbnailUrl ? (
              <img
                src={slide.thumbnailUrl}
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
        className="mt-8 w-full text-bark-muted hover:text-bark text-sm py-2 transition-colors font-sans"
      >
        Cancel
      </button>
    </div>
  )
}
