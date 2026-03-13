'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

const FRAME_COUNT = 12

function formatTime(s: number) {
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

interface VideoScrubberProps {
  videoUrl: string
  onCapture: (imageBase64: string) => void
  onCancel: () => void
  onVideoError?: () => void
}

export default function VideoScrubber({ videoUrl, onCapture, onCancel, onVideoError }: VideoScrubberProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const filmstripRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)

  const [frames, setFrames] = useState<string[]>([])
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [generating, setGenerating] = useState(true)
  const [capturing, setCapturing] = useState(false)
  const [corsError, setCorsError] = useState(false)
  const [videoError, setVideoError] = useState(false)

  const generateFrames = useCallback(async (video: HTMLVideoElement) => {
    const dur = video.duration
    if (!dur || !isFinite(dur)) { setGenerating(false); return }

    // Try to generate frames using a crossOrigin video clone so canvas isn't tainted
    const cv = document.createElement('video')
    cv.crossOrigin = 'anonymous'
    cv.muted = true
    cv.playsInline = true
    cv.src = videoUrl

    const canUseCors = await new Promise<boolean>((resolve) => {
      cv.onloadedmetadata = () => resolve(true)
      cv.onerror = () => resolve(false)
      setTimeout(() => resolve(false), 8000)
    })

    const source = canUseCors ? cv : video
    const generated: string[] = []

    for (let i = 0; i < FRAME_COUNT; i++) {
      source.currentTime = (i / (FRAME_COUNT - 1)) * dur
      await new Promise<void>((resolve) => {
        const h = () => { source.removeEventListener('seeked', h); resolve() }
        source.addEventListener('seeked', h)
        setTimeout(resolve, 2000) // bail after 2s per frame
      })
      const c = document.createElement('canvas')
      c.width = 80; c.height = 60
      try {
        c.getContext('2d')!.drawImage(source, 0, 0, 80, 60)
        generated.push(c.toDataURL('image/jpeg', 0.6))
      } catch {
        generated.push('') // tainted — show blank tile, still scrub-able
      }
    }
    video.currentTime = 0
    setFrames(generated)
    setGenerating(false)
  }, [videoUrl])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const onMeta = () => { setDuration(video.duration); generateFrames(video) }
    const onTime = () => setCurrentTime(video.currentTime)
    const onError = () => { setVideoError(true); setGenerating(false); onVideoError?.() }
    video.addEventListener('loadedmetadata', onMeta)
    video.addEventListener('timeupdate', onTime)
    video.addEventListener('error', onError)
    return () => {
      video.removeEventListener('loadedmetadata', onMeta)
      video.removeEventListener('timeupdate', onTime)
      video.removeEventListener('error', onError)
    }
  }, [generateFrames])

  function scrubToX(clientX: number) {
    const strip = filmstripRef.current
    const video = videoRef.current
    if (!strip || !video || !duration) return
    const rect = strip.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    video.currentTime = ratio * duration
  }

  function onMouseDown(e: React.MouseEvent) { isDragging.current = true; scrubToX(e.clientX) }
  function onMouseMove(e: React.MouseEvent) { if (isDragging.current) scrubToX(e.clientX) }
  function onMouseUp() { isDragging.current = false }
  function onTouchStart(e: React.TouchEvent) { scrubToX(e.touches[0].clientX) }
  function onTouchMove(e: React.TouchEvent) { scrubToX(e.touches[0].clientX) }

  async function captureFrame() {
    const video = videoRef.current
    if (!video) return
    setCapturing(true)

    const targetTime = video.currentTime
    const w = video.videoWidth || 1280
    const h = video.videoHeight || 720

    // Attempt capture via a fresh crossOrigin video (needed for canvas read-back)
    try {
      await new Promise<void>((resolve, reject) => {
        const cv = document.createElement('video')
        cv.crossOrigin = 'anonymous'
        cv.muted = true
        cv.playsInline = true
        cv.src = videoUrl
        cv.onloadedmetadata = () => {
          cv.currentTime = targetTime
          cv.onseeked = () => {
            try {
              const canvas = document.createElement('canvas')
              canvas.width = w; canvas.height = h
              canvas.getContext('2d')!.drawImage(cv, 0, 0, w, h)
              const base64 = canvas.toDataURL('image/jpeg', 0.9).split(',')[1]
              onCapture(base64)
              resolve()
            } catch {
              reject(new Error('cors'))
            }
          }
          cv.onerror = () => reject(new Error('cors'))
        }
        cv.onerror = () => reject(new Error('cors'))
        setTimeout(() => reject(new Error('cors')), 15_000)
      })
    } catch {
      setCorsError(true)
      setCapturing(false)
    }
  }

  const progress = duration ? (currentTime / duration) * 100 : 0

  return (
    <div className="bg-[#1C1916] rounded-2xl overflow-hidden w-full max-w-sm mx-auto">
      {/* Video preview */}
      <div className="relative bg-black" style={{ aspectRatio: '9/16', maxHeight: '320px' }}>
        <video
          ref={videoRef}
          src={videoUrl}
          playsInline
          muted
          controls
          className="w-full h-full object-contain"
        />
      </div>

      {/* Filmstrip */}
      <div className="px-3 pt-3 pb-1">
        {videoError ? (
          <div className="flex items-center justify-center h-16 text-white/40 text-xs font-sans text-center px-2">
            Video could not load. Try uploading a screenshot instead.
          </div>
        ) : generating ? (
          <div className="flex items-center justify-center h-16 gap-2 text-white/40 text-xs font-sans">
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            Loading frames…
          </div>
        ) : (
          <div
            ref={filmstripRef}
            className="relative flex gap-0.5 cursor-col-resize select-none rounded-lg overflow-hidden"
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
          >
            {frames.map((src, i) => (
              <div key={i} className="relative flex-1 aspect-square overflow-hidden bg-white/10">
                {src ? (
                  <img src={src} alt="" className="w-full h-full object-cover" draggable={false} />
                ) : (
                  <div className="w-full h-full bg-white/5" />
                )}
              </div>
            ))}
            {/* Scrubber indicator */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-white rounded-full pointer-events-none shadow-lg"
              style={{ left: `${progress}%`, transform: 'translateX(-50%)' }}
            >
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full" />
            </div>
          </div>
        )}

        <p className="text-white/60 text-xs text-center mt-2 font-sans tabular-nums">
          {formatTime(currentTime)} / {formatTime(duration)}
        </p>
        <p className="text-white/40 text-xs text-center mt-1 mb-3 font-sans">
          Drag the timeline to find the product you want
        </p>
      </div>

      {/* Buttons */}
      <div className="px-3 pb-3 space-y-2">
        {(corsError || videoError) ? (
          <p className="text-red-400 text-xs text-center font-sans py-2">
            This platform blocks frame capture. Try uploading a screenshot instead.
          </p>
        ) : (
          <button
            onClick={captureFrame}
            disabled={capturing || generating || videoError}
            className="w-full flex items-center justify-center gap-2 bg-white hover:bg-cream-100 disabled:opacity-50 text-bark font-semibold text-sm py-3 rounded-xl transition-colors font-sans"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z" />
            </svg>
            {capturing ? 'Capturing…' : 'Capture This Frame'}
          </button>
        )}
        <button
          onClick={onCancel}
          className="w-full text-white/50 hover:text-white/80 text-sm py-2 transition-colors font-sans"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
