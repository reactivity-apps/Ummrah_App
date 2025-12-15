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
    <section className="py-24 px-6 bg-gray-50">
      <div className="max-w-5xl mx-auto text-center space-y-12">
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Trusted by groups worldwide</h2>
          <p className="text-xl text-gray-600">Join the organizations making Umrah journeys seamless</p>
        </div>

        <div className="flex justify-center gap-8 flex-wrap">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-32 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-sm"
            >
              [ Logo {i} ]
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-8 mt-16">
          {quotes.map((quote, index) => (
            <div key={index} className="bg-white p-8 rounded-2xl shadow-sm">
              <p className="text-xl text-gray-700 mb-4 italic">"{quote.text}"</p>
              <p className="text-gray-500">— {quote.author}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
