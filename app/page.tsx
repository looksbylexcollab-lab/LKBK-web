import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function HomePage() {
  return (
    <>
      <Header />

      {/* Hero */}
      <section className="bg-black text-white px-6 py-24 md:py-36 text-center">
        <p className="text-brand-400 uppercase tracking-widest text-sm font-semibold mb-4">
          AI-powered shopping discovery
        </p>
        <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
          Shop anything
          <br />
          you see.
        </h1>
        <p className="text-gray-300 text-xl md:text-2xl max-w-2xl mx-auto mb-10">
          Paste a link from Instagram, TikTok, or anywhere on the web.
          Our AI finds the exact product — with cashback.
        </p>
        <Link
          href="/shop"
          className="inline-block bg-brand-500 hover:bg-brand-400 text-white font-semibold text-lg px-10 py-4 rounded-full transition-colors"
        >
          Start Discovering
        </Link>
      </section>

      {/* Features */}
      <section className="px-6 py-20 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-14">Everything you need to shop smarter</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            {
              icon: '🔍',
              title: 'AI Visual Search',
              body: 'Paste any link or upload a photo. Our AI identifies the exact product, brand, and price in seconds.',
            },
            {
              icon: '❤️',
              title: 'Save & Share',
              body: 'Build wishlists and collections. Share them with friends and family — perfect for gift registries.',
            },
            {
              icon: '💰',
              title: 'Earn Cashback',
              body: 'Shop through LKBK and earn money back on every qualifying purchase. No extra steps required.',
            },
          ].map((f) => (
            <div key={f.title} className="text-center">
              <div className="text-5xl mb-4">{f.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
              <p className="text-gray-500 leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-14">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Find a product you love', body: 'See something on Instagram, TikTok, or any website? Copy the link.' },
              { step: '02', title: 'Drop it into LKBK', body: 'Paste the URL or upload a photo. Our AI scans the image and identifies the product.' },
              { step: '03', title: 'Shop & earn cashback', body: 'Click "Shop Now" and earn cashback automatically on qualifying purchases.' },
            ].map((s) => (
              <div key={s.step} className="flex flex-col">
                <span className="text-brand-500 font-bold text-sm mb-2">{s.step}</span>
                <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to start shopping smarter?</h2>
        <p className="text-gray-500 mb-8 text-lg">No account required to try it out.</p>
        <Link
          href="/shop"
          className="inline-block bg-black hover:bg-gray-800 text-white font-semibold text-lg px-10 py-4 rounded-full transition-colors"
        >
          Try Visual Search
        </Link>
      </section>

      {/* Affiliate disclosure */}
      <div className="text-center text-xs text-gray-400 pb-6 px-6">
        LKBK participates in affiliate programs including Skimlinks. We may earn a commission when you shop through our links — at no extra cost to you.
      </div>

      <Footer />
    </>
  )
}
