import { AlertCircle, Clock, TrendingDown } from 'lucide-react';

export function Problem() {
  const problems = [
    {
      icon: Clock,
      text: 'Manual content planning and posting',
    },
    {
      icon: TrendingDown,
      text: 'Inconsistent brand presence across channels',
    },
    {
      icon: AlertCircle,
      text: 'Missed launch deadlines and low engagement',
    },
  ];

  return (
    <section className="py-20 lg:py-28 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-[#0A1A33] mb-4">
            Marketing chaos slows growth
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {problems.map((problem, index) => {
            const Icon = problem.icon;
            return (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-xl p-8 hover:shadow-lg transition-all duration-300 hover:border-[#1E6BFF]/30 group"
              >
                <div className="w-14 h-14 bg-red-50 rounded-lg flex items-center justify-center mb-6 group-hover:bg-red-100 transition-colors">
                  <Icon className="w-7 h-7 text-red-500" />
                </div>
                <p className="text-lg text-gray-700 leading-relaxed">
                  {problem.text}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
