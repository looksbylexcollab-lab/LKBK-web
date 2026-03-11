import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-charcoal text-pearl-300 mt-24">
      <div className="max-w-6xl mx-auto px-8 py-16 grid grid-cols-1 md:grid-cols-3 gap-12">
        <div>
          <p className="text-base font-light tracking-luxury uppercase text-pearl-100 mb-3">LKBK</p>
          <p className="text-xs text-pearl-400 leading-relaxed">
            AI-powered shopping discovery.<br />Shop smarter. Earn cashback.
          </p>
        </div>

        <div>
          <p className="label-caps text-pearl-400 mb-4">Explore</p>
          <div className="flex flex-col gap-2">
            <Link href="/shop" className="text-xs text-pearl-300 hover:text-gold-300 transition-colors">Discover</Link>
            <Link href="/wishlists" className="text-xs text-pearl-300 hover:text-gold-300 transition-colors">Wishlists</Link>
            <Link href="/collections" className="text-xs text-pearl-300 hover:text-gold-300 transition-colors">Collections</Link>
            <Link href="/about" className="text-xs text-pearl-300 hover:text-gold-300 transition-colors">About</Link>
          </div>
        </div>

        <div>
          <p className="label-caps text-pearl-400 mb-4">Legal</p>
          <div className="flex flex-col gap-2">
            <Link href="/privacy" className="text-xs text-pearl-300 hover:text-gold-300 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-xs text-pearl-300 hover:text-gold-300 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>

      <div className="border-t border-charcoal-light">
        <div className="max-w-6xl mx-auto px-8 py-5 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-pearl-400">© {new Date().getFullYear()} LKBK. All rights reserved.</p>
          <p className="text-xs text-pearl-400">
            Affiliate links powered by{' '}
            <a href="https://skimlinks.com" target="_blank" rel="noopener noreferrer" className="hover:text-gold-300 transition-colors">
              Skimlinks
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
