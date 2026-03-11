import Link from 'next/link'

export default function Header() {
  return (
    <header className="bg-black text-white">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold tracking-tight">
          LKBK
        </Link>
        <nav className="flex items-center gap-8">
          <Link href="/shop" className="text-sm text-gray-300 hover:text-white transition-colors">
            Shop
          </Link>
          <Link href="/about" className="text-sm text-gray-300 hover:text-white transition-colors">
            About
          </Link>
          <Link
            href="/shop"
            className="bg-brand-500 hover:bg-brand-400 text-white text-sm font-semibold px-5 py-2 rounded-full transition-colors"
          >
            Try it free
          </Link>
        </nav>
      </div>
    </header>
  )
}
