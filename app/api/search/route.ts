import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 60 // seconds — visual-search can take 30-40s

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

function supabaseHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    apikey: SUPABASE_ANON_KEY,
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json()

  // ── URL flow: scrape → get image URL → fetch → base64 → visual-search ──────
  if (body.url) {
    const scrapeRes = await fetch(`${SUPABASE_URL}/functions/v1/scrape-product`, {
      method: 'POST',
      headers: supabaseHeaders(),
      body: JSON.stringify({ url: body.url }),
    })

    if (!scrapeRes.ok) {
      return NextResponse.json({ error: 'Failed to scrape URL' }, { status: 502 })
    }

    const scrapeData = await scrapeRes.json()

// Build search query from scraped product data to skip the vision step
    const searchQuery = [scrapeData.brand, scrapeData.name].filter(Boolean).join(' ') || null

    // Try to download the image for visual context; fall back gracefully if blocked
    let imageBase64: string | null = null
    if (scrapeData.imageUrl) {
      try {
        const imgRes = await fetch(scrapeData.imageUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
            'Referer': 'https://www.google.com/',
          },
          redirect: 'follow',
        })
        if (imgRes.ok) {
          imageBase64 = Buffer.from(await imgRes.arrayBuffer()).toString('base64')
        }
      } catch { /* non-fatal */ }
    }

    if (!searchQuery && !imageBase64) {
      return NextResponse.json({ error: 'Could not extract product info from that URL.' }, { status: 400 })
    }

    const searchRes = await fetch(`${SUPABASE_URL}/functions/v1/visual-search`, {
      method: 'POST',
      headers: supabaseHeaders(),
      body: JSON.stringify({
        imageBase64,
        searchQuery,
        brand: scrapeData.brand ?? null,
        description: scrapeData.description ?? null,
      }),
    })

    const results = await searchRes.json()
    return NextResponse.json(results)
  }

  // ── Image URL flow: server fetches image → base64 → visual-search ──────────
  if (body.imageUrl) {
    let imageBase64: string | null = null
    try {
      const imgRes = await fetch(body.imageUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Referer': 'https://www.google.com/',
        },
        redirect: 'follow',
      })
      if (imgRes.ok) {
        const contentType = imgRes.headers.get('content-type') ?? ''
        if (contentType.startsWith('image/') || contentType.startsWith('application/octet')) {
          imageBase64 = Buffer.from(await imgRes.arrayBuffer()).toString('base64')
        }
      }
    } catch { /* fall through */ }

    // If direct fetch failed, skip search gracefully rather than hard error
    if (!imageBase64) {
      return NextResponse.json({ error: 'Could not load the image. Try uploading a screenshot instead.' }, { status: 400 })
    }

    const searchRes = await fetch(`${SUPABASE_URL}/functions/v1/visual-search`, {
      method: 'POST',
      headers: supabaseHeaders(),
      body: JSON.stringify({ imageBase64 }),
    })
    return NextResponse.json(await searchRes.json())
  }

  // ── Image upload flow: base64 → visual-search directly ───────────────────
  if (body.imageBase64) {
    const searchRes = await fetch(`${SUPABASE_URL}/functions/v1/visual-search`, {
      method: 'POST',
      headers: supabaseHeaders(),
      body: JSON.stringify({ imageBase64: body.imageBase64 }),
    })

    const rawText = await searchRes.text()
    console.log('visual-search status:', searchRes.status, 'body:', rawText.slice(0, 300))

    if (!searchRes.ok) {
      return NextResponse.json({ error: `Visual search failed (${searchRes.status}): ${rawText.slice(0, 200)}` }, { status: 502 })
    }

    try {
      return NextResponse.json(JSON.parse(rawText))
    } catch {
      return NextResponse.json({ error: `Bad response from visual search: ${rawText.slice(0, 200)}` }, { status: 502 })
    }
  }

  return NextResponse.json({ error: 'Provide url or imageBase64' }, { status: 400 })
}
