import type { Metadata } from 'next'
import Script from 'next/script'
import { Inter, Playfair_Display } from 'next/font/google'
import { AuthProvider } from '@/components/AuthProvider'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'LKBK — Shop Smarter',
  description:
    'Discover products from any photo, video, or social media post. AI-powered visual search with cashback on every qualifying purchase.',
  metadataBase: new URL('https://shoplkbk.com'),
  openGraph: {
    title: 'LKBK — Shop Smarter',
    description: 'Discover and shop products from any image or video.',
    url: 'https://shoplkbk.com',
    siteName: 'LKBK',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LKBK — Shop Smarter',
    description: 'Discover and shop products from any image or video.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const skimPubId = process.env.NEXT_PUBLIC_SKIMLINKS_PUB_ID

  return (
    <html lang="en">
      <body className={`${playfair.variable} ${inter.variable}`}>
        <AuthProvider>
          {children}
        </AuthProvider>

        {skimPubId && (
          <>
            <Script id="skimlinks-config" strategy="beforeInteractive">
              {`var skimlinks_pub_id = "ra-${skimPubId}"`}
            </Script>
            <Script
              src={`https://s.skimresources.com/js/${skimPubId}.skimlinks.js`}
              strategy="afterInteractive"
            />
          </>
        )}
      </body>
    </html>
  )
}
