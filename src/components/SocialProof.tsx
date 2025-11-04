import { Star, Building2 } from 'lucide-react';

export function SocialProof() {
  const testimonials = [
    {
      quote: "PostPulse transformed how we manage content. We've tripled our posting consistency and engagement is up 40%.",
      author: "Sarah Chen",
      role: "Head of Marketing",
      company: "TechFlow",
    },
    {
      quote: "The AI content studio alone saved us 15 hours a week. This tool pays for itself in the first month.",
      author: "Marcus Rodriguez",
      role: "Growth Lead",
      company: "DataSync",
    },
    {
      quote: "Finally, a platform that connects all our channels. Our team collaborates seamlessly and ships campaigns faster.",
      author: "Emily Thompson",
      role: "Marketing Director",
      company: "CloudNest",
    },
  ];

  const logos = [
    { name: 'TechFlow', width: 'w-28' },
    { name: 'DataSync', width: 'w-32' },
    { name: 'CloudNest', width: 'w-28' },
    { name: 'Innovate', width: 'w-32' },
    { name: 'PulseAI', width: 'w-28' },
  ];

  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Customer Logos */}
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-8">
            Trusted by innovative SaaS teams
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-12">
            {logos.map((logo, index) => (
              <div
                key={index}
                className={`${logo.width} h-12 bg-gray-200 rounded-lg flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity`}
              >
                <Building2 className="w-6 h-6 text-gray-600" />
                <span className="ml-2 text-gray-700 font-semibold">{logo.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-xl p-8 border border-gray-200 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-[#1E6BFF] text-[#1E6BFF]" />
                ))}
              </div>
              <p className="text-gray-700 leading-relaxed mb-6 italic">
                "{testimonial.quote}"
              </p>
              <div>
                <p className="font-semibold text-[#0A1A33]">{testimonial.author}</p>
                <p className="text-sm text-gray-600">
                  {testimonial.role} at {testimonial.company}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
