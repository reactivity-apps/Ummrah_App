'use client';

export default function Hero() {
  return (
    <section className="min-h-screen flex items-center justify-center px-6 pt-20">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-8">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
            Calm, unified Umrah trip companion for groups
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Plan, guide, and support every traveler from preparation to return, all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => console.log('Get started clicked')}
              className="px-8 py-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-lg"
            >
              Get started as a group
            </button>
            <button
              onClick={() => console.log('See the app clicked')}
              className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-lg"
            >
              See the app
            </button>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center justify-center opacity-10 text-[200px] text-amber-500">
            ☪
          </div>
          <div className="relative bg-gray-100 rounded-2xl aspect-[3/4] flex items-center justify-center text-gray-400">
            [ Phone mockup or video placeholder ]
          </div>
        </div>
      </div>
    </section>
  );
}
