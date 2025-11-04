import { ArrowRight, Play } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-[#0A1A33] via-[#0A1A33] to-[#0d2347] text-white overflow-hidden">
      {/* Animated gradient orbs */}
      <div className="absolute top-20 right-20 w-96 h-96 bg-[#1E6BFF] rounded-full blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-20 left-20 w-80 h-80 bg-[#1E6BFF] rounded-full blur-3xl opacity-15 animate-pulse animation-delay-400"></div>

      <div className="max-w-7xl mx-auto px-6 py-20 lg:py-32 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 opacity-0 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-sm">
              <span className="w-2 h-2 bg-[#1E6BFF] rounded-full animate-pulse"></span>
              <span>Trusted by 500+ SaaS teams</span>
            </div>

            <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
              Consistent content that drives{' '}
              <span className="bg-gradient-to-r from-[#1E6BFF] to-[#4D8AFF] bg-clip-text text-transparent">
                momentum
              </span>
            </h1>

            <p className="text-xl text-gray-300 leading-relaxed">
              Plan, create, and publish across every channel with confidence.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button className="group bg-[#1E6BFF] hover:bg-[#1557E0] text-white px-8 py-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-[#1E6BFF]/30 hover:shadow-xl hover:shadow-[#1E6BFF]/40 hover:scale-105">
                Try PostPulse Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button className="group bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white px-8 py-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2">
                <Play className="w-5 h-5" />
                See Demo
              </button>
            </div>

            <div className="flex items-center gap-8 pt-4 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-[#1E6BFF]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                No credit card required
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-[#1E6BFF]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                14-day free trial
              </div>
            </div>
          </div>

          <div className="relative opacity-0 animate-fade-in-up animation-delay-200">
            <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 rounded-2xl p-8 shadow-2xl">
              {/* Platform mockup */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>

                <div className="bg-white/5 rounded-lg p-6 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#1E6BFF] to-[#4D8AFF] rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-white/20 rounded w-3/4"></div>
                      <div className="h-2 bg-white/10 rounded w-1/2"></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-20 bg-gradient-to-br from-[#1E6BFF]/30 to-[#4D8AFF]/20 rounded-lg border border-[#1E6BFF]/30"></div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    {['Twitter', 'LinkedIn', 'Facebook'].map((platform) => (
                      <div key={platform} className="flex-1 bg-white/10 rounded-lg px-3 py-2 text-xs text-center">
                        {platform}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating status indicators */}
              <div className="absolute -top-4 -right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-semibold flex items-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                Published
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
