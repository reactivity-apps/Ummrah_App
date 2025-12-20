export default function FeatureHighlights() {
  const features = [
    {
      title: 'Itinerary',
      description: 'Keep everyone aligned with day-by-day plans, locations, and reminders.',
      imagePosition: 'left',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      title: 'Announcements',
      description: 'Send updates instantly so no one misses important information.',
      imagePosition: 'right',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
        </svg>
      ),
    },
    {
      title: 'Dua library',
      description: 'Curated duas for each stage of the journey, accessible anytime.',
      imagePosition: 'left',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
    {
      title: 'Ziyarat resources',
      description: 'Context, etiquette, and historical background in one place.',
      imagePosition: 'right',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      title: 'Offline-friendly',
      description: 'Access essentials even without reliable connectivity.',
      imagePosition: 'left',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
  ];

  return (
    <section id="features" className="py-16 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-[#292524] mb-3">Everything your group needs</h2>
          <p className="text-lg text-[#78716c]">Comprehensive tools to guide your travelers every step of the way</p>
        </div>

        <div className="space-y-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`grid md:grid-cols-2 gap-10 items-center ${feature.imagePosition === 'right' ? 'md:grid-flow-dense' : ''
                }`}
            >
              <div className={feature.imagePosition === 'right' ? 'md:col-start-2' : ''}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-[#4A6741]">{feature.icon}</span>
                  <h3 className="text-2xl font-bold text-[#292524]">{feature.title}</h3>
                </div>
                <p className="text-base text-[#78716c] leading-relaxed">{feature.description}</p>
              </div>
              <div className={feature.imagePosition === 'right' ? 'md:col-start-1 md:row-start-1' : ''}>
                <div className="bg-[#fdfbf7] rounded-2xl aspect-video flex items-center justify-center text-[#78716c] border border-[#e8dfc8]">
                  [ Image / video placeholder ]
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
