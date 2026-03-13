import { NextRequest, NextResponse } from 'next/server'

const TEST_URL = 'https://www.instagram.com/reel/DVxi0K9ju8R/'

const ENDPOINTS = [
  { host: 'instagram-media-downloader.p.rapidapi.com', path: '/rapid/post' },
  { host: 'instagram-media-downloader.p.rapidapi.com', path: '/rapid/media' },
  { host: 'instagram-downloader-download-instagram-videos-stories.p.rapidapi.com', path: '/index' },
  { host: 'instagram-downloader9.p.rapidapi.com', path: '/download' },
  { host: 'instagram47.p.rapidapi.com', path: '/post' },
  { host: 'social-media-video-downloader.p.rapidapi.com', path: '/smvd/get/all' },
]

export async function GET(req: NextRequest) {
  const apiKey = process.env.RAPIDAPI_KEY
  if (!apiKey) return NextResponse.json({ error: 'RAPIDAPI_KEY not set in Vercel env vars' })

  const results: Record<string, unknown>[] = []

  for (const { host, path } of ENDPOINTS) {
    try {
      const res = await fetch(`https://${host}${path}?url=${encodeURIComponent(TEST_URL)}`, {
        headers: { 'x-rapidapi-key': apiKey, 'x-rapidapi-host': host },
        signal: AbortSignal.timeout ? AbortSignal.timeout(5000) : undefined,
      })
      const text = await res.text()
      let body: unknown
      try { body = JSON.parse(text) } catch { body = text.slice(0, 200) }
      results.push({ host, path, status: res.status, body })
    } catch (e) {
      results.push({ host, path, error: String(e) })
    }
  }

  return NextResponse.json(results)
}
