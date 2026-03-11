import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto px-6 py-20">
        <h1 className="text-4xl font-bold mb-6">About LKBK</h1>
        <p className="text-gray-600 text-lg leading-relaxed mb-6">
          LKBK is an AI-powered shopping discovery platform that helps you find, save, and shop products
          from anywhere — including directly from Instagram and TikTok content.
        </p>
        <p className="text-gray-600 text-lg leading-relaxed mb-6">
          See a product you love in a reel or on a website? Paste the link into LKBK and our AI identifies
          the item, finds where to buy it, and — in many cases — earns you cashback when you complete
          your purchase.
        </p>
        <h2 className="text-2xl font-bold mt-12 mb-4">Our mission</h2>
        <p className="text-gray-600 text-lg leading-relaxed mb-6">
          Shopping is fragmented. LKBK brings together AI visual search, social discovery, wishlist sharing,
          and real financial benefit in one place — so you can go from "I love that" to "I bought that" in seconds.
        </p>
        <h2 className="text-2xl font-bold mt-12 mb-4">Affiliate disclosure</h2>
        <p className="text-gray-600 text-lg leading-relaxed">
          LKBK participates in affiliate advertising programs including{' '}
          <a href="https://skimlinks.com" className="underline" target="_blank" rel="noopener noreferrer">
            Skimlinks
          </a>
          . When you click a "Shop Now" link and make a qualifying purchase, LKBK may earn a small commission
          — at no extra cost to you. A portion of that commission is passed back to you as cashback.
        </p>
      </main>
      <Footer />
    </>
  )
}
