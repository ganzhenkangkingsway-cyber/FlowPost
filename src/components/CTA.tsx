import { ArrowRight, Zap } from 'lucide-react';

export function CTA() {
  return (
    <section className="py-20 lg:py-28 bg-gradient-to-br from-[#0A1A33] via-[#0A1A33] to-[#0d2347] text-white relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#1E6BFF] rounded-full blur-3xl opacity-20"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#1E6BFF] rounded-full blur-3xl opacity-15"></div>

      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        <div className="w-16 h-16 bg-[#1E6BFF] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#1E6BFF]/30">
          <Zap className="w-8 h-8 text-white" />
        </div>

        <h2 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
          Stop juggling tools. Start scaling your marketing.
        </h2>

        <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
          Join hundreds of SaaS teams using PostPulse to streamline content creation and drive real growth.
        </p>

        <button className="group bg-[#1E6BFF] hover:bg-[#1557E0] text-white px-10 py-5 rounded-lg text-lg font-semibold transition-all duration-300 inline-flex items-center gap-3 shadow-xl shadow-[#1E6BFF]/30 hover:shadow-2xl hover:shadow-[#1E6BFF]/40 hover:scale-105">
          Start for Free
          <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
        </button>

        <p className="text-sm text-gray-400 mt-6">
          14-day free trial • No credit card required • Cancel anytime
        </p>
      </div>
    </section>
  );
}
