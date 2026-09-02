import React from 'react';
import { 
  IoShieldCheckmarkOutline, 
  IoSpeedometerOutline, 
  IoLanguageOutline, 
  IoLayersOutline,
  IoCheckmarkCircle,
  IoSparkles
} from 'react-icons/io5';

export default function AboutSection() {
  const pillars = [
    {
      icon: <IoShieldCheckmarkOutline className="text-2xl text-burnt_peach" />,
      title: 'Smart Anti-Ban Architecture',
      description: 'WhatsApp strictly monitors message frequency. Our Redis-backed Leaky Bucket algorithm dynamically injects human-like typing delays (3-7s jitter) and warm-up schedules to ensure 100% account safety.',
      badge: 'Account Protection',
      borderColor: 'border-burnt_peach/35',
    },
    {
      icon: <IoSpeedometerOutline className="text-2xl text-muted_teal" />,
      title: 'Sub-20ms Search & High Concurrency',
      description: 'Built on FastAPI ASGI, async SQLAlchemy 2.0, and Meilisearch. Instant typo-tolerant search across millions of customer conversations, invoices, and campaign tags with lightning responsiveness.',
      badge: 'FastAPI + Meilisearch',
      borderColor: 'border-muted_teal/35',
    },
    {
      icon: <IoLanguageOutline className="text-2xl text-tan" />,
      title: 'Natural Multilingual & Tenglish NLP',
      description: 'Customers rarely type pure English. AutoMachine natively interprets colloquial conversations, Romanized regional languages (like Tenglish - "Price entha bro?"), slang, and voice notes with high intent accuracy.',
      badge: 'Next-Gen NLP',
      borderColor: 'border-tan/35',
    },
    {
      icon: <IoLayersOutline className="text-2xl text-tan-800" />,
      title: 'Multi-Device & Unified Team Inbox',
      description: 'Connect multiple WhatsApp numbers, assign incoming leads to team members, set automated office hours, and trigger custom webhooks to your CRM, Shopify, or PostgreSQL databases seamlessly.',
      badge: 'Enterprise Scaling',
      borderColor: 'border-tan-800/35',
    },
  ];

  return (
    <section id="about" className="py-24 bg-prussian_blue-200/40 relative border-t border-b border-deep_space_blue/50">
      
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-deep_space_blue/20 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full nova-pill text-xs font-bold text-burnt_peach tracking-wider uppercase">
            <IoSparkles className="text-xs" /> Nova Core Architecture
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-tan-900 tracking-tight">
            Engineered To Solve The <span className="gradient-text-peach">Biggest Frustrations</span> In WhatsApp Automation.
          </h2>
          <p className="text-base sm:text-lg text-tan-800 leading-relaxed font-normal">
            WhatsApp has a 98% open rate, yet 85% of businesses get banned or drop customer leads due to slow, unorganized replies. AutoMachine was created from the ground up to bring enterprise stability and intelligent conversational AI to your customer communication.
          </p>
        </div>

        {/* 4 Pillars Grid with Nova illuminated cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {pillars.map((pillar, idx) => (
            <div 
              key={idx}
              className={`rounded-2xl nova-card p-8 border ${pillar.borderColor} nova-card-hover relative group flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-xl bg-deep_space_blue/80 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-300 border border-white/10">
                    {pillar.icon}
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full nova-pill text-tan-800">
                    {pillar.badge}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-tan-900 mb-3 group-hover:text-burnt_peach transition-colors">
                  {pillar.title}
                </h3>
                <p className="text-sm text-tan-800 leading-relaxed font-normal">
                  {pillar.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-muted_teal/20 flex items-center gap-2 text-xs font-semibold text-muted_teal font-mono">
                <IoCheckmarkCircle className="text-sm" /> Production-ready & battle-tested
              </div>
            </div>
          ))}
        </div>

        {/* Architecture Highlight Banner with Nova styling */}
        <div className="rounded-3xl nova-card border border-muted_teal/40 p-8 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-3 text-center lg:text-left max-w-2xl">
              <span className="text-xs font-mono font-bold text-tan uppercase tracking-widest flex items-center justify-center lg:justify-start gap-2">
                <span className="w-2 h-2 rounded-full bg-tan nova-led" />
                SYSTEM SPECIFICATIONS
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-tan-900">
                Powered by Python FastAPI, Async SQLAlchemy, Redis & React 19
              </h3>
              <p className="text-sm text-tan-800 leading-relaxed">
                Zero bottlenecks. AutoMachine handles concurrent WebSocket streaming, dynamic Strawberry GraphQL data queries, and AWS S3 media pipelines with enterprise SLA.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 font-mono text-xs font-bold">
              <div className="px-4 py-2 rounded-xl nova-pill border-burnt_peach/40 text-burnt_peach shadow-sm">
                FastAPI 0.115+
              </div>
              <div className="px-4 py-2 rounded-xl nova-pill border-tan/40 text-tan shadow-sm">
                Redis Caching & Queue
              </div>
              <div className="px-4 py-2 rounded-xl nova-pill border-muted_teal/40 text-muted_teal shadow-sm">
                Meilisearch Indexing
              </div>
              <div className="px-4 py-2 rounded-xl nova-pill border-tan-800/40 text-tan-900 shadow-sm">
                React 19 & GSAP
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
