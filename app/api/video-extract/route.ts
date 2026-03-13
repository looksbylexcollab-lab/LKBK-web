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
  // /p/ posts can be carousels; /reel/ and /tv/ are always single videos
  return /instagram\.com\/p\//i.test(url)
}

export interface SocialSlide {
  thumbnailUrl: string | null
  videoUrl: string | null
}

// Fetch og:image for a specific carousel slide index
async function fetchSlideOgImage(shortcode: string, imgIndex: number): Promise<string | null> {
  try {
    const res = await fetch(`https://www.instagram.com/p/${shortcode}/?img_index=${imgIndex}`, {
      headers: {
        'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
        'Accept': 'text/html',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      redirect: 'follow',
    })
    if (!res.ok) return null
    const html = await res.text()
    const match = html.match(/<meta property="og:image" content="([^"]+)"/)
    return match?.[1] ?? null
  } catch {
    return null
  }
}

// Extract carousel slides by fetching og:image for each ?img_index
async function extractCarouselSlides(shortcode: string): Promise<SocialSlide[] | null> {
  // Fetch first 2 slides in parallel to confirm it's a carousel
  const [img1, img2] = await Promise.all([
    fetchSlideOgImage(shortcode, 1),
    fetchSlideOgImage(shortcode, 2),
  ])

  if (!img1 || !img2 || img1 === img2) return null // not a carousel

  // Fetch remaining slides (Instagram allows up to 10 per carousel)
  const remaining = await Promise.all(
    Array.from({ length: 8 }, (_, i) => fetchSlideOgImage(shortcode, i + 3))
  )

  const slides: SocialSlide[] = []
  const seen = new Set<string>()
  for (const url of [img1, img2, ...remaining]) {
    if (!url || seen.has(url)) break
    seen.add(url)
    slides.push({ thumbnailUrl: url, videoUrl: null })
  }

  return slides.length > 1 ? slides : null
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

  // Run all extractions in parallel
  const [rapidResult, edgeData, carouselSlides] = await Promise.all([
    isSocial ? withTimeout(trySocialDownloader(url), 8_000) : Promise.resolve(null),
    withTimeout(fetchEdge(url), 25_000) as Promise<Record<string, unknown>>,
    (isCarouselUrl(url) && shortcode) ? withTimeout(extractCarouselSlides(shortcode), 12_000) : Promise.resolve(null),
  ])

  // Carousel takes priority — RapidAPI result first, then og:image fallback
  const slides = rapidResult?.slides ?? carouselSlides
  if (slides) {
    console.log('carousel detected:', slides.length, 'slides')
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
