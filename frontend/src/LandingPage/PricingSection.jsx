import React, { useState } from 'react';
import { 
  IoCheckmarkCircle, 
  IoFlash, 
  IoSparkles,
  IoArrowForward
} from 'react-icons/io5';

export default function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(true);

  const plans = [
    {
      name: 'Starter CRM',
      description: 'Ideal for small businesses and teams getting started with WhatsApp automation.',
      priceMonthly: 29,
      priceAnnual: 24,
      popular: false,
      badge: 'Starter',
      features: [
        '1 Active WhatsApp Phone ID',
        '15,000 Automated Messages / mo',
        'Meta Cloud API Template Blast',
        'Shared Team Inbox (2 Seats)',
        'Contacts & Identity Segmenting',
        'Standard Email & Chat Support',
      ],
      buttonText: 'Start Free Trial',
      buttonStyle: 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700',
    },
    {
      name: 'Growth Enterprise',
      description: 'The ultimate engine for growing brands, agencies, and high-volume sales teams.',
      priceMonthly: 79,
      priceAnnual: 64,
      popular: true,
      badge: 'MOST POPULAR',
      features: [
        '3 Active WhatsApp Phone IDs',
        '100,000 Automated Messages / mo',
        'Meta WhatsApp Blast Campaign Studio',
        'Employee Daily Calling Tracker & Notes',
        'Pay_SIP Monthly Payment Alerts',
        'Shared Team Inbox (10 Seats)',
        'Bulk Excel Import with Template Download',
        'Priority 24/7 WhatsApp & Phone Support',
      ],
      buttonText: 'Claim 14-Day Free Trial',
      buttonStyle: 'bg-gradient-to-r from-amber-500 via-emerald-500 to-teal-500 hover:from-amber-600 hover:to-teal-600 text-slate-950 font-black shadow-lg shadow-emerald-500/20 border border-white/20',
    },
    {
      name: 'Custom Scale',
      description: 'High-volume enterprises requiring custom SLA, dedicated proxies, and direct DB webhooks.',
      priceMonthly: 199,
      priceAnnual: 159,
      popular: false,
      badge: 'Enterprise SLA',
      features: [
        'Unlimited WhatsApp Phone IDs',
        'Unlimited Messages & Broadcasts',
        'Dedicated Proxy Pools & Custom Rate Limiting',
        'Custom Webhooks & REST API Integrations',
        'Unlimited Team Seats & Role Permissions',
        'Dedicated Solutions Architect Support',
      ],
      buttonText: 'Contact Enterprise Sales',
      buttonStyle: 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700',
    },
  ];

  return (
    <section id="pricing" className="py-24 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white relative overflow-hidden border-t border-emerald-500/20">
      
      {/* Background Accent Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-xs font-mono font-extrabold text-emerald-300 uppercase tracking-wider shadow-md">
            <IoSparkles className="text-amber-400 text-sm" />
            <span>TRANSPARENT PRICING</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
            Simple Plans Built For <span className="bg-gradient-to-r from-amber-400 via-emerald-400 to-teal-300 bg-clip-text text-transparent">Every Stage Of Growth</span>
          </h2>
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            No hidden setup fees. Scale your enterprise WhatsApp marketing with 100% Meta API compliance.
          </p>

          {/* Monthly / Annual Toggle Switch */}
          <div className="pt-4 flex items-center justify-center gap-3">
            <span className={`text-xs font-mono font-bold ${!isAnnual ? 'text-white' : 'text-slate-400'}`}>Monthly</span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className="w-14 h-8 rounded-full bg-slate-800 border border-emerald-500/40 p-1 flex items-center transition-colors cursor-pointer"
            >
              <div className={`w-6 h-6 rounded-full bg-gradient-to-r from-amber-500 to-emerald-500 shadow-md transition-transform ${isAnnual ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
            <span className={`text-xs font-mono font-bold flex items-center gap-1.5 ${isAnnual ? 'text-emerald-400' : 'text-slate-400'}`}>
              <span>Annual</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] border border-emerald-500/40 font-extrabold">Save 20%</span>
            </span>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan, idx) => {
            const price = isAnnual ? plan.priceAnnual : plan.priceMonthly;
            return (
              <div
                key={idx}
                className={`rounded-3xl p-8 transition-all duration-300 flex flex-col justify-between relative overflow-hidden ${
                  plan.popular
                    ? 'bg-slate-900 border-2 border-emerald-400 shadow-2xl shadow-emerald-500/25 scale-[1.03]'
                    : 'bg-slate-900/80 border border-slate-800 hover:border-slate-700 shadow-xl'
                }`}
              >
                {/* Popular Pill Badge */}
                {plan.popular && (
                  <div className="absolute top-0 right-0">
                    <span className="px-4 py-1.5 rounded-bl-2xl bg-gradient-to-r from-amber-500 to-emerald-500 text-slate-950 font-mono font-black text-[10px] uppercase tracking-wider shadow-md">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-black text-white">{plan.name}</h3>
                    <p className="text-xs text-slate-400 mt-1 min-h-[32px]">{plan.description}</p>
                  </div>

                  {/* Price Header */}
                  <div className="flex items-baseline gap-1 pt-2 border-t border-slate-800">
                    <span className="text-5xl font-black text-white font-mono">${price}</span>
                    <span className="text-xs text-slate-400 font-mono font-bold">/ month</span>
                  </div>

                  {/* Feature Checklist */}
                  <div className="space-y-3 pt-2">
                    <span className="text-xs font-mono font-extrabold uppercase text-slate-400">Included Features:</span>
                    <ul className="space-y-2.5">
                      {plan.features.map((feat, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                          <IoCheckmarkCircle className="text-emerald-400 text-base shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Action CTA Button */}
                <div className="pt-8">
                  <a
                    href="/signup"
                    className={`w-full py-3.5 px-4 rounded-2xl text-xs uppercase tracking-wider font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${plan.buttonStyle}`}
                  >
                    <span>{plan.buttonText}</span>
                    <IoArrowForward className="text-sm" />
                  </a>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
