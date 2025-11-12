import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Share2,
  Calendar,
  TrendingUp,
  Users,
  Sparkles,
  LayoutGrid,
  Play,
  Check,
  ChevronDown,
  Menu,
  X,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Star,
  ArrowRight,
  Zap,
} from 'lucide-react';

export function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [isAnnual, setIsAnnual] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: Share2,
      title: 'Post to All Platforms',
      description: 'Publish to Instagram, Facebook, Twitter, LinkedIn, and more with one click',
    },
    {
      icon: Calendar,
      title: 'AI-Powered Scheduling',
      description: 'Let AI find the best times to post for maximum engagement',
    },
    {
      icon: LayoutGrid,
      title: 'Visual Planning',
      description: 'Plan weeks ahead with drag-and-drop calendar',
    },
    {
      icon: TrendingUp,
      title: 'Track Performance',
      description: 'Monitor all platforms in one comprehensive dashboard',
    },
    {
      icon: Users,
      title: 'Work Together',
      description: 'Approval workflows and role-based permissions',
    },
    {
      icon: Sparkles,
      title: 'Generate Content',
      description: 'Create engaging captions instantly with AI',
    },
  ];

  const steps = [
    {
      number: '01',
      title: 'Upload Content',
      description: 'Add your images, videos, or create posts directly in the editor',
    },
    {
      number: '02',
      title: 'Select Platforms',
      description: 'Choose which social networks to post to with one click',
    },
    {
      number: '03',
      title: 'Schedule or Post',
      description: 'Publish immediately or schedule for the perfect time',
    },
    {
      number: '04',
      title: 'Track Results',
      description: 'Monitor engagement and optimize your strategy',
    },
  ];

  const plans = [
    {
      name: 'Starter',
      price: isAnnual ? '15' : '19',
      period: isAnnual ? '/mo (billed annually)' : '/mo',
      popular: false,
      features: [
        '5 social accounts',
        '30 scheduled posts/month',
        'Basic analytics',
        'Email support',
      ],
    },
    {
      name: 'Professional',
      price: isAnnual ? '39' : '49',
      period: isAnnual ? '/mo (billed annually)' : '/mo',
      popular: true,
      features: [
        '15 social accounts',
        'Unlimited posts',
        'Advanced analytics',
        'Priority support',
        'Team collaboration (5 members)',
        'AI caption generation',
      ],
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      popular: false,
      features: [
        'Unlimited accounts',
        'White-label',
        'Dedicated manager',
        'API access',
        'Custom integrations',
        'SLA guarantee',
      ],
    },
  ];

  const testimonials = [
    {
      quote: 'FlowPost cut our posting time by 80% while doubling engagement!',
      author: 'Sarah Chen',
      role: 'Marketing Director',
      company: 'TechFlow',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    },
    {
      quote: 'The AI scheduling is pure magic. Our reach has never been better.',
      author: 'Marcus Rodriguez',
      role: 'Social Media Manager',
      company: 'GrowthLabs',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    },
    {
      quote: 'Best investment for our agency. Clients love the analytics reports!',
      author: 'Emily Watson',
      role: 'Agency Owner',
      company: 'Digital Spark',
      avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    },
  ];

  const faqs = [
    {
      question: 'How does FlowPost work?',
      answer: 'FlowPost connects to your social media accounts and allows you to create, schedule, and publish content to multiple platforms from one central dashboard. Simply connect your accounts, create your content, and let FlowPost handle the rest.',
    },
    {
      question: 'Which platforms are supported?',
      answer: 'We currently support Instagram, Facebook, Twitter, LinkedIn, TikTok, Pinterest, and YouTube. We are constantly adding new platforms based on user demand.',
    },
    {
      question: 'Can I try it free?',
      answer: 'Yes! All plans come with a 14-day free trial. No credit card required to get started.',
    },
    {
      question: 'Do I need technical knowledge?',
      answer: 'Not at all! FlowPost is designed to be intuitive and user-friendly. If you can use social media, you can use FlowPost.',
    },
    {
      question: 'Can I cancel anytime?',
      answer: 'Yes, you can cancel your subscription at any time. No long-term contracts or cancellation fees.',
    },
    {
      question: 'Is my data secure?',
      answer: 'Absolutely. We use bank-level encryption and never store your social media passwords. We only request the minimum permissions needed to post on your behalf.',
    },
    {
      question: 'What team collaboration features are included?',
      answer: 'Professional and Enterprise plans include team member invitations, approval workflows, role-based permissions, and activity logs to keep your team coordinated.',
    },
    {
      question: 'What analytics are included?',
      answer: 'All plans include engagement metrics, reach data, and post performance tracking. Professional plans add competitor analysis and detailed demographic insights.',
    },
  ];

  return (
    <div className="bg-[#0A0A0F] text-white min-h-screen">
      {/* Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrollY > 50
            ? 'bg-[#0A0A0F]/80 backdrop-blur-xl border-b border-[#374151]'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-6 h-6 text-[#3B82F6]" />
              <span className="text-2xl font-bold">FlowPost</span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-[#9CA3AF] hover:text-white transition-colors">
                Features
              </a>
              <a href="#pricing" className="text-[#9CA3AF] hover:text-white transition-colors">
                Pricing
              </a>
              <a href="#testimonials" className="text-[#9CA3AF] hover:text-white transition-colors">
                About
              </a>
              <Link
                to="/login"
                className="px-6 py-3 bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] rounded-xl font-semibold hover:scale-105 transition-transform shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)]"
              >
                Sign In
              </Link>
            </div>

            <button
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden bg-[#0A0A0F] border-t border-[#374151]">
            <div className="px-6 py-4 flex flex-col gap-4">
              <a href="#features" className="text-[#9CA3AF] hover:text-white transition-colors">
                Features
              </a>
              <a href="#pricing" className="text-[#9CA3AF] hover:text-white transition-colors">
                Pricing
              </a>
              <a href="#testimonials" className="text-[#9CA3AF] hover:text-white transition-colors">
                About
              </a>
              <Link
                to="/login"
                className="px-6 py-3 bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] rounded-xl font-semibold text-center"
              >
                Sign In
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#3B82F6]/10 rounded-full border border-[#3B82F6]/30">
                <Zap className="w-4 h-4 text-[#3B82F6]" />
                <span className="text-sm text-[#3B82F6] font-medium">
                  Multi-Platform Social Media Manager
                </span>
              </div>

              <h1 className="text-6xl md:text-8xl lg:text-[96px] font-bold leading-[1.1] animate-fade-in-up">
                Post Once,
                <br />
                <span className="bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] bg-clip-text text-transparent">
                  Reach Everywhere.
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-[#D1D5DB] animate-fade-in-up animation-delay-200">
                Manage all your social media accounts from one powerful dashboard. Schedule
                posts, track analytics, and grow your audience.
              </p>

              <p className="text-lg text-[#9CA3AF] animate-fade-in-up animation-delay-400">
                Save 10+ hours per week with intelligent automation and AI-powered insights.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up animation-delay-600">
                <Link
                  to="/login"
                  className="px-8 py-4 bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] rounded-xl font-semibold text-lg hover:scale-105 transition-transform shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_40px_rgba(59,130,246,0.5)] text-center"
                >
                  Sign In to Get Started
                </Link>
              </div>

              <div className="flex items-center gap-2 text-sm text-[#9CA3AF]">
                <Check className="w-4 h-4 text-[#3B82F6]" />
                <span>Trusted by 1,000+ creators</span>
              </div>
            </div>

            <div className="relative animate-fade-in-up animation-delay-400">
              <div className="relative bg-[#1F2937] rounded-3xl p-8 shadow-[0_0_40px_rgba(59,130,246,0.2)] border border-[#374151] animate-float">
                <div className="space-y-6">
                  <div className="flex items-center gap-3 pb-4 border-b border-[#374151]">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] rounded-xl flex items-center justify-center">
                      <Share2 className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-semibold">Multi-Platform Post</div>
                      <div className="text-sm text-[#9CA3AF]">Ready to publish</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {[
                      { icon: Instagram, name: 'Instagram', color: '#E4405F' },
                      { icon: Facebook, name: 'Facebook', color: '#1877F2' },
                      { icon: Twitter, name: 'Twitter', color: '#1DA1F2' },
                      { icon: Linkedin, name: 'LinkedIn', color: '#0A66C2' },
                    ].map((platform, i) => (
                      <div
                        key={platform.name}
                        className="flex items-center justify-between p-3 bg-[#0A0A0F]/50 rounded-xl"
                        style={{ animationDelay: `${i * 0.1}s` }}
                      >
                        <div className="flex items-center gap-3">
                          <platform.icon className="w-5 h-5" style={{ color: platform.color }} />
                          <span className="text-sm">{platform.name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[#3B82F6]">
                          <Check className="w-4 h-4" />
                          <span className="text-xs">Connected</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button className="w-full py-3 bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] rounded-xl font-semibold hover:scale-105 transition-transform">
                    Publish to All
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-gradient-to-b from-transparent to-[#0A0A0F]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold mb-4">Everything You Need</h2>
            <p className="text-xl text-[#9CA3AF]">
              Powerful features to streamline your social media workflow
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div
                key={i}
                className="p-10 bg-[#1F2937] rounded-3xl border border-[#374151] hover:scale-105 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all duration-300 group"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                <p className="text-[#9CA3AF] leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold mb-4">Simple & Seamless</h2>
            <p className="text-xl text-[#9CA3AF]">Get started in minutes</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="relative">
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 mx-auto rounded-full border-4 border-[#3B82F6] bg-[#1F2937] flex items-center justify-center text-3xl font-bold text-[#3B82F6]">
                    {step.number}
                  </div>
                  <h3 className="text-2xl font-bold">{step.title}</h3>
                  <p className="text-[#9CA3AF]">{step.description}</p>
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-[#3B82F6] to-transparent">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#3B82F6] rounded-full" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-6 bg-gradient-to-b from-transparent via-[#1F2937]/20 to-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold mb-4">Choose Your Plan</h2>
            <p className="text-xl text-[#9CA3AF] mb-8">14-day free trial, no credit card required</p>

            <div className="inline-flex items-center gap-4 p-2 bg-[#1F2937] rounded-xl">
              <button
                onClick={() => setIsAnnual(false)}
                className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                  !isAnnual ? 'bg-[#3B82F6] text-white' : 'text-[#9CA3AF]'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setIsAnnual(true)}
                className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                  isAnnual ? 'bg-[#3B82F6] text-white' : 'text-[#9CA3AF]'
                }`}
              >
                Annually
                <span className="ml-2 text-xs text-[#3B82F6]">Save 20%</span>
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, i) => (
              <div
                key={i}
                className={`relative p-8 rounded-3xl border transition-all duration-300 ${
                  plan.popular
                    ? 'bg-[#1F2937] border-[#3B82F6] scale-105 shadow-[0_0_40px_rgba(59,130,246,0.3)]'
                    : 'bg-[#1F2937]/50 border-[#374151] hover:scale-105 hover:border-[#3B82F6]/50'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] rounded-full text-sm font-bold">
                    MOST POPULAR
                  </div>
                )}

                <div className="mb-8">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold">${plan.price}</span>
                    <span className="text-[#9CA3AF]">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-[#3B82F6] flex-shrink-0 mt-0.5" />
                      <span className="text-[#D1D5DB]">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  to="/login"
                  className={`block w-full py-3 rounded-xl font-semibold text-center transition-all ${
                    plan.popular
                      ? 'bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] hover:scale-105 shadow-[0_0_20px_rgba(59,130,246,0.3)]'
                      : plan.name === 'Enterprise'
                      ? 'border border-[#374151] hover:bg-[#1F2937]'
                      : 'border border-[#3B82F6] text-[#3B82F6] hover:bg-[#3B82F6] hover:text-white'
                  }`}
                >
                  {plan.name === 'Enterprise' ? 'Contact Sales' : 'Start 14-Day Free Trial'}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold mb-4">Loved by Thousands</h2>
            <p className="text-xl text-[#9CA3AF]">See what our customers have to say</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <div
                key={i}
                className="p-8 bg-[#1F2937] rounded-3xl border border-[#374151] hover:scale-105 transition-transform"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-5 h-5 fill-[#3B82F6] text-[#3B82F6]" />
                  ))}
                </div>
                <p className="text-lg mb-6 leading-relaxed">{testimonial.quote}</p>
                <div className="flex items-center gap-4">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.author}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold">{testimonial.author}</div>
                    <div className="text-sm text-[#9CA3AF]">
                      {testimonial.role} at {testimonial.company}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-[#9CA3AF]">Everything you need to know</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-[#1F2937] rounded-2xl border border-[#374151] overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-8 py-6 flex items-center justify-between text-left hover:bg-[#374151]/20 transition-colors"
                >
                  <span className="text-lg font-semibold pr-8">{faq.question}</span>
                  <ChevronDown
                    className={`w-6 h-6 text-[#3B82F6] flex-shrink-0 transition-transform ${
                      openFaq === i ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-8 pb-6">
                    <p className="text-[#D1D5DB] leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] p-16 text-center">
            <div className="relative z-10">
              <h2 className="text-5xl md:text-6xl font-bold mb-6">
                Ready to Transform Your Social Media?
              </h2>
              <p className="text-2xl mb-8 opacity-90">
                Join 1,000+ businesses posting smarter
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-3 px-8 py-4 bg-white text-[#3B82F6] rounded-xl font-bold text-lg hover:scale-105 transition-transform shadow-[0_0_40px_rgba(255,255,255,0.3)]"
              >
                Sign In Now
                <ArrowRight className="w-5 h-5" />
              </Link>
              <p className="mt-6 text-sm opacity-90">
                No credit card required • 14-day free trial
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#374151] py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-6 h-6 text-[#3B82F6]" />
                <span className="text-xl font-bold">FlowPost</span>
              </div>
              <p className="text-[#9CA3AF] mb-4">
                Multi-platform social media management made simple.
              </p>
              <div className="flex gap-4">
                <a href="#" className="text-[#9CA3AF] hover:text-[#3B82F6] transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="text-[#9CA3AF] hover:text-[#3B82F6] transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="text-[#9CA3AF] hover:text-[#3B82F6] transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="text-[#9CA3AF] hover:text-[#3B82F6] transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-[#9CA3AF]">
                <li>
                  <a href="#features" className="hover:text-white transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-white transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Integrations
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    API
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-[#9CA3AF]">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Case Studies
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Tutorials
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-[#9CA3AF]">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-[#374151] flex flex-col md:flex-row justify-between items-center gap-4 text-[#9CA3AF] text-sm">
            <p>&copy; 2025 FlowPost. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
