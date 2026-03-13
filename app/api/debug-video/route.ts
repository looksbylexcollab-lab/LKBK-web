import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url') ?? 'https://www.instagram.com/reel/DVxi0K9ju8R/'
  const apiKey = process.env.RAPIDAPI_KEY

  if (!apiKey) return NextResponse.json({ error: 'RAPIDAPI_KEY not set' })

  const res = await fetch(
    `https://instagram-media-downloader.p.rapidapi.com/rapid/post?url=${encodeURIComponent(url)}`,
    {
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': 'instagram-media-downloader.p.rapidapi.com',
      },
    }
  )

  const text = await res.text()
  let json: unknown
  try { json = JSON.parse(text) } catch { json = text }

  return NextResponse.json({ status: res.status, body: json })
}
