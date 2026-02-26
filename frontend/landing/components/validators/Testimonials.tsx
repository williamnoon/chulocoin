'use client';

export default function Testimonials() {
  const testimonials = [
    {
      quote: 'Made my money back in 3 months',
      text: 'Started with Junior Quant (50k CHULO). In 3 months I earned enough to cover my initial investment. Now it&apos;s pure profit every month.',
      author: 'Alex K.',
      role: 'Validator since Nov 2025',
      avatar: '👨‍💻',
      earnings: '$12,825',
      metric: 'Total Earned',
    },
    {
      quote: 'Easier than I expected',
      text: 'I&apos;m not technical but the setup took 10 minutes. Been running smoothly for 6 months. Earning $4k+/month passively.',
      author: 'Sarah M.',
      role: 'Validator since Dec 2025',
      avatar: '👩‍💼',
      earnings: '99.9%',
      metric: 'Uptime',
    },
    {
      quote: 'Scaled to 3 validators',
      text: 'Started with 1 node, now running 3 Junior Quant validators. Making $12k/month. Best decision in crypto.',
      author: 'Marcus T.',
      role: 'Validator since Jan 2026',
      avatar: '🧑‍🔬',
      earnings: '$12k',
      metric: 'Monthly Income',
    },
  ];

  return (
    <section className="w-full py-20 bg-slate-900">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Validator Success Stories
            </h2>
            <p className="text-xl text-gray-400">
              Real validators, real results
            </p>
          </div>

          {/* Testimonials Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-slate-800 border-2 border-slate-700 rounded-lg p-6 hover:border-chulo/40 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-chulo/10"
              >
                {/* Avatar */}
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-chulo to-green-600 rounded-full flex items-center justify-center text-2xl mr-4">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-white">{testimonial.author}</div>
                    <div className="text-sm text-gray-400">{testimonial.role}</div>
                  </div>
                </div>

                {/* Quote */}
                <div className="mb-4">
                  <div className="text-chulo-light text-6xl leading-none mb-2">&ldquo;</div>
                  <h3 className="text-xl font-bold text-white mb-3">{testimonial.quote}</h3>
                  <p className="text-gray-300 leading-relaxed">{testimonial.text}</p>
                </div>

                {/* Stats */}
                <div className="mt-6 pt-4 border-t border-slate-700">
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-gray-500 uppercase">{testimonial.metric}</div>
                    <div className="text-2xl font-bold text-chulo-light font-mono">
                      {testimonial.earnings}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Join Community */}
          <div className="mt-12 text-center">
            <p className="text-gray-400 mb-4">Want to share your validator story?</p>
            <a
              href="https://discord.gg/chulobots"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors duration-200"
            >
              Join Our Community →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
