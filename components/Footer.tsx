import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-bark text-cream-300 mt-0">
      <div className="max-w-6xl mx-auto px-8 py-16 grid grid-cols-1 md:grid-cols-3 gap-12">
        <div>
          <p className="text-lg font-bold tracking-wider text-white mb-3 font-sans">LKBK</p>
          <p className="text-xs text-cream-500 leading-relaxed font-sans">
            AI-powered shopping discovery.<br />Shop smarter. Earn cashback.
          </p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-cream-400 mb-4 font-sans">Explore</p>
          <div className="flex flex-col gap-2">
            <Link href="/shop" className="text-xs text-cream-300 hover:text-white transition-colors font-sans">Discover</Link>
            <Link href="/wishlists" className="text-xs text-cream-300 hover:text-white transition-colors font-sans">Wishlists</Link>
            <Link href="/collections" className="text-xs text-cream-300 hover:text-white transition-colors font-sans">Collections</Link>
            <Link href="/about" className="text-xs text-cream-300 hover:text-white transition-colors font-sans">About</Link>
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-cream-400 mb-4 font-sans">Legal</p>
          <div className="flex flex-col gap-2">
            <Link href="/privacy" className="text-xs text-cream-300 hover:text-white transition-colors font-sans">Privacy Policy</Link>
            <Link href="/terms" className="text-xs text-cream-300 hover:text-white transition-colors font-sans">Terms of Service</Link>
          </div>
        </div>
      </div>

      <div className="border-t border-bark-light">
        <div className="max-w-6xl mx-auto px-8 py-5 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-cream-500 font-sans">© {new Date().getFullYear()} LKBK. All rights reserved.</p>
          <p className="text-xs text-cream-500 font-sans">
            Affiliate links powered by{' '}
            <a href="https://skimlinks.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              Skimlinks
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
