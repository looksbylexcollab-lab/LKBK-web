import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400 mt-20">
      <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <p className="text-white font-bold text-xl mb-1">LKBK</p>
          <p className="text-sm">Shop smarter. Earn cashback.</p>
        </div>
        <nav className="flex flex-wrap gap-6 text-sm">
          <Link href="/shop" className="hover:text-white transition-colors">Shop</Link>
          <Link href="/about" className="hover:text-white transition-colors">About</Link>
          <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
        </nav>
      </div>
      <div className="border-t border-gray-800 text-center py-4 text-xs px-6">
        © {new Date().getFullYear()} LKBK. Affiliate links powered by{' '}
        <a href="https://skimlinks.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">
          Skimlinks
        </a>
        .
      </div>
    </footer>
  )
}
