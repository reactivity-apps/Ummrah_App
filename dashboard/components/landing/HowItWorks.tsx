export default function HowItWorks() {
  const steps = [
    {
      number: '1',
      title: 'Create a group',
      description: 'Set up your organization and invite admins',
    },
    {
      number: '2',
      title: 'Set up your trip',
      description: 'Add dates, cities, and itinerary details',
    },
    {
      number: '3',
      title: 'Share a join code',
      description: 'Travelers join instantly with a simple code',
    },
    {
      number: '4',
      title: 'Guide travelers',
      description: 'Support them before and during Umrah',
    },
  ];

  return (
    <section id="how-it-works" className="py-16 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#292524] mb-3">How it works</h2>
          <p className="text-lg text-[#78716c]">Simple, reassuring, and very linear</p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div key={index} className="text-center space-y-3">
              <div className="w-14 h-14 mx-auto bg-[#C5A059]/10 rounded-full flex items-center justify-center text-xl font-bold text-[#C5A059] border-2 border-[#C5A059]/20">
                {step.number}
              </div>
              <div className="bg-[#fdfbf7] rounded-lg h-40 flex items-center justify-center text-[#78716c] text-sm border border-[#e8dfc8]">
                [ Illustration placeholder ]
              </div>
              <h3 className="text-lg font-semibold text-[#292524]">{step.title}</h3>
              <p className="text-sm text-[#78716c]">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
