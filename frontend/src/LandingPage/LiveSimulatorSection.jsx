import React from 'react';
import { 
  IoLogoWhatsapp, 
  IoShieldCheckmarkOutline, 
  IoGitNetworkOutline, 
  IoStatsChartOutline,
  IoRocketOutline,
  IoCheckmarkCircle,
  IoFlashOutline,
  IoServerOutline,
  IoPeopleOutline,
  IoSparkles
} from 'react-icons/io5';

export default function LiveSimulatorSection() {
  const cloudFeatures = [
    {
      title: 'Meta WhatsApp Cloud API Broadcasts',
      desc: 'High-speed template messaging powered directly by Meta Cloud API. Zero ban risk with automated rate pacing and sample variable replacement.',
      icon: <IoRocketOutline className="text-2xl text-amber-400" />,
      badge: 'Meta Official API',
      badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40'
    },
    {
      title: 'Multi-Agent Team Inbox Studio',
      desc: 'Equip your sales reps, support team, and managers to reply from one shared WhatsApp number simultaneously with role-based access control.',
      icon: <IoPeopleOutline className="text-2xl text-emerald-400" />,
      badge: 'Team Workspace',
      badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
    },
    {
      title: 'Daily Calling & Lead Conversion Tracker',
      desc: 'Log 1st, 2nd, and final calling notes per lead. Track employee daily performance and member joined rates with automatic deduplication.',
      icon: <IoStatsChartOutline className="text-2xl text-sky-400" />,
      badge: 'Employee Analytics',
      badgeClass: 'bg-sky-500/20 text-sky-300 border-sky-500/40'
    },
    {
      title: 'Automated Pay_SIP Installment Alerts',
      desc: 'Send automated monthly mutual fund installment alerts and 1-click WhatsApp payment reminders with dynamic customer folio numbers.',
      icon: <IoGitNetworkOutline className="text-2xl text-teal-400" />,
      badge: 'SIP Automation',
      badgeClass: 'bg-teal-500/20 text-teal-300 border-teal-500/40'
    }
  ];

  return (
    <section id="features-engine" className="py-24 relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      
      {/* Luminous Background Accent Light Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[450px] h-[450px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-xs font-mono font-extrabold text-emerald-300 tracking-wider uppercase shadow-md backdrop-blur-md">
            <IoSparkles className="text-sm text-amber-400 animate-spin" />
            <span>PRODUCTION CLOUD ENGINE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
            Built On <span className="bg-gradient-to-r from-amber-400 via-emerald-400 to-teal-300 bg-clip-text text-transparent">Official Meta Cloud API</span> Architecture
          </h2>
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            Eliminate unofficial tools and spreadsheet trackers. Power your entire enterprise WhatsApp marketing, customer support, and sales pipeline on official Meta Cloud infrastructure.
          </p>
        </div>

        {/* 4 Feature Cards Grid with Bright Neon Aesthetics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {cloudFeatures.map((feat, idx) => (
            <div 
              key={idx}
              className="p-8 rounded-3xl bg-slate-900/90 border border-emerald-500/30 hover:border-emerald-400 shadow-2xl hover:shadow-[0_0_30px_rgba(16,185,129,0.25)] transition-all duration-300 group flex flex-col justify-between space-y-5"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3.5 rounded-2xl bg-slate-800 border border-emerald-500/20 group-hover:border-emerald-400/60 group-hover:scale-105 transition-all shadow-md">
                    {feat.icon}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border shadow-xs ${feat.badgeClass}`}>
                    {feat.badge}
                  </span>
                </div>

                <h3 className="text-xl font-black text-white group-hover:text-emerald-400 transition-colors">
                  {feat.title}
                </h3>

                <p className="text-sm text-slate-300 leading-relaxed">
                  {feat.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold">
                <IoCheckmarkCircle className="text-base" />
                <span>Verified Meta Production Feature</span>
              </div>
            </div>
          ))}
        </div>

        {/* Live Infrastructure Summary Banner */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-850 to-amber-950/80 border border-amber-500/30 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-emerald-500 text-slate-950 flex items-center justify-center text-2xl font-black shadow-lg shrink-0">
              <IoServerOutline />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-lg font-black text-white">Live Render Production Backend</h4>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <p className="text-xs text-slate-300 font-mono mt-0.5">
                https://crm-1-62pl.onrender.com • MongoDB Atlas Connected • 99.99% Uptime SLA
              </p>
            </div>
          </div>

          <a
            href="/signup"
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-emerald-500 to-teal-500 hover:from-amber-600 hover:to-teal-600 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 border border-white/20 transition-all cursor-pointer shrink-0"
          >
            🚀 Launch Enterprise Instance
          </a>
        </div>

      </div>
    </section>
  );
}
