import { TrendingUp, Rocket, Zap } from 'lucide-react';

export function Benefits() {
  const benefits = [
    {
      icon: TrendingUp,
      title: 'Improve reach and posting consistency',
      description: 'Maintain a steady content flow that keeps your audience engaged across all platforms',
    },
    {
      icon: Rocket,
      title: 'Ship campaigns on time',
      description: 'Never miss a deadline with automated workflows and intelligent scheduling',
    },
    {
      icon: Zap,
      title: 'Reduce content creation workload by up to 60%',
      description: 'AI-powered tools streamline creation, letting your team focus on strategy',
    },
  ];

  return (
    <section className="py-20 lg:py-28 bg-gradient-to-br from-gray-50 to-blue-50/30">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-[#0A1A33] mb-4">
            Marketing without the bottlenecks
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-[#1E6BFF]/30"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-[#1E6BFF] to-[#4D8AFF] rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-[#1E6BFF]/20">
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#0A1A33] mb-3">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
