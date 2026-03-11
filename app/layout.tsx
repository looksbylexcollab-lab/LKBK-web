import type { Metadata } from 'next'
import Script from 'next/script'
import { AuthProvider } from '@/components/AuthProvider'
import './globals.css'

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
      <body style={{ fontFamily: "Calibri, Candara, 'Segoe UI', 'Trebuchet MS', sans-serif" }}>
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
