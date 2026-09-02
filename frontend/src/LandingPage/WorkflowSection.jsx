import React from 'react';
import { 
  IoQrCodeOutline, 
  IoColorWandOutline, 
  IoRocketOutline,
  IoArrowForwardOutline 
} from 'react-icons/io5';

export default function WorkflowSection() {
  const steps = [
    {
      number: '01',
      icon: <IoQrCodeOutline className="text-3xl text-burnt_peach" />,
      title: 'Connect WhatsApp in 30s',
      description: 'Scan our dynamic QR code or paste your WhatsApp Cloud API token. Your multi-device session initializes immediately with persistent session recovery.',
      badge: 'Zero Setup Hassle',
      color: 'border-burnt_peach/35 group-hover:border-burnt_peach'
    },
    {
      number: '02',
      icon: <IoColorWandOutline className="text-3xl text-tan" />,
      title: 'Configure AI Rules & Prompts',
      description: 'Define automated workflows, train your custom knowledge base, and set intelligent trigger keywords in English, Tenglish, or colloquial regional text.',
      badge: 'No-Code & Developer Friendly',
      color: 'border-tan/35 group-hover:border-tan'
    },
    {
      number: '03',
      icon: <IoRocketOutline className="text-3xl text-muted_teal" />,
      title: 'Autopilot Drip & Instant Sales',
      description: 'Sit back as AutoMachine answers customer queries 24/7, schedules personalized drip sequences, recovers abandoned carts, and passes hot leads to your CRM.',
      badge: 'Automate & Scale',
      color: 'border-muted_teal/35 group-hover:border-muted_teal'
    }
  ];

  return (
    <section id="workflow" className="py-24 bg-prussian_blue-200/40 relative border-t border-deep_space_blue/50">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full nova-pill text-xs font-bold text-tan tracking-wide uppercase">
            Simple 3-Step Setup
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-tan-900 tracking-tight">
            How AutoMachine Works In <span className="gradient-text-peach">3 Minutes</span>
          </h2>
          <p className="text-base sm:text-lg text-tan-800 leading-relaxed font-normal">
            No complex infrastructure, no messy configuration files. Start automating your customer conversations in three effortless steps.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          
          {/* Connector laser beam */}
          <div className="hidden md:block absolute top-1/2 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-burnt_peach via-tan to-muted_teal -translate-y-12 opacity-40 -z-0" />

          {steps.map((step, idx) => (
            <div
              key={idx}
              className={`rounded-3xl nova-card p-8 border ${step.color} relative z-10 nova-card-hover group flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between mb-8">
                  <span className="text-4xl font-black font-mono text-deep_space_blue group-hover:text-tan-900 transition-colors duration-300">
                    {step.number}
                  </span>
                  <div className="w-14 h-14 rounded-2xl bg-deep_space_blue/80 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 border border-white/10">
                    {step.icon}
                  </div>
                </div>

                <span className="text-[10px] font-mono font-bold tracking-wider px-2.5 py-1 rounded-full nova-pill text-tan-800 mb-4 inline-block">
                  {step.badge}
                </span>

                <h3 className="text-xl font-bold text-tan-900 mb-3 group-hover:text-tan transition-colors">
                  {step.title}
                </h3>

                <p className="text-sm text-tan-800 leading-relaxed font-normal">
                  {step.description}
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-muted_teal/20 flex items-center justify-between text-xs font-mono font-bold text-tan-900 group-hover:text-burnt_peach transition-colors">
                <span>Learn step details</span>
                <IoArrowForwardOutline className="text-sm group-hover:translate-x-1.5 transition-transform" />
              </div>
            </div>
          ))}

        </div>

      </div>
    </section>
  );
}
