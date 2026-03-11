import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function HomePage() {
  return (
    <>
      <Header />

      {/* Hero */}
      <section className="bg-charcoal pearl-animated relative overflow-hidden">
        <div className="absolute inset-0 bg-charcoal/90" />
        <div className="relative max-w-4xl mx-auto px-8 py-36 text-center">
          <p className="label-caps text-gold-300 mb-6">AI-Powered Shopping Discovery</p>
          <div className="w-16 h-px bg-gold-300 mx-auto mb-10" />
          <h1 className="text-5xl md:text-7xl font-light text-pearl-100 leading-tight tracking-wide mb-8">
            Shop anything<br />
            <span className="text-gold-300">you see.</span>
          </h1>
          <p className="text-pearl-300 text-lg font-light leading-relaxed max-w-xl mx-auto mb-12">
            Paste a link from Instagram, TikTok, or anywhere on the web.
            Our AI finds the exact product — with cashback on every purchase.
          </p>
          <Link
            href="/shop"
            className="inline-block bg-gold-300 hover:bg-gold-200 text-charcoal label-caps px-12 py-4 transition-colors"
          >
            Start Discovering
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-8 py-28">
        <div className="text-center mb-16">
          <p className="label-caps text-gold-400 mb-4">Why LKBK</p>
          <h2 className="text-3xl font-light text-charcoal">Everything you need to shop smarter</h2>
          <div className="w-10 h-px bg-gold-300 mx-auto mt-6" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            {
              icon: '◈',
              title: 'AI Visual Search',
              body: 'Paste any link or upload a photo. Our AI identifies the exact product, brand, and price in seconds.',
            },
            {
              icon: '◇',
              title: 'Save & Share',
              body: 'Build wishlists and collections. Share them with friends and family — perfect for gift registries.',
            },
            {
              icon: '◉',
              title: 'Earn Cashback',
              body: 'Shop through LKBK and earn money back on every qualifying purchase. No extra steps required.',
            },
          ].map((f) => (
            <div key={f.title} className="text-center group">
              <div className="w-12 h-12 border border-gold-200 flex items-center justify-center mx-auto mb-6 text-gold-300 text-xl group-hover:border-gold-300 transition-colors">
                {f.icon}
              </div>
              <h3 className="text-base font-light tracking-wide uppercase mb-3 text-charcoal">{f.title}</h3>
              <p className="text-sm text-charcoal-muted leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-5xl mx-auto px-8">
        <div className="h-px bg-pearl-300" />
      </div>

      {/* How it works */}
      <section className="pearl-surface py-28">
        <div className="max-w-4xl mx-auto px-8">
          <div className="text-center mb-16">
            <p className="label-caps text-gold-400 mb-4">The Process</p>
            <h2 className="text-3xl font-light text-charcoal">How it works</h2>
            <div className="w-10 h-px bg-gold-300 mx-auto mt-6" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { step: 'I', title: 'Find a product you love', body: 'See something on Instagram, TikTok, or any website? Copy the link.' },
              { step: 'II', title: 'Drop it into LKBK', body: 'Paste the URL or upload a photo. Our AI scans the image and identifies the product.' },
              { step: 'III', title: 'Shop & earn cashback', body: 'Click Shop Now and earn cashback automatically on qualifying purchases.' },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <p className="text-gold-300 font-light text-2xl mb-4">{s.step}</p>
                <div className="w-6 h-px bg-gold-200 mx-auto mb-4" />
                <h3 className="text-sm font-light tracking-wide uppercase mb-3 text-charcoal">{s.title}</h3>
                <p className="text-xs text-charcoal-muted leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-2xl mx-auto px-8 py-28 text-center">
        <p className="label-caps text-gold-400 mb-4">Begin</p>
        <h2 className="text-3xl font-light text-charcoal mb-4">Ready to shop smarter?</h2>
        <p className="text-sm text-charcoal-muted mb-10">No account required to try it out.</p>
        <Link
          href="/shop"
          className="inline-block border border-charcoal text-charcoal label-caps px-12 py-4 hover:bg-charcoal hover:text-pearl-100 transition-colors"
        >
          Try Visual Search
        </Link>
      </section>

      {/* Affiliate note */}
      <div className="text-center text-xs text-charcoal-muted pb-8 px-8">
        LKBK participates in affiliate programs including Skimlinks. We may earn a commission when you shop through our links — at no extra cost to you.
      </div>

      <Footer />
    </>
  )
}
