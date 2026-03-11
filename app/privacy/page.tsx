import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata = {
  title: 'Privacy Policy — LKBK',
}

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto px-6 py-20 prose prose-gray">
        <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-gray-400 text-sm mb-10">Last updated: March 2026</p>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-3">1. Who we are</h2>
          <p className="text-gray-600 leading-relaxed">
            LKBK (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) operates shoplkbk.com and the LKBK mobile app.
            Our service helps users discover and shop products using AI-powered visual search.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-3">2. Information we collect</h2>
          <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-2">
            <li><strong>Account information:</strong> email address, display name, and profile photo when you create an account.</li>
            <li><strong>Usage data:</strong> URLs you submit for product search, images you upload, products you save, and wishlists you create.</li>
            <li><strong>Device and browser data:</strong> IP address, browser type, operating system, and pages visited, collected automatically via cookies and server logs.</li>
            <li><strong>Purchase data:</strong> information passed to us by affiliate networks when you complete a qualifying purchase through our links.</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-3">3. How we use your information</h2>
          <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-2">
            <li>To power the AI visual search and return product results.</li>
            <li>To save products, wishlists, and collections to your account.</li>
            <li>To calculate and credit cashback earned on qualifying purchases.</li>
            <li>To improve our service, debug issues, and analyze usage trends.</li>
            <li>To send transactional emails (account confirmation, cashback notifications).</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-3">4. Affiliate links and Skimlinks</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            LKBK uses <a href="https://skimlinks.com" className="underline text-gray-800" target="_blank" rel="noopener noreferrer">Skimlinks</a>, a third-party affiliate technology provider, to monetize product links on our site and in our app.
          </p>
          <p className="text-gray-600 leading-relaxed mb-4">
            When you click a product link on LKBK, Skimlinks may set a cookie on your device to track whether you complete a purchase. This cookie is used solely to attribute affiliate commissions and is governed by{' '}
            <a href="https://skimlinks.com/privacy-policy" className="underline text-gray-800" target="_blank" rel="noopener noreferrer">
              Skimlinks&apos; privacy policy
            </a>.
          </p>
          <p className="text-gray-600 leading-relaxed">
            You may opt out of Skimlinks tracking at any time via the{' '}
            <a href="https://optout.skimlinks.com/" className="underline text-gray-800" target="_blank" rel="noopener noreferrer">
              Skimlinks opt-out page
            </a>.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-3">5. Cookies</h2>
          <p className="text-gray-600 leading-relaxed">
            We use cookies and similar technologies for authentication, analytics, and affiliate tracking.
            Strictly necessary cookies are required for the service to function. Analytics and affiliate
            tracking cookies can be declined via your browser settings or the Skimlinks opt-out link above.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-3">6. Data sharing</h2>
          <p className="text-gray-600 leading-relaxed">
            We do not sell your personal information. We share data only with:
          </p>
          <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-2 mt-3">
            <li><strong>Supabase</strong> — our backend infrastructure provider (database, authentication, file storage).</li>
            <li><strong>Skimlinks</strong> — affiliate link management and commission tracking.</li>
            <li><strong>AI service providers</strong> (Google Cloud Vision, Gemini) — to process images for product identification. Images are not retained by these providers beyond the API call.</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-3">7. Data retention</h2>
          <p className="text-gray-600 leading-relaxed">
            We retain your account data for as long as your account is active. You may request deletion of
            your account and associated data at any time by emailing{' '}
            <a href="mailto:privacy@shoplkbk.com" className="underline text-gray-800">privacy@shoplkbk.com</a>.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-3">8. Children</h2>
          <p className="text-gray-600 leading-relaxed">
            LKBK is not directed at children under the age of 13. We do not knowingly collect personal
            information from children under 13.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-3">9. Changes to this policy</h2>
          <p className="text-gray-600 leading-relaxed">
            We may update this Privacy Policy from time to time. Material changes will be communicated
            via email or a prominent notice on our website.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-3">10. Contact us</h2>
          <p className="text-gray-600 leading-relaxed">
            Questions about this policy? Email us at{' '}
            <a href="mailto:privacy@shoplkbk.com" className="underline text-gray-800">privacy@shoplkbk.com</a>.
          </p>
        </section>
      </main>
      <Footer />
    </>
  )
}
