import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function HomePage() {
  return (
    <>
      <Header />

      {/* Hero */}
      <section className="bg-cream-200">
        <div className="max-w-3xl mx-auto px-8 pt-24 pb-20 text-center">
          <p className="label-caps mb-6">Everything you need</p>
          <h1 className="text-5xl md:text-6xl font-bold text-bark leading-tight mb-6">
            Your lookbook,<br />supercharged.
          </h1>
          <p className="text-bark-muted text-lg leading-relaxed max-w-xl mx-auto mb-10">
            From AI-powered product discovery to shareable wishlists —
            LKBK is the only app you need to save, organize, and shop.
          </p>
          <Link href="/shop" className="btn-dark inline-block px-10 py-4 text-base">
            Get Early Access
          </Link>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="max-w-5xl mx-auto px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: (
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                </svg>
              ),
              title: 'AI Lens',
              body: 'Snap a photo or screenshot of any product. Our AI identifies the exact item and finds where to buy it.',
            },
            {
              icon: (
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
                </svg>
              ),
              title: 'Paste Any Link',
              body: 'Share from Instagram, TikTok, Pinterest, or any browser. We extract the product automatically.',
            },
            {
              icon: (
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
                </svg>
              ),
              title: 'Smart Collections',
              body: 'Organize your saves into themed collections — Summer Fits, Home Inspo, Resort Wear. Your lookbook, your way.',
            },
          ].map((f) => (
            <div key={f.title} className="cream-card p-8">
              <div className="w-12 h-12 bg-cream-400 rounded-xl flex items-center justify-center text-bark-muted mb-6">
                {f.icon}
              </div>
              <h3 className="text-base font-bold text-bark mb-3 font-sans">{f.title}</h3>
              <p className="text-sm text-bark-muted leading-relaxed font-sans">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-5xl mx-auto px-8">
        <div className="h-px bg-cream-400" />
      </div>

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-8 py-20">
        <div className="text-center mb-16">
          <p className="label-caps mb-4">The Process</p>
          <h2 className="text-4xl font-bold text-bark">How it works</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            { step: '01', title: 'Find a product you love', body: 'See something on Instagram, TikTok, or any website? Copy the link.' },
            { step: '02', title: 'Drop it into LKBK', body: 'Paste the URL or upload a photo. Our AI scans the image and identifies the product.' },
            { step: '03', title: 'Shop & earn cashback', body: 'Click Shop Now and earn cashback automatically on qualifying purchases.' },
          ].map((s) => (
            <div key={s.step} className="text-center">
              <p className="text-tan-400 font-bold text-3xl mb-4 font-serif">{s.step}</p>
              <div className="w-6 h-px bg-cream-500 mx-auto mb-4" />
              <h3 className="text-sm font-bold uppercase tracking-wide mb-3 text-bark font-sans">{s.title}</h3>
              <p className="text-sm text-bark-muted leading-relaxed font-sans">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-cream-300">
        <div className="max-w-2xl mx-auto px-8 py-20 text-center">
          <p className="label-caps mb-4">Get started</p>
          <h2 className="text-4xl font-bold text-bark mb-4">Ready to shop smarter?</h2>
          <p className="text-sm text-bark-muted mb-10 font-sans">No account required to try it out.</p>
          <Link href="/shop" className="btn-dark inline-block px-10 py-4 text-base">
            Try Visual Search
          </Link>
        </div>
      </section>

      {/* Affiliate note */}
      <div className="text-center text-xs text-bark-subtle pb-8 pt-6 px-8 font-sans">
        LKBK participates in affiliate programs including Skimlinks. We may earn a commission when you shop through our links — at no extra cost to you.
      </div>

      <Footer />
    </>
  )
}
