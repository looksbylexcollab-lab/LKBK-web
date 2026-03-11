import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata = {
  title: 'Terms of Service — LKBK',
}

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto px-6 py-20">
        <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
        <p className="text-gray-400 text-sm mb-10">Last updated: March 2026</p>

        {[
          {
            title: '1. Acceptance of terms',
            body: 'By using shoplkbk.com or the LKBK mobile app, you agree to these Terms of Service. If you do not agree, please do not use our service.',
          },
          {
            title: '2. Description of service',
            body: 'LKBK provides an AI-powered product discovery service. You can submit URLs and images to identify products, save items to wishlists and collections, and shop through affiliate links. Cashback is earned on qualifying purchases made through LKBK affiliate links.',
          },
          {
            title: '3. User accounts',
            body: 'You must provide accurate information when creating an account. You are responsible for maintaining the security of your account credentials. You may not use another person\'s account.',
          },
          {
            title: '4. Acceptable use',
            body: 'You agree not to use LKBK to: (a) violate any applicable law or regulation; (b) submit content that infringes intellectual property rights; (c) attempt to reverse-engineer, scrape, or disrupt our services; or (d) engage in any fraudulent activity related to cashback or affiliate commissions.',
          },
          {
            title: '5. Affiliate links and cashback',
            body: 'Product links on LKBK may be affiliate links. When you purchase through these links, LKBK earns a commission from the retailer. A portion of that commission may be credited to your LKBK cashback balance. Cashback rates are subject to change and are not guaranteed on all purchases. LKBK is not responsible for retailer policies, pricing, or product availability.',
          },
          {
            title: '6. Intellectual property',
            body: 'All content, design, and technology on LKBK is owned by or licensed to LKBK. You may not reproduce or distribute our content without written permission.',
          },
          {
            title: '7. Disclaimers',
            body: 'LKBK is provided "as is" without warranties of any kind. We do not guarantee the accuracy of AI-generated product identifications, prices, or availability. We are not responsible for retailer errors, shipping issues, or purchases that do not qualify for cashback.',
          },
          {
            title: '8. Limitation of liability',
            body: 'To the maximum extent permitted by law, LKBK shall not be liable for any indirect, incidental, or consequential damages arising from your use of the service.',
          },
          {
            title: '9. Changes to terms',
            body: 'We may update these Terms at any time. Continued use of LKBK after changes constitutes your acceptance of the updated Terms.',
          },
          {
            title: '10. Contact',
            body: 'Questions? Email us at legal@shoplkbk.com.',
          },
        ].map((s) => (
          <section key={s.title} className="mb-10">
            <h2 className="text-2xl font-semibold mb-3">{s.title}</h2>
            <p className="text-gray-600 leading-relaxed">{s.body}</p>
          </section>
        ))}
      </main>
      <Footer />
    </>
  )
}
