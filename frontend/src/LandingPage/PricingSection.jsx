import React, { useState } from 'react';
import { 
  IoCheckmarkCircle, 
  IoFlash, 
  IoSparkles 
} from 'react-icons/io5';

export default function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(true);

  const plans = [
    {
      name: 'Starter',
      description: 'Ideal for small businesses and local stores kicking off WhatsApp automation.',
      priceMonthly: 29,
      priceAnnual: 24,
      popular: false,
      features: [
        '1 Active WhatsApp Number',
        '15,000 Automated AI Messages / mo',
        'Basic Anti-Ban Rate Limiter',
        'Tenglish & Multilingual Intent Support',
        'Shared Inbox (2 Team Seats)',
        'Standard Email Support',
      ],
      buttonText: 'Start 14-Day Free Trial',
      buttonStyle: 'bg-deep_space_blue hover:bg-deep_space_blue-600 text-tan-900 border border-deep_space_blue-400',
    },
    {
      name: 'Growth',
      description: 'The ultimate engine for growing D2C brands, lead-gen agencies, and SaaS products.',
      priceMonthly: 79,
      priceAnnual: 64,
      popular: true,
      features: [
        '3 Active WhatsApp Numbers',
        '100,000 Automated AI Messages / mo',
        'Advanced Redis Token-Bucket Anti-Ban',
        'Full Drip Sequences & Broadcast Engine',
        'Sub-20ms Meilisearch Full History',
        'Shared Inbox (10 Team Seats)',
        'GraphQL & REST Webhook Triggers',
        'Priority 24/7 Slack & WhatsApp Support',
      ],
      buttonText: 'Claim 14-Day Free Trial',
      buttonStyle: 'nova-btn-shimmer bg-gradient-to-r from-burnt_peach to-burnt_peach-400 hover:from-burnt_peach-400 hover:to-burnt_peach text-prussian_blue-100 shadow-xl shadow-burnt_peach/30 border-t border-white/30',
    },
    {
      name: 'Enterprise',
      description: 'High-volume enterprises and agencies requiring dedicated infrastructure and custom SLAs.',
      priceMonthly: 199,
      priceAnnual: 159,
      popular: false,
      features: [
        'Unlimited WhatsApp Numbers',
        'Unlimited Messages & Broadcasts',
        'Dedicated Proxy Pools & Custom Jitter',
        'Fine-Tuned Custom Knowledge Base LLM',
        'Unlimited Team Seats & Role Permissions',
        'Custom CRM & Database Integrations',
        'Dedicated Solutions Architect & SLA',
      ],
      buttonText: 'Contact Enterprise Sales',
      buttonStyle: 'bg-deep_space_blue hover:bg-deep_space_blue-600 text-tan-900 border border-muted_teal/30',
    },
  ];

  return (
    <section id="pricing" className="py-24 bg-prussian_blue-100 relative">
      
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 bg-burnt_peach/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full nova-pill text-xs font-bold text-burnt_peach tracking-wide uppercase">
            Simple Transparent Pricing
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-tan-900 tracking-tight">
            Fair Plans That <span className="gradient-text-peach">Scale With Your Revenue</span>
          </h2>
          <p className="text-base sm:text-lg text-tan-800 leading-relaxed font-normal">
            Every plan includes our core zero-ban guarantee, 14-day free trial, and no credit card required upfront.
          </p>

          {/* Nova Toggle */}
          <div className="pt-4 flex items-center justify-center gap-4">
            <span className={`text-xs font-mono font-bold uppercase ${!isAnnual ? 'text-tan-900' : 'text-tan-800'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className="w-14 h-7 rounded-full nova-pill p-1 flex items-center transition-colors relative"
              aria-label="Toggle Annual Billing"
            >
              <div 
                className={`w-5 h-5 rounded-full bg-burnt_peach shadow-md transform transition-transform duration-200 ${
                  isAnnual ? 'translate-x-7' : 'translate-x-0'
                }`}
              />
            </button>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-mono font-bold uppercase ${isAnnual ? 'text-tan-900' : 'text-tan-800'}`}>
                Yearly
              </span>
              <span className="px-2 py-0.5 rounded-full bg-muted_teal/20 border border-muted_teal/40 text-[10px] font-mono font-extrabold text-muted_teal">
                SAVE 20%
              </span>
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`rounded-3xl p-8 flex flex-col justify-between relative transition-all duration-300 ${
                plan.popular
                  ? 'nova-card border-2 border-burnt_peach shadow-2xl shadow-burnt_peach/25 scale-105 z-20'
                  : 'nova-card border border-muted_teal/20 hover:border-muted_teal/50'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-burnt_peach to-tan text-prussian_blue-100 font-mono font-black text-xs shadow-md tracking-wider uppercase flex items-center gap-1.5 border border-white/20">
                  <IoSparkles className="text-xs" /> MOST POPULAR
                </div>
              )}

              <div>
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-tan-900 mb-2">{plan.name}</h3>
                  <p className="text-xs text-tan-800 leading-relaxed font-normal min-h-[36px]">
                    {plan.description}
                  </p>
                </div>

                <div className="flex items-baseline gap-1 mb-8 pb-6 border-b border-muted_teal/20">
                  <span className="text-4xl sm:text-5xl font-black font-mono text-tan-900">
                    ${isAnnual ? plan.priceAnnual : plan.priceMonthly}
                  </span>
                  <span className="text-xs font-mono text-tan-800">/ month</span>
                </div>

                <ul className="space-y-3.5 text-xs sm:text-sm text-tan-800 mb-8">
                  {plan.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-3">
                      <IoCheckmarkCircle className="text-base text-muted_teal flex-shrink-0 mt-0.5" />
                      <span className="text-tan-900 font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <a
                href="#signup"
                className={`w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider text-center transition-all flex items-center justify-center gap-2 ${plan.buttonStyle}`}
              >
                <IoFlash className="text-base" />
                <span>{plan.buttonText}</span>
              </a>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center text-xs text-tan-800 max-w-xl mx-auto space-y-2 font-mono">
          <p>🔒 256-bit End-to-End SSL encryption • GDPR & Meta Policy Compliant</p>
          <p>Cancel anytime with 1-click inside your dashboard. No hidden setup fees.</p>
        </div>

      </div>
    </section>
  );
}
