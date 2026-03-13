import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 60

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  return Promise.race([
    promise,
    new Promise<null>((resolve) => setTimeout(() => resolve(null), ms)),
  ])
}

async function fetchImageBase64(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
        'Referer': 'https://www.instagram.com/',
      },
      redirect: 'follow',
    })
    if (!res.ok) return null
    const buf = await res.arrayBuffer()
    return Buffer.from(buf).toString('base64')
  } catch {
    return null
  }
}

function extractInstagramShortcode(url: string): string | null {
  return url.match(/\/(reel|p|tv)\/([A-Za-z0-9_-]+)/)?.[2] ?? null
}

interface SocialSlide {
  thumbnailUrl: string | null
  videoUrl: string | null
}

interface SocialResult {
  videoUrl: string | null
  slides: SocialSlide[] | null
  debugError?: string
}

async function trySocialDownloader(url: string): Promise<SocialResult | null> {
  const apiKey = process.env.RAPIDAPI_KEY
  if (!apiKey) return null

  const shortcode = extractInstagramShortcode(url)
  if (!shortcode) return null

  try {
    const res = await fetch(
      `https://social-media-video-downloader.p.rapidapi.com/instagram/v3/media/post/details?shortcode=${shortcode}&renderableFormats=720p%2Chighres`,
      {
        headers: {
          'x-rapidapi-key': apiKey,
          'x-rapidapi-host': 'social-media-video-downloader.p.rapidapi.com',
          'Content-Type': 'application/json',
        },
      }
    )
    if (!res.ok) { console.log('rapidapi status:', res.status); return null }
    const data = await res.json()
    console.log('rapidapi full response:', JSON.stringify(data).slice(0, 2000))

    type RawContent = {
      videos?: { label: string; url: string }[]
      images?: { url: string; resolution?: string }[]
    }
    const contents = data?.contents as RawContent[] | undefined
    console.log('rapidapi contents count:', contents?.length, 'keys:', Object.keys(data ?? {}))
    if (!contents?.length) {
      return { videoUrl: null, slides: null, debugError: 'NO_CONTENTS keys=' + JSON.stringify(Object.keys(data ?? {})) + ' | ' + JSON.stringify(data).slice(0, 600) }
    }

    // Always surface the full raw response so we can see carousel structure
    return { videoUrl: null, slides: null, debugError: 'contents.length=' + contents.length + ' | ' + JSON.stringify(data).slice(0, 1000) }

    // Carousel: multiple slides
    if (contents.length > 1) {
      const slides: SocialSlide[] = contents.map((c) => {
        const vids = c.videos ?? []
        const imgs = c.images ?? []
        const videoUrl = vids.find(v => v.label === '720p')?.url ?? vids[0]?.url ?? null
        const thumbnailUrl = imgs[0]?.url ?? null
        return { thumbnailUrl, videoUrl }
      })
      return { videoUrl: null, slides }
    }

    // Single post (video or image)
    const videos = contents[0]?.videos ?? []
    const best = videos.find(v => v.label === '720p') ?? videos[0]
    return { videoUrl: best?.url ?? null, slides: null }
  } catch (e) {
    console.log('rapidapi error:', e)
    return null
  }
}

async function fetchEdge(url: string): Promise<Record<string, unknown>> {
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/video-extract`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        apikey: SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ url }),
    })
    return res.ok ? await res.json() : {}
  } catch {
    return {}
  }
}

export async function POST(req: NextRequest) {
  const { url } = await req.json()
  if (!url) return NextResponse.json({ error: 'url is required' }, { status: 400 })

  const isSocial = /instagram\.com|tiktok\.com/i.test(url)

  // Run RapidAPI + Supabase edge in parallel so we stay within Vercel's timeout
  const [rapidResult, edgeData] = await Promise.all([
    isSocial ? withTimeout(trySocialDownloader(url), 8_000) : Promise.resolve(null),
    withTimeout(fetchEdge(url), 25_000) as Promise<Record<string, unknown>>,
  ])

  // Surface debug info if API response was unrecognised
  if (rapidResult?.debugError) {
    return NextResponse.json({ debugError: rapidResult.debugError })
  }

  // Carousel — return slides directly, no further processing needed
  if (rapidResult?.slides) {
    console.log('carousel detected:', rapidResult.slides.length, 'slides')
    return NextResponse.json({ slides: rapidResult.slides })
  }

  const edge = edgeData ?? {}
  const videoUrl = rapidResult?.videoUrl ?? (edge.videoUrl as string | null) ?? null

  // If the edge function couldn't fetch the thumbnail as base64, try here on Vercel
  // (Vercel IPs have better access to social CDN URLs than Supabase cloud IPs)
  let thumbnailBase64 = (edge.thumbnailBase64 as string | null) ?? null
  if (!thumbnailBase64 && edge.thumbnailUrl) {
    thumbnailBase64 = await fetchImageBase64(edge.thumbnailUrl as string)
  }

  console.log('video-extract result:', { rapidVideoUrl: rapidResult?.videoUrl, edgeVideoUrl: edge.videoUrl, videoUrl, hasThumbnail: !!thumbnailBase64 })

  return NextResponse.json({
    videoUrl,
    thumbnailUrl: edge.thumbnailUrl ?? null,
    thumbnailBase64,
    title: edge.title ?? null,
  })
}
