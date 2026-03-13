import { NextRequest, NextResponse } from 'next/server'

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

async function trySocialDownloader(url: string): Promise<string | null> {
  const apiKey = process.env.RAPIDAPI_KEY
  if (!apiKey) return null
  try {
    const res = await fetch(
      `https://instagram-media-downloader.p.rapidapi.com/rapid/post?url=${encodeURIComponent(url)}`,
      {
        headers: {
          'x-rapidapi-key': apiKey,
          'x-rapidapi-host': 'instagram-media-downloader.p.rapidapi.com',
        },
      }
    )
    if (!res.ok) { console.log('rapidapi status:', res.status); return null }
    const data = await res.json()
    console.log('rapidapi response:', JSON.stringify(data).slice(0, 400))

    // Handle various response shapes this API returns
    // Shape 1: { result: { url: "..." } }
    if (data?.result?.url) return data.result.url as string
    // Shape 2: { result: [{ url, type }] } — pick video
    if (Array.isArray(data?.result)) {
      const vid = data.result.find((r: { type?: string; url?: string }) => r.type === 'video' || r.url?.includes('.mp4'))
      if (vid?.url) return vid.url as string
    }
    // Shape 3: { media: [{ url, type }] }
    if (Array.isArray(data?.media)) {
      const vid = data.media.find((r: { type?: string; url?: string }) => r.type === 'video' || r.url?.includes('.mp4'))
      if (vid?.url) return vid.url as string
    }
    // Shape 4: { url: "..." } direct
    if (data?.url && typeof data.url === 'string') return data.url as string

    return null
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
  const [rapidVideoUrl, edgeData] = await Promise.all([
    isSocial ? withTimeout(trySocialDownloader(url), 8_000) : Promise.resolve(null),
    withTimeout(fetchEdge(url), 25_000) as Promise<Record<string, unknown>>,
  ])

  const edge = edgeData ?? {}
  const videoUrl = rapidVideoUrl ?? (edge.videoUrl as string | null) ?? null

  // If the edge function couldn't fetch the thumbnail as base64, try here on Vercel
  // (Vercel IPs have better access to social CDN URLs than Supabase cloud IPs)
  let thumbnailBase64 = (edge.thumbnailBase64 as string | null) ?? null
  if (!thumbnailBase64 && edge.thumbnailUrl) {
    thumbnailBase64 = await fetchImageBase64(edge.thumbnailUrl as string)
  }

  console.log('video-extract result:', { rapidVideoUrl, edgeVideoUrl: edge.videoUrl, videoUrl, hasThumbnail: !!thumbnailBase64 })

  return NextResponse.json({
    videoUrl,
    thumbnailUrl: edge.thumbnailUrl ?? null,
    thumbnailBase64,
    title: edge.title ?? null,
  })
}
