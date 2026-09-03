import React from 'react';
import { 
  IoMegaphoneOutline, 
  IoGitNetworkOutline, 
  IoPeopleOutline, 
  IoSearchOutline, 
  IoCloudUploadOutline, 
  IoCodeSlashOutline,
  IoCheckmarkCircle,
  IoSparkles
} from 'react-icons/io5';

export default function FeaturesSection() {
  const features = [
    {
      icon: <IoMegaphoneOutline className="text-2xl text-amber-400" />,
      title: 'WhatsApp Blast & Anti-Ban Rate Limiter',
      description: 'Send thousands of broadcast announcements, festival offers, and newsletters with zero ban risk using Meta Cloud API template pacing.',
      badge: 'High Conversion',
      borderGlow: 'hover:border-amber-400/80 hover:shadow-amber-500/20'
    },
    {
      icon: <IoGitNetworkOutline className="text-2xl text-emerald-400" />,
      title: 'Automated Drip Sequences & Follow-Ups',
      description: 'Nurture cold leads automatically. Trigger custom multi-day message sequences when a lead fills a form or leaves an abandoned cart.',
      badge: 'Automated',
      borderGlow: 'hover:border-emerald-400/80 hover:shadow-emerald-500/20'
    },
    {
      icon: <IoPeopleOutline className="text-2xl text-sky-400" />,
      title: 'Multi-Agent Shared Team Inbox',
      description: 'Allow multiple sales reps and support agents to reply from the same WhatsApp number simultaneously with RBAC role permissions.',
      badge: 'Team Inbox',
      borderGlow: 'hover:border-sky-400/80 hover:shadow-sky-500/20'
    },
    {
      icon: <IoSearchOutline className="text-2xl text-teal-400" />,
      title: 'Sub-Second MongoDB & Contact Search',
      description: 'Instant search across thousands of customer contacts, identity tags (SAP FICO, VIP, Client), employee names, and mobile numbers.',
      badge: 'Fast Query',
      borderGlow: 'hover:border-teal-400/80 hover:shadow-teal-500/20'
    },
    {
      icon: <IoCloudUploadOutline className="text-2xl text-purple-400" />,
      title: 'Bulk Excel & CSV Leads Import',
      description: 'Import thousands of leads from Excel sheets with automatic 10-digit Indian phone validation and sample template download.',
      badge: 'Excel Import',
      borderGlow: 'hover:border-purple-400/80 hover:shadow-purple-500/20'
    },
    {
      icon: <IoCodeSlashOutline className="text-2xl text-rose-400" />,
      title: 'REST API & Webhook Automations',
      description: 'Seamlessly connect AOTMS CRM with your website or database. Auto-trigger WhatsApp alerts on lead creation or payment status update.',
      badge: 'REST API',
      borderGlow: 'hover:border-rose-400/80 hover:shadow-rose-500/20'
    }
  ];

  return (
    <section id="features" className="py-24 relative overflow-hidden bg-slate-950 text-white border-t border-emerald-500/20">
      
      {/* Background Glows */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-xs font-mono font-extrabold text-emerald-300 uppercase tracking-wider shadow-md">
            <IoSparkles className="text-amber-400 text-sm" />
            <span>PLATFORM CAPABILITIES</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
            Everything You Need To Scale An <span className="bg-gradient-to-r from-amber-400 via-emerald-400 to-teal-300 bg-clip-text text-transparent">Enterprise WhatsApp CRM</span>
          </h2>
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            Eliminate unofficial tools and risky senders. Power high-speed marketing, team customer support, and employee calling pipelines with zero ban risk.
          </p>
        </div>

        {/* Feature Grid with Glowing Bright Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feat, idx) => (
            <div 
              key={idx}
              className={`p-7 rounded-3xl bg-slate-900/90 border border-slate-800 transition-all duration-300 shadow-xl flex flex-col justify-between space-y-5 group ${feat.borderGlow}`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-2xl bg-slate-800 border border-slate-700 group-hover:scale-105 transition-transform shadow-md">
                    {feat.icon}
                  </div>
                  <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                    {feat.badge}
                  </span>
                </div>

                <h3 className="text-lg font-black text-white group-hover:text-amber-400 transition-colors">
                  {feat.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {feat.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center gap-1.5 text-xs font-mono text-emerald-400 font-bold">
                <IoCheckmarkCircle className="text-base" />
                <span>Production Ready</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
