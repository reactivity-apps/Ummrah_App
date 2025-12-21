export default function SocialProof() {
  const quotes = [
    {
      text: 'This made coordinating our entire group effortless.',
      author: 'Group Organizer',
    },
    {
      text: 'Everything our travelers needed, without overwhelming them.',
      author: 'Travel Guide',
    },
  ];

  return (
    <section className="py-16 px-6 bg-[#fdfbf7]">
      <div className="max-w-5xl mx-auto text-center space-y-10">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-[#292524] mb-3">Trusted by groups worldwide</h2>
          <p className="text-lg text-[#78716c]">Join the organizations making Umrah journeys seamless</p>
        </div>

        <div className="flex justify-center gap-6 flex-wrap">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-28 h-14 bg-white rounded-lg flex items-center justify-center text-[#78716c] text-sm border border-[#e8dfc8]"
            >
              [ Logo {i} ]
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-12">
          {quotes.map((quote, index) => (
            <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-[#e8dfc8]">
              <p className="text-lg text-[#44403c] mb-3 italic">"{quote.text}"</p>
              <p className="text-sm text-[#78716c]">— {quote.author}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
