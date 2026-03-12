import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import WaitlistForm from '@/components/WaitlistForm'

export default function HomePage() {
  return (
    <>
      <Header />

      {/* Hero */}
      <section className="bg-cream-200 overflow-hidden">
        <div className="max-w-6xl mx-auto px-8 py-20 md:py-32 flex flex-col md:flex-row items-center gap-12 md:gap-16">

          {/* Left — copy */}
          <div className="flex-1 text-left">
            <div className="inline-flex items-center gap-2 bg-tan-200/20 border border-tan-200/40 rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 bg-tan-400 rounded-full animate-pulse" />
              <span className="text-xs text-tan-500 font-medium font-sans tracking-wide">Now accepting beta signups</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-bark leading-[1.05] mb-6">
              Save what<br />you love,<br />
              <span className="italic text-tan-400">shop it later.</span>
            </h1>

            <p className="text-bark-muted text-base leading-relaxed max-w-md mb-8 font-sans">
              LKBK is the AI-powered lookbook app for fashion lovers. Paste a link, share from Instagram or TikTok — our AI identifies products instantly. Organize collections, share wishlists, earn cashback.
            </p>

            <WaitlistForm />

            <p className="text-xs text-bark-subtle font-sans mt-3">Free · No credit card required · iOS app coming soon</p>
          </div>

          {/* Right — phone mockup */}
          <div className="flex-shrink-0 flex justify-center md:justify-end w-full md:w-auto">
            <div className="relative">
              {/* Phone frame */}
              <div className="w-[240px] md:w-[280px] bg-bark rounded-[2.5rem] p-2 shadow-2xl shadow-bark/20 rotate-3">
                <div className="bg-cream-100 rounded-[2rem] overflow-hidden" style={{ height: '520px' }}>
                  {/* Status bar */}
                  <div className="bg-cream-100 px-5 pt-3 pb-2 flex justify-between items-center">
                    <span className="text-[10px] font-semibold text-bark font-sans">9:41</span>
                    <div className="w-20 h-4 bg-bark rounded-full" />
                    <div className="flex gap-1">
                      <div className="w-3 h-2 bg-bark rounded-sm opacity-60" />
                      <div className="w-3 h-2 bg-bark rounded-sm opacity-80" />
                      <div className="w-3 h-2 bg-bark rounded-sm" />
                    </div>
                  </div>
                  {/* App header */}
                  <div className="px-4 py-2 border-b border-cream-300 flex items-center justify-between">
                    <span className="text-sm font-bold text-bark font-sans">LKBK</span>
                    <div className="w-6 h-6 bg-cream-300 rounded-full" />
                  </div>
                  {/* Product grid */}
                  <div className="p-3 grid grid-cols-2 gap-2">
                    {[
                      { bg: 'bg-[#D4C5B8]', h: 'h-28' },
                      { bg: 'bg-[#C8BAA8]', h: 'h-24' },
                      { bg: 'bg-[#BFB3A4]', h: 'h-24' },
                      { bg: 'bg-[#D4C5B8]', h: 'h-28' },
                    ].map((card, i) => (
                      <div key={i} className={`${card.bg} ${card.h} rounded-xl relative overflow-hidden`}>
                        <div className="absolute bottom-2 left-2 right-2 bg-white/80 rounded-lg px-2 py-1">
                          <div className="h-1.5 bg-bark/20 rounded w-3/4 mb-1" />
                          <div className="h-1.5 bg-bark/10 rounded w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Bottom nav */}
                  <div className="absolute bottom-4 left-2 right-2 bg-white rounded-2xl mx-1 px-4 py-2.5 flex justify-around shadow-sm">
                    {[
                      <svg key="home" width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.689Z"/><path d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.432Z"/></svg>,
                      <svg key="search" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"/></svg>,
                      <svg key="heart" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"/></svg>,
                      <svg key="user" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"/></svg>,
                    ].map((icon, i) => (
                      <div key={i} className={`text-${i === 0 ? 'bark' : 'bark-subtle'}`}>{icon}</div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating badge */}
              <div className="absolute -top-3 -right-4 bg-white rounded-2xl shadow-lg px-3 py-2 flex items-center gap-2 border border-cream-300">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <svg width="12" height="12" fill="none" stroke="#16a34a" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-bark font-sans leading-none">Product Identified</p>
                  <p className="text-[8px] text-bark-muted font-sans leading-none mt-0.5">Oak · Premium · Check S…</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social proof strip */}
      <section className="bg-bark text-white">
        <div className="max-w-4xl mx-auto px-8 py-6 flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16">
          {[
            { stat: 'AI-Powered', label: 'Product detection' },
            { stat: 'Cashback', label: 'On qualifying purchases' },
            { stat: 'Share', label: 'Wishlists with anyone' },
          ].map((item) => (
            <div key={item.stat} className="text-center">
              <p className="text-lg font-bold font-serif text-gold-200">{item.stat}</p>
              <p className="text-xs text-cream-500 font-sans mt-0.5">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Cards */}
      <section className="max-w-5xl mx-auto px-8 py-20">
        <div className="text-center mb-14">
          <p className="label-caps mb-4">What you get</p>
          <h2 className="text-4xl font-bold text-bark">Your lookbook, supercharged.</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: (
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                </svg>
              ),
              title: 'AI Visual Search',
              body: 'Snap a photo or screenshot of any look. Our AI identifies the exact items and finds where to buy them.',
            },
            {
              icon: (
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
                </svg>
              ),
              title: 'Paste Any Link',
              body: 'Share directly from Instagram, TikTok, Pinterest, or any website. Products are extracted automatically.',
            },
            {
              icon: (
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
                </svg>
              ),
              title: 'Smart Collections',
              body: 'Organize your saves into themed collections — Summer Fits, Home Inspo, Resort Wear. Your lookbook, your way.',
            },
            {
              icon: (
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                </svg>
              ),
              title: 'Shareable Wishlists',
              body: 'Create wishlists for birthdays, holidays, or just-because. Friends claim items so nothing gets double-bought.',
            },
            {
              icon: (
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              ),
              title: 'Cashback Rewards',
              body: 'Earn cashback on qualifying purchases when you shop through LKBK. Save what you love, save money too.',
            },
            {
              icon: (
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
                </svg>
              ),
              title: 'Social Sharing',
              body: 'Share your lookbook with a single link. Perfect for gift registries, style inspo, and holiday lists.',
            },
          ].map((f) => (
            <div key={f.title} className="cream-card p-8">
              <div className="w-12 h-12 bg-cream-400 rounded-xl flex items-center justify-center text-bark-muted mb-6">
                {f.icon}
              </div>
              <h3 className="text-base font-bold text-bark mb-3 font-sans">{f.title}</h3>
              <p className="text-sm text-bark-muted leading-relaxed font-sans">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-5xl mx-auto px-8">
        <div className="h-px bg-cream-400" />
      </div>

      {/* How it works */}
      <section id="how-it-works" className="max-w-4xl mx-auto px-8 py-20">
        <div className="text-center mb-16">
          <p className="label-caps mb-4">The Process</p>
          <h2 className="text-4xl font-bold text-bark">How it works</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            { step: '01', title: 'Find a product you love', body: 'See something on Instagram, TikTok, or any website? Copy the link or take a screenshot.' },
            { step: '02', title: 'Drop it into LKBK', body: 'Paste the URL or upload a photo. Our AI scans and identifies the product instantly.' },
            { step: '03', title: 'Shop & earn cashback', body: 'Tap Shop Now and earn cashback automatically on qualifying purchases.' },
          ].map((s) => (
            <div key={s.step} className="text-center">
              <p className="text-tan-400 font-bold text-3xl mb-4 font-serif">{s.step}</p>
              <div className="w-6 h-px bg-cream-500 mx-auto mb-4" />
              <h3 className="text-sm font-bold uppercase tracking-wide mb-3 text-bark font-sans">{s.title}</h3>
              <p className="text-sm text-bark-muted leading-relaxed font-sans">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-cream-300 border-t border-cream-400">
        <div className="max-w-2xl mx-auto px-8 py-20 text-center flex flex-col items-center">
          <p className="label-caps mb-4">Be first in line</p>
          <h2 className="text-4xl font-bold text-bark mb-4">Get early access.</h2>
          <p className="text-sm text-bark-muted mb-8 font-sans max-w-sm">
            Join the waitlist and be among the first to try LKBK when we launch. Limited beta spots available.
          </p>
          <WaitlistForm source="bottom-cta" />
        </div>
      </section>

      {/* Affiliate note */}
      <div className="text-center text-xs text-bark-subtle pb-8 pt-6 px-8 font-sans">
        LKBK participates in affiliate programs including Skimlinks. We may earn a commission when you shop through our links — at no extra cost to you.
      </div>

      <Footer />
    </>
  )
}
