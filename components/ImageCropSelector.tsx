'use client'

import { useRef, useState, useCallback, useEffect } from 'react'

interface Rect { x: number; y: number; w: number; h: number }

interface Props {
  dataUrl: string
  onCrop: (croppedBase64: string) => void
  onCancel: () => void
}

export default function ImageCropSelector({ dataUrl, onCrop, onCancel }: Props) {
  const imgRef = useRef<HTMLImageElement>(null)
  const [rect, setRect] = useState<Rect | null>(null)
  const [dragging, setDragging] = useState(false)
  const startRef = useRef<{ x: number; y: number } | null>(null)

  // Converts a mouse/touch event position to coordinates relative to the image element
  function relativePos(e: React.MouseEvent | React.TouchEvent): { x: number; y: number } {
    const img = imgRef.current
    if (!img) return { x: 0, y: 0 }
    const bounds = img.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    return {
      x: Math.max(0, Math.min(clientX - bounds.left, bounds.width)),
      y: Math.max(0, Math.min(clientY - bounds.top, bounds.height)),
    }
  }

  function onMouseDown(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault()
    const pos = relativePos(e)
    startRef.current = pos
    setRect({ x: pos.x, y: pos.y, w: 0, h: 0 })
    setDragging(true)
  }

  function onMouseMove(e: React.MouseEvent | React.TouchEvent) {
    if (!dragging || !startRef.current) return
    e.preventDefault()
    const pos = relativePos(e)
    setRect({
      x: Math.min(pos.x, startRef.current.x),
      y: Math.min(pos.y, startRef.current.y),
      w: Math.abs(pos.x - startRef.current.x),
      h: Math.abs(pos.y - startRef.current.y),
    })
  }

  function onMouseUp(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault()
    setDragging(false)
  }

  // Stop drag if mouse leaves container
  useEffect(() => {
    function handleUp() { setDragging(false) }
    window.addEventListener('mouseup', handleUp)
    window.addEventListener('touchend', handleUp)
    return () => {
      window.removeEventListener('mouseup', handleUp)
      window.removeEventListener('touchend', handleUp)
    }
  }, [])

  const handleSearch = useCallback(() => {
    const img = imgRef.current
    if (!img || !rect || rect.w < 10 || rect.h < 10) return

    const bounds = img.getBoundingClientRect()
    const scaleX = img.naturalWidth / bounds.width
    const scaleY = img.naturalHeight / bounds.height

    const canvas = document.createElement('canvas')
    canvas.width = rect.w * scaleX
    canvas.height = rect.h * scaleY
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const full = new Image()
    full.onload = () => {
      ctx.drawImage(
        full,
        rect.x * scaleX, rect.y * scaleY,
        rect.w * scaleX, rect.h * scaleY,
        0, 0,
        canvas.width, canvas.height,
      )
      const base64 = canvas.toDataURL('image/jpeg', 0.92).split(',')[1]
      onCrop(base64)
    }
    full.src = dataUrl
  }, [rect, dataUrl, onCrop])

  const hasSelection = rect && rect.w > 10 && rect.h > 10

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="label-caps text-bark-muted">Draw a box around the item you want to search</p>

      <div
        className="relative select-none"
        style={{ cursor: dragging ? 'crosshair' : 'crosshair', touchAction: 'none' }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onTouchStart={onMouseDown}
        onTouchMove={onMouseMove}
        onTouchEnd={onMouseUp}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgRef}
          src={dataUrl}
          alt="Select area"
          draggable={false}
          className="max-h-[60vh] max-w-full rounded-2xl border border-cream-400 block"
          style={{ userSelect: 'none' }}
        />

        {/* Darkened overlay outside selection */}
        {rect && rect.w > 2 && rect.h > 2 && (
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none rounded-2xl"
            style={{ position: 'absolute', top: 0, left: 0 }}
          >
            <defs>
              <mask id="crop-mask">
                <rect width="100%" height="100%" fill="white" />
                <rect x={rect.x} y={rect.y} width={rect.w} height={rect.h} fill="black" />
              </mask>
            </defs>
            <rect width="100%" height="100%" fill="rgba(0,0,0,0.45)" mask="url(#crop-mask)" />
            <rect
              x={rect.x} y={rect.y} width={rect.w} height={rect.h}
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeDasharray="6 3"
            />
            {/* Corner handles */}
            {[
              [rect.x, rect.y], [rect.x + rect.w, rect.y],
              [rect.x, rect.y + rect.h], [rect.x + rect.w, rect.y + rect.h],
            ].map(([cx, cy], i) => (
              <circle key={i} cx={cx} cy={cy} r={5} fill="white" />
            ))}
          </svg>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleSearch}
          disabled={!hasSelection}
          className="bg-bark hover:bg-bark-light disabled:opacity-40 text-white text-xs uppercase tracking-[0.15em] px-6 py-3 rounded-full transition-colors font-sans"
        >
          Search this area
        </button>
        <button
          onClick={onCancel}
          className="text-xs text-bark-muted hover:text-bark transition-colors font-sans uppercase tracking-widest px-4"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
