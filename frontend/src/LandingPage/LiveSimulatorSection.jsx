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
      icon: <IoRocketOutline className="text-2xl text-tech_orange" />,
      badge: 'Meta Official API',
      badgeClass: 'bg-tech_orange/20 text-tech_orange-700 border-tech_orange/40'
    },
    {
      title: 'Multi-Agent Team Inbox Studio',
      desc: 'Equip your sales reps, support team, and managers to reply from one shared WhatsApp number simultaneously with role-based access control.',
      icon: <IoPeopleOutline className="text-2xl text-amber-400" />,
      badge: 'Team Workspace',
      badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40'
    },
    {
      title: 'Daily Calling & Lead Conversion Tracker',
      desc: 'Log 1st, 2nd, and final calling notes per lead. Track employee daily performance and member joined rates with automatic deduplication.',
      icon: <IoStatsChartOutline className="text-2xl text-orange-400" />,
      badge: 'Employee Analytics',
      badgeClass: 'bg-orange-500/20 text-orange-300 border-orange-500/40'
    },
    {
      title: 'Automated Pay_SIP Installment Alerts',
      desc: 'Send automated monthly mutual fund installment alerts and 1-click WhatsApp payment reminders with dynamic customer folio numbers.',
      icon: <IoGitNetworkOutline className="text-2xl text-tech_orange-600" />,
      badge: 'SIP Automation',
      badgeClass: 'bg-tech_orange/20 text-tech_orange-600 border-tech_orange/40'
    }
  ];

  return (
    <section id="features-engine" className="py-24 relative overflow-hidden bg-slate_dark text-white border-t border-tech_orange/20">
      
      {/* Luminous Orange Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-tech_orange/15 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[450px] h-[450px] bg-amber-500/10 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-tech_orange/20 border border-tech_orange/40 text-xs font-mono font-extrabold text-tech_orange-700 tracking-wider uppercase shadow-md backdrop-blur-md">
            <IoSparkles className="text-sm text-tech_orange animate-spin" />
            <span>PRODUCTION CLOUD ENGINE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
            Built On <span className="bg-gradient-to-r from-tech_orange via-amber-400 to-orange-400 bg-clip-text text-transparent">Official Meta Cloud API</span> Architecture
          </h2>
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            Eliminate unofficial tools and spreadsheet trackers. Power your entire enterprise WhatsApp marketing, customer support, and sales pipeline on official Meta Cloud infrastructure.
          </p>
        </div>

        {/* 4 Feature Cards Grid with Bright Orange Aesthetics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {cloudFeatures.map((feat, idx) => (
            <div 
              key={idx}
              className="p-8 rounded-3xl bg-slate_dark-300/90 border border-tech_orange/30 hover:border-tech_orange shadow-2xl hover:shadow-[0_0_30px_rgba(255,98,0,0.25)] transition-all duration-300 group flex flex-col justify-between space-y-5"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3.5 rounded-2xl bg-slate_dark-400 border border-tech_orange/20 group-hover:border-tech_orange/60 group-hover:scale-105 transition-all shadow-md">
                    {feat.icon}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border shadow-xs ${feat.badgeClass}`}>
                    {feat.badge}
                  </span>
                </div>

                <h3 className="text-xl font-black text-white group-hover:text-tech_orange transition-colors">
                  {feat.title}
                </h3>

                <p className="text-sm text-slate-300 leading-relaxed">
                  {feat.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-slate_dark-500 flex items-center gap-2 text-xs font-mono text-tech_orange font-bold">
                <IoCheckmarkCircle className="text-base text-tech_orange" />
                <span>Verified Meta Production Feature</span>
              </div>
            </div>
          ))}
        </div>

        {/* Live Infrastructure Summary Banner */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-slate_dark-300 via-slate_dark-400 to-slate_dark-300 border border-tech_orange/40 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-tech_orange to-amber-500 text-white flex items-center justify-center text-2xl font-black shadow-lg shadow-tech_orange/30 shrink-0">
              <IoServerOutline />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-lg font-black text-white">Live Render Production Backend</h4>
                <span className="w-2.5 h-2.5 rounded-full bg-tech_orange animate-pulse" />
              </div>
              <p className="text-xs text-slate-300 font-mono mt-0.5">
                https://crm-1-62pl.onrender.com • MongoDB Atlas Connected • 99.99% Uptime SLA
              </p>
            </div>
          </div>

          <a
            href="/signup"
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-tech_orange to-tech_orange-600 hover:from-tech_orange-600 hover:to-tech_orange text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-tech_orange/30 border border-white/20 transition-all cursor-pointer shrink-0"
          >
            🚀 Launch Enterprise Instance
          </a>
        </div>

      </div>
    </section>
  );
}
