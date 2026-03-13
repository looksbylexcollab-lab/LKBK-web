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

async function tryCobalt(url: string): Promise<string | null> {
  try {
    const res = await fetch('https://api.cobalt.tools/', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; LKBK/1.0)',
      },
      body: JSON.stringify({ url, videoQuality: '720', filenameStyle: 'basic', downloadMode: 'auto' }),
    })
    if (!res.ok) {
      console.log('cobalt status:', res.status, await res.text().catch(() => ''))
      return null
    }
    const data = await res.json()
    console.log('cobalt response:', JSON.stringify(data).slice(0, 200))
    if (['stream', 'tunnel', 'redirect'].includes(data.status) && data.url) return data.url as string
    if (data.status === 'picker' && Array.isArray(data.picker)) {
      const video = data.picker.find((p: { type?: string; url?: string }) => p.type === 'video' || p.url)
      return video?.url ?? null
    }
    return null
  } catch (e) {
    console.log('cobalt error:', e)
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

  // Run cobalt + Supabase edge in parallel so we stay within Vercel's timeout
  const [cobaltVideoUrl, edgeData] = await Promise.all([
    isSocial ? withTimeout(tryCobalt(url), 8_000) : Promise.resolve(null),
    withTimeout(fetchEdge(url), 25_000) as Promise<Record<string, unknown>>,
  ])

  const edge = edgeData ?? {}
  const videoUrl = cobaltVideoUrl ?? (edge.videoUrl as string | null) ?? null

  // If the edge function couldn't fetch the thumbnail as base64, try here on Vercel
  // (Vercel IPs have better access to social CDN URLs than Supabase cloud IPs)
  let thumbnailBase64 = (edge.thumbnailBase64 as string | null) ?? null
  if (!thumbnailBase64 && edge.thumbnailUrl) {
    thumbnailBase64 = await fetchImageBase64(edge.thumbnailUrl as string)
  }

  console.log('video-extract result:', { cobaltVideoUrl, edgeVideoUrl: edge.videoUrl, videoUrl, hasThumbnail: !!thumbnailBase64 })

  return NextResponse.json({
    videoUrl,
    thumbnailUrl: edge.thumbnailUrl ?? null,
    thumbnailBase64,
    title: edge.title ?? null,
  })
}
