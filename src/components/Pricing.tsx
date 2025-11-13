import { Check, ArrowRight } from 'lucide-react';

export function Pricing() {
  const plans = [
    {
      name: 'Basic',
      price: '$0',
      period: '/forever',
      description: 'Perfect for individuals starting out',
      features: [
        '1 social account',
        '10 posts per month',
        'Basic scheduling',
        'Content calendar',
        'Community support',
      ],
      cta: 'Get Started Free',
      popular: false,
    },
    {
      name: 'Starter',
      price: '$19',
      period: '/month',
      description: 'Perfect for small teams getting started',
      features: [
        '5 social accounts',
        '30 scheduled posts/month',
        'Basic analytics',
        'Email support',
      ],
      cta: 'Start 14-Day Free Trial',
      popular: false,
    },
    {
      name: 'Professional',
      price: '$49',
      period: '/month',
      description: 'For growing teams ready to scale',
      features: [
        '15 social accounts',
        'Unlimited posts',
        'Advanced analytics',
        'Priority support',
        'Team collaboration (5 members)',
        'AI caption generation',
      ],
      cta: 'Start 14-Day Free Trial',
      popular: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      description: 'For established teams at scale',
      features: [
        'Unlimited accounts',
        'White-label',
        'Dedicated manager',
        'API access',
        'Custom integrations',
        'SLA guarantee',
      ],
      cta: 'Contact Sales',
      popular: false,
    },
  ];

  return (
    <section className="py-20 lg:py-28 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in-up">
          <h2 className="text-4xl lg:text-5xl font-bold text-[#0A1A33] mb-4">
            Plans built for growing SaaS teams
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 stagger-animation">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`bg-white rounded-2xl p-6 lg:p-8 border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 ${
                plan.popular
                  ? 'border-[#1E6BFF] shadow-lg shadow-[#1E6BFF]/10 relative lg:scale-105'
                  : 'border-gray-200 hover:border-[#1E6BFF]/30'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#1E6BFF] text-white px-4 py-1 rounded-full text-sm font-semibold animate-pulse-slow">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-2xl font-bold text-[#0A1A33] mb-2">{plan.name}</h3>
                <p className="text-gray-600 text-sm">{plan.description}</p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline">
                  <span className="text-5xl font-bold text-[#0A1A33]">{plan.price}</span>
                  <span className="text-gray-600 ml-2">{plan.period}</span>
                </div>
              </div>

              <button
                className={`w-full py-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 mb-8 group focus-brand active:scale-[0.98] ${
                  plan.popular
                    ? 'bg-[#1E6BFF] text-white hover:bg-[#1557E0] shadow-lg shadow-[#1E6BFF]/30 hover:shadow-xl hover:-translate-y-1'
                    : 'bg-gray-100 text-[#0A1A33] hover:bg-gray-200 hover:-translate-y-1'
                }`}
              >
                {plan.cta}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <ul className="space-y-4">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#1E6BFF] flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="text-center text-gray-600 mt-12">
          All plans include a 14-day free trial. No credit card required.
        </p>
      </div>
    </section>
  );
}
