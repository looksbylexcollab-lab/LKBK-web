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

function isCarouselUrl(url: string): boolean {
  return /instagram\.com\/p\//i.test(url)
}

export interface SocialSlide {
  thumbnailUrl: string | null
  videoUrl: string | null
}

// Parse carousel slides from Instagram embed page HTML
async function parseInstagramEmbed(shortcode: string): Promise<SocialSlide[] | null> {
  try {
    const res = await fetch(`https://www.instagram.com/p/${shortcode}/embed/captioned/`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
        'Sec-Fetch-Mode': 'navigate',
        'Referer': 'https://www.instagram.com/',
      },
      redirect: 'follow',
    })
    if (!res.ok) return null
    const html = await res.text()

    // Strategy 1: find edge_sidecar_to_children JSON array
    const sidecarMatch = html.match(/"edge_sidecar_to_children"\s*:\s*\{"edges"\s*:\s*(\[[\s\S]+?\])\s*\}/)
    if (sidecarMatch) {
      try {
        const edges = JSON.parse(sidecarMatch[1]) as { node: { display_url?: string; is_video?: boolean; video_url?: string } }[]
        if (edges.length > 1) {
          return edges.map(e => ({
            thumbnailUrl: e.node.display_url ?? null,
            videoUrl: e.node.is_video ? (e.node.video_url ?? null) : null,
          }))
        }
      } catch { /* try next strategy */ }
    }

    // Strategy 2: extract all display_url values from JSON
    const displayUrls = [...html.matchAll(/"display_url"\s*:\s*"([^"]+)"/g)]
      .map(m => m[1].replace(/\\u0026/g, '&').replace(/\\\//g, '/'))
      .filter((url, i, arr) => arr.indexOf(url) === i) // dedupe
    if (displayUrls.length > 1) {
      return displayUrls.map(url => ({ thumbnailUrl: url, videoUrl: null }))
    }

    return null
  } catch {
    return null
  }
}

// Try Instagram's ?__a=1 JSON endpoint (works without auth on some posts)
async function fetchInstagramJSON(shortcode: string): Promise<SocialSlide[] | null> {
  try {
    const res = await fetch(`https://www.instagram.com/p/${shortcode}/?__a=1&__d=dis`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/javascript, */*',
        'X-IG-App-ID': '936619743392459',
        'X-Requested-With': 'XMLHttpRequest',
        'Referer': 'https://www.instagram.com/',
      },
      redirect: 'follow',
    })
    if (!res.ok) return null
    const data = await res.json()
    const media = data?.graphql?.shortcode_media ?? data?.items?.[0]
    const edges = media?.edge_sidecar_to_children?.edges
    if (Array.isArray(edges) && edges.length > 1) {
      return edges.map((e: { node: { display_url?: string; is_video?: boolean; video_url?: string } }) => ({
        thumbnailUrl: e.node.display_url ?? null,
        videoUrl: e.node.is_video ? (e.node.video_url ?? null) : null,
      }))
    }
    return null
  } catch {
    return null
  }
}

interface SocialResult {
  videoUrl: string | null
  slides: SocialSlide[] | null
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
    if (!res.ok) return null
    const data = await res.json()

    type RawContent = {
      videos?: { label: string; url: string }[]
      images?: { url: string; resolution?: string }[]
    }
    const contents = data?.contents as RawContent[] | undefined
    if (!contents?.length) return null

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

    const videos = contents[0]?.videos ?? []
    const best = videos.find(v => v.label === '720p') ?? videos[0]
    return { videoUrl: best?.url ?? null, slides: null }
  } catch {
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
  const shortcode = extractInstagramShortcode(url)
  const isCarousel = isCarouselUrl(url) && !!shortcode

  const [rapidResult, edgeData, embedSlides, jsonSlides] = await Promise.all([
    isSocial ? withTimeout(trySocialDownloader(url), 8_000) : Promise.resolve(null),
    withTimeout(fetchEdge(url), 25_000) as Promise<Record<string, unknown>>,
    isCarousel ? withTimeout(parseInstagramEmbed(shortcode!), 10_000) : Promise.resolve(null),
    isCarousel ? withTimeout(fetchInstagramJSON(shortcode!), 8_000) : Promise.resolve(null),
  ])

  // Use first available slides source (including from edge function)
  const edgeSlides = (edgeData as Record<string, unknown> & { slides?: SocialSlide[] })?.slides
  const slides = rapidResult?.slides ?? edgeSlides ?? embedSlides ?? jsonSlides
  if (slides && slides.length > 1) {
    console.log('carousel:', slides.length, 'slides')
    return NextResponse.json({ slides })
  }

  const edge = edgeData ?? {}
  const videoUrl = rapidResult?.videoUrl ?? (edge.videoUrl as string | null) ?? null

  let thumbnailBase64 = (edge.thumbnailBase64 as string | null) ?? null
  if (!thumbnailBase64 && edge.thumbnailUrl) {
    thumbnailBase64 = await fetchImageBase64(edge.thumbnailUrl as string)
  }

  return NextResponse.json({
    videoUrl,
    thumbnailUrl: edge.thumbnailUrl ?? null,
    thumbnailBase64,
    title: edge.title ?? null,
  })
}
