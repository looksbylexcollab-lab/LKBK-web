import { NextRequest, NextResponse } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Try cobalt.tools from Vercel (better IP reputation than Supabase cloud IPs).
// Cobalt tunnel URLs have Access-Control-Allow-Origin: * so the browser can
// load them directly in a <video> element without needing our proxy.
async function tryCobalt(url: string): Promise<string | null> {
  try {
    const res = await fetch('https://api.cobalt.tools/', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'LKBK/1.0 (+https://shoplkbk.com)',
      },
      body: JSON.stringify({
        url,
        videoQuality: '720',
        filenameStyle: 'basic',
        downloadMode: 'auto',
      }),
      signal: AbortSignal.timeout(20_000),
    })
    if (!res.ok) return null
    const data = await res.json()

    if (['stream', 'tunnel', 'redirect'].includes(data.status) && data.url) {
      return data.url as string
    }
    if (data.status === 'picker' && Array.isArray(data.picker)) {
      const video = data.picker.find((p: { type?: string; url?: string }) => p.type === 'video' || p.url)
      return video?.url ?? null
    }
    return null
  } catch {
    return null
  }
}

export async function POST(req: NextRequest) {
  const { url } = await req.json()
  if (!url) return NextResponse.json({ error: 'url is required' }, { status: 400 })

  const isSocial = /instagram\.com|tiktok\.com/i.test(url)

  // For IG/TikTok: try cobalt first (Vercel IPs, less likely to be blocked)
  let cobaltVideoUrl: string | null = null
  if (isSocial) {
    cobaltVideoUrl = await tryCobalt(url)
  }

  // Always call Supabase edge for thumbnail extraction (and video fallback for non-cobalt)
  const edgeRes = await fetch(`${SUPABASE_URL}/functions/v1/video-extract`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      apikey: SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ url }),
  })

  const edgeData = edgeRes.ok ? await edgeRes.json() : {}

  // Cobalt URL wins over anything the edge function found
  const videoUrl = cobaltVideoUrl ?? edgeData.videoUrl ?? null

  return NextResponse.json({
    videoUrl,
    thumbnailUrl: edgeData.thumbnailUrl ?? null,
    thumbnailBase64: edgeData.thumbnailBase64 ?? null,
    title: edgeData.title ?? null,
  })
}
