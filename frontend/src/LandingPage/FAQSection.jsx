import React, { useState } from 'react';
import { IoChevronDownOutline, IoHelpCircleOutline, IoSparkles } from 'react-icons/io5';

export default function FAQSection() {
  const [openIdx, setOpenIdx] = useState(0);

  const faqs = [
    {
      q: 'Will my WhatsApp number get banned for sending bulk messages?',
      a: 'No! AutoMachine uses official Meta WhatsApp Cloud API templates with automated rate pacing. Unlike unofficial third-party senders that flood servers and get numbers blocked, our platform complies 100% with official Meta guidelines.'
    },
    {
      q: 'Does AOTMS CRM support multi-agent team inbox access?',
      a: 'Yes, natively! Multiple customer success agents and sales managers can log in simultaneously to reply, assign leads, log daily calling updates (1st, 2nd, final notes), and track member conversion rates.'
    },
    {
      q: 'Can I upload contacts and leads via Excel files?',
      a: 'Absolutely! Our leads workspace includes a 1-click "Template Download" button and an "Upload Excel" option. You can bulk import thousands of contacts with automated 10-digit Indian phone validation.'
    },
    {
      q: 'How does the Pay_SIP mutual fund payment reminder system work?',
      a: 'The Pay_SIP module tracks monthly mutual fund installment debit dates, folio numbers, and amounts. It generates automated 1-click WhatsApp payment reminders directly to your clients.'
    },
    {
      q: 'Do I need developer skills or coding knowledge to get started?',
      a: 'Not at all. You can manage leads, send broadcasts, and track employee performance visually through our dashboard. However, if you are a developer, we provide full REST API endpoints and webhooks.'
    },
    {
      q: 'How does the 14-day free trial work?',
      a: 'You get full access to all Growth plan features for 14 days without entering any credit card information. Choose a plan at the end of the trial with zero commitment.'
    }
  ];

  return (
    <section id="faq" className="py-24 bg-slate_dark text-white relative border-t border-tech_orange/20">
      
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-10 w-96 h-96 bg-tech_orange/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-tech_orange/20 border border-tech_orange/40 text-xs font-mono font-extrabold text-tech_orange-700 uppercase tracking-wider shadow-md">
            <IoHelpCircleOutline className="text-tech_orange text-base" /> 
            <span>GOT QUESTIONS?</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
            Frequently Asked <span className="bg-gradient-to-r from-tech_orange via-amber-400 to-orange-400 bg-clip-text text-transparent">Questions</span>
          </h2>
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            Everything you need to know about Meta Cloud API compliance, bulk imports, and employee tracking.
          </p>
        </div>

        {/* Accordion with Orange Accent Cards */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen 
                    ? 'bg-slate_dark-300 border-tech_orange/60 shadow-xl shadow-tech_orange/10' 
                    : 'bg-slate_dark-300/60 border-slate_dark-500 hover:border-slate_dark-400'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="font-bold text-base sm:text-lg text-white">
                    {faq.q}
                  </span>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 ${
                    isOpen ? 'bg-tech_orange text-white rotate-180 font-black' : 'bg-slate_dark-400 text-slate-400'
                  }`}>
                    <IoChevronDownOutline className="text-base" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 pt-1 text-sm text-slate-300 leading-relaxed border-t border-slate_dark-500 animate-in fade-in duration-150">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
