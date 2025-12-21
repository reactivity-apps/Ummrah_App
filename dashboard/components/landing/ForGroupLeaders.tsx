'use client';

import { useState } from 'react';

export default function ForGroupLeaders() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    groupSize: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    alert('Form data printed to console');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <section id="for-leaders" className="py-16 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div className="space-y-5">
            <h2 className="text-3xl font-bold text-[#292524]">
              Built for group leaders and organizers
            </h2>
            <p className="text-base text-[#78716c] leading-relaxed">
              Guide your group with clarity, reduce confusion, and spend less time repeating
              information.
            </p>
            <div className="relative pt-6">
              <div className="absolute top-0 right-0 text-[#C5A059] text-5xl opacity-20">☪</div>
              <div className="bg-[#fdfbf7] rounded-2xl aspect-video flex items-center justify-center text-[#78716c] border border-[#e8dfc8]">
                [ Leader dashboard mockup ]
              </div>
            </div>
          </div>

          <div id="get-started" className="bg-[#fdfbf7] p-6 rounded-2xl border border-[#e8dfc8]">
            <h3 className="text-xl font-bold text-[#292524] mb-5">Get started as a group</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-[#292524] mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-[#e8dfc8] rounded-lg focus:ring-2 focus:ring-[#4A6741] focus:border-transparent outline-none bg-white text-sm"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#292524] mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-[#e8dfc8] rounded-lg focus:ring-2 focus:ring-[#4A6741] focus:border-transparent outline-none bg-white text-sm"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label htmlFor="groupSize" className="block text-sm font-medium text-[#292524] mb-2">
                  Group size
                </label>
                <input
                  type="text"
                  id="groupSize"
                  name="groupSize"
                  value={formData.groupSize}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-[#e8dfc8] rounded-lg focus:ring-2 focus:ring-[#4A6741] focus:border-transparent outline-none bg-white text-sm"
                  placeholder="e.g., 20-30 travelers"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-[#292524] mb-2">
                  Optional message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-[#e8dfc8] rounded-lg focus:ring-2 focus:ring-[#4A6741] focus:border-transparent outline-none resize-none bg-white text-sm"
                  placeholder="Tell us about your group..."
                />
              </div>

              <button
                type="submit"
                className="w-full px-6 py-3 bg-[#4A6741] text-white rounded-lg hover:bg-[#3d5536] transition-colors font-medium"
              >
                Submit
              </button>

              <p className="text-xs text-[#78716c] text-center">
                We'll get back to you within 24 hours
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
