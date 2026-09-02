import React, { useState } from 'react';
import { IoChevronDownOutline, IoHelpCircleOutline } from 'react-icons/io5';

export default function FAQSection() {
  const [openIdx, setOpenIdx] = useState(0);

  const faqs = [
    {
      q: 'Will my WhatsApp number get banned for sending bulk messages?',
      a: 'No! Unlike amateur bulk senders that flood WhatsApp servers and trigger instant bans, AutoMachine uses an enterprise-grade Redis Leaky Bucket rate limiter with human typing simulations (random 3-7s jitter delays) and daily warm-up schedules. We have maintained a 0.00% ban rate across millions of messages.'
    },
    {
      q: 'Does AutoMachine understand Tenglish and Indian regional dialects?',
      a: 'Yes, natively! Our conversational AI engine is trained on Romanized regional languages (like Tenglish - "Price entha bro?", "Details pampandi"), colloquial Hindi, and casual English. It accurately recognizes intent without forcing customers to speak strict formal English.'
    },
    {
      q: 'Can multiple agents and employees reply from the same WhatsApp number?',
      a: 'Absolutely. Our Shared Team Inbox lets your entire customer success and sales team log into one unified dashboard. You can assign conversations, leave internal private notes, and view real-time delivery status without handing out your physical phone.'
    },
    {
      q: 'Do I need developer skills or coding knowledge to get started?',
      a: 'Not at all. You can configure complete chatbots, broadcast campaigns, and automated auto-replies using our visual dashboard. However, if you are a developer, we provide full FastAPI REST endpoints, Strawberry GraphQL schemas, and Webhook triggers.'
    },
    {
      q: 'Can I connect AutoMachine to my Shopify, WooCommerce, or CRM database?',
      a: 'Yes! We provide ready-to-use webhooks. Whenever a customer places an order, abandons a checkout cart, or requests an invoice, your backend or eCommerce store triggers an automated WhatsApp message with zero delay.'
    },
    {
      q: 'How does the 14-day free trial work?',
      a: 'You get full access to all Growth plan features for 14 days without entering any credit card information. If you love it, choose a plan at the end of the trial; if not, your account simply downgrades with zero commitment.'
    }
  ];

  return (
    <section id="faq" className="py-24 bg-prussian_blue-200/30 relative border-t border-deep_space_blue/50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full nova-pill text-xs font-bold text-muted_teal tracking-wide uppercase">
            <IoHelpCircleOutline className="text-sm" /> Got Questions?
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-tan-900 tracking-tight">
            Frequently Asked <span className="gradient-text-peach">Questions</span>
          </h2>
          <p className="text-base sm:text-lg text-tan-800 leading-relaxed font-normal">
            Everything you need to know about the product, anti-ban guarantees, and getting started.
          </p>
        </div>

        {/* Accordion with Nova Cards */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl nova-card border border-muted_teal/20 overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 text-tan-900 hover:text-tan transition-colors"
                >
                  <span className="font-bold text-base sm:text-lg">{faq.q}</span>
                  <IoChevronDownOutline
                    className={`text-xl flex-shrink-0 transition-transform duration-300 text-muted_teal ${
                      isOpen ? 'rotate-180 text-burnt_peach' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 text-sm text-tan-800 leading-relaxed font-normal border-t border-muted_teal/15 pt-4 animate-in fade-in duration-200">
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
