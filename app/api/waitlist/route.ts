import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  const { email, source } = await request.json()

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Valid email required.' }, { status: 400 })
  }

  const { error } = await supabaseAdmin
    .from('waitlist')
    .insert({ email: email.toLowerCase().trim(), source: source ?? 'landing' })

  if (error) {
    if (error.code === '23505') {
      // Duplicate — treat as success so we don't leak membership
      return NextResponse.json({ ok: true })
    }
    return NextResponse.json({ error: 'Something went wrong. Try again.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
