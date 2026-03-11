import { NextRequest, NextResponse } from 'next/server'

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

    if (!scrapeData.imageUrl) {
      return NextResponse.json({ error: 'Could not extract an image from that URL.' }, { status: 400 })
    }

    const imgRes = await fetch(scrapeData.imageUrl)
    if (!imgRes.ok) {
      return NextResponse.json({ error: 'Could not download product image.' }, { status: 502 })
    }

    const imgBuffer = await imgRes.arrayBuffer()
    const imageBase64 = Buffer.from(imgBuffer).toString('base64')

    const searchRes = await fetch(`${SUPABASE_URL}/functions/v1/visual-search`, {
      method: 'POST',
      headers: supabaseHeaders(),
      body: JSON.stringify({ imageBase64 }),
    })

    const results = await searchRes.json()
    return NextResponse.json(results)
  }

  // ── Image upload flow: base64 → visual-search directly ───────────────────
  if (body.imageBase64) {
    const searchRes = await fetch(`${SUPABASE_URL}/functions/v1/visual-search`, {
      method: 'POST',
      headers: supabaseHeaders(),
      body: JSON.stringify({ imageBase64: body.imageBase64 }),
    })

    const results = await searchRes.json()
    return NextResponse.json(results)
  }

  return NextResponse.json({ error: 'Provide url or imageBase64' }, { status: 400 })
}
