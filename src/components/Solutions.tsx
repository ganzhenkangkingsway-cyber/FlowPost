import { Building2, Calendar, Sparkles, Send, BarChart3 } from 'lucide-react';

export function Solutions() {
  const modules = [
    {
      icon: Building2,
      title: 'Brand Hub',
      description: 'Centralize assets, guidelines, and voice for consistent branding',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Calendar,
      title: 'Smart Content Planner',
      description: 'Visual calendar with drag-and-drop scheduling across channels',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: Sparkles,
      title: 'AI Content Studio',
      description: 'Generate, refine, and adapt content for every platform instantly',
      gradient: 'from-orange-500 to-red-500',
    },
    {
      icon: Send,
      title: 'Automated Publishing',
      description: 'Schedule once, publish everywhere at optimal times',
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      icon: BarChart3,
      title: 'Analytics & Optimization',
      description: 'Real-time insights to improve performance and engagement',
      gradient: 'from-indigo-500 to-blue-500',
    },
  ];

  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-[#0A1A33] mb-4">
            Everything you need in one{' '}
            <span className="bg-gradient-to-r from-[#1E6BFF] to-[#4D8AFF] bg-clip-text text-transparent">
              pulse
            </span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module, index) => {
            const Icon = module.icon;
            return (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-xl p-8 hover:shadow-xl transition-all duration-300 hover:border-[#1E6BFF]/30 hover:-translate-y-1 group"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${module.gradient} rounded-xl flex items-center justify-center mb-6 shadow-lg`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#0A1A33] mb-3 group-hover:text-[#1E6BFF] transition-colors">
                  {module.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {module.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
