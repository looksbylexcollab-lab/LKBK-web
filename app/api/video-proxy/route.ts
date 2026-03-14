import { NextRequest, NextResponse } from 'next/server'

// Use Edge Runtime so iOS Safari's multiple range requests share a persistent
// connection — serverless cold-starts cause CDN auth tokens to be rejected
// on subsequent range requests, breaking video playback on mobile.
export const runtime = 'edge'

// Proxy social media video URLs through Next.js to avoid CORS restrictions.
// The browser requests /api/video-proxy?url=... (same-origin) and we fetch
// the actual CDN URL server-side with the headers CDNs expect.

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url')
  if (!url) return new NextResponse('url required', { status: 400 })

  // Only allow proxying video/media CDN URLs (basic SSRF guard)
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return new NextResponse('invalid url', { status: 400 })
  }
  const allowed = [
    'cdninstagram.com', 'fbcdn.net', 'tiktokcdn.com', 'tiktokcdn-us.com',
    'tikwm.com', 'akamaized.net', 'llnwd.net', 'instagram.com',
    'cobalt.tools', 'co.wuk.sh', 'rapidapi.com', 'lookaside.instagram.com',
  ]
  if (!allowed.some(h => parsed.hostname.endsWith(h))) {
    return new NextResponse('url not allowed', { status: 403 })
  }

  const headers: HeadersInit = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': '*/*',
    'Accept-Encoding': 'identity', // no gzip — need raw bytes for streaming
    'Referer': 'https://www.instagram.com/',
  }

  const range = req.headers.get('range')
  if (range) (headers as Record<string, string>)['Range'] = range

  let upstream: Response
  try {
    upstream = await fetch(url, { headers })
  } catch {
    return new NextResponse('upstream fetch failed', { status: 502 })
  }

  if (!upstream.ok && upstream.status !== 206) {
    return new NextResponse('upstream error', { status: upstream.status })
  }

  const resHeaders = new Headers()
  resHeaders.set('Content-Type', upstream.headers.get('content-type') ?? 'video/mp4')
  resHeaders.set('Access-Control-Allow-Origin', '*')
  resHeaders.set('Accept-Ranges', 'bytes')
  resHeaders.set('Cache-Control', 'private, max-age=3600')

  for (const h of ['content-length', 'content-range']) {
    const v = upstream.headers.get(h)
    if (v) resHeaders.set(h, v)
  }

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: resHeaders,
  })
}
