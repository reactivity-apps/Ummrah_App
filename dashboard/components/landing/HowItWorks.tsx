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
    <section id="how-it-works" className="py-24 px-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">How it works</h2>
          <p className="text-xl text-gray-600">Simple, reassuring, and very linear</p>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-emerald-100 rounded-full flex items-center justify-center text-2xl font-bold text-emerald-700">
                {step.number}
              </div>
              <div className="bg-gray-200 rounded-lg h-48 flex items-center justify-center text-gray-400 text-sm">
                [ Illustration placeholder ]
              </div>
              <h3 className="text-xl font-semibold text-gray-900">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
