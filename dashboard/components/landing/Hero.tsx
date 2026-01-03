'use client';

import Image from 'next/image';

export default function Hero() {
  return (
    <section className="min-h-[85vh] flex items-center justify-center px-6 pt-20 bg-[#fdfbf7]">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          {/* Logo above heading */}
          <div className="flex justify-start">
            <Image
              src="/Safar.svg"
              alt="Safar"
              width={180}
              height={60}
              className="h-14 w-auto"
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#292524] leading-tight">
            Calm, unified Umrah trip companion for groups
          </h1>
          <p className="text-lg text-[#78716c] leading-relaxed">
            Plan, guide, and support every traveler from preparation to return, all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => {
                const element = document.getElementById('get-started');
                element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
              className="px-6 py-3 bg-[#4A6741] text-white rounded-lg hover:bg-[#3f5838] transition-colors font-medium shadow-sm"
            >
              Get started as a group
            </button>
            <button
              onClick={() => {
                const element = document.getElementById('how-it-works');
                element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="px-6 py-3 border-2 border-[#C5A059] text-[#4A6741] rounded-lg hover:bg-[#C5A059]/5 transition-colors font-medium"
            >
              See the app
            </button>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center justify-center opacity-10 text-[180px] text-[#C5A059]">
            ☪
          </div>
          <div className="relative bg-white rounded-2xl aspect-[3/4] flex items-center justify-center text-[#78716c] border border-[#e8dfc8] shadow-lg">
            [ Phone mockup or video placeholder ]
          </div>
        </div>
      </div>
    </section>
  );
}
