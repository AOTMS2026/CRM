import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Users, 
  Target, 
  Briefcase, 
  PhoneCall, 
  MessageSquare, 
  CheckSquare, 
  CreditCard, 
  Settings, 
  LogOut, 
  Bell, 
  Search, 
  ExternalLink, 
  Building2, 
  Sparkles 
} from 'lucide-react';
import { IoLogoInstagram as Instagram } from 'react-icons/io5';

export default function DashboardNavbar({ activeTab, setActiveTab, currentUser, onLogout }) {
  const navigate = useNavigate();

  // Navigation items (Overview permanently removed as requested; Users is first)
  const navItems = [
    { id: 'users', label: 'Users', icon: Users, badge: 'Team' },
    { id: 'leads', label: 'Leads', icon: Target, badge: '12 New' },
    { id: 'employees', label: 'Employees', icon: Briefcase, badge: null },
    { id: 'ai-calling', label: 'AI Calling', icon: PhoneCall, badge: 'Live AI' },
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare, badge: '99+' },
    { id: 'todos', label: 'Todo List', icon: CheckSquare, badge: '5' },
    { id: 'instagram', label: 'Instagram', icon: Instagram, badge: null },
    { id: 'pay-sip', label: 'Pay_SIP', icon: CreditCard, badge: 'Pro' },
    { id: 'settings', label: 'Settings', icon: Settings, badge: null },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-slate_dark/95 backdrop-blur-2xl border-b border-tech_blue/20 shadow-2xl">
      {/* Top Bar (Height: h-20) with HeroSection Landing Page Color Theme */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-5">
        
        {/* Left: Brand Logo & Organization Badge */}
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-3 group">
            <img 
              src="/logo.png" 
              alt="Academy of Tech Masters" 
              className="h-10 w-auto object-contain group-hover:scale-105 transition-transform drop-shadow"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black tracking-wider uppercase text-white">
                  AOTMS <span className="text-tech_orange">CRM</span>
                </span>
                <span className="px-1.5 py-0.2 rounded bg-tech_orange/20 border border-tech_orange/40 text-[9px] font-mono text-tech_orange font-bold">
                  Enterprise
                </span>
              </div>
              <span className="text-[11px] text-slate-400 block -mt-0.5 font-sans font-medium">WhatsApp Automation Suite</span>
            </div>
          </Link>

          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate_dark-400/90 border border-white/10 text-xs text-slate-300">
            <Building2 className="w-3.5 h-3.5 text-tech_orange" />
            <span className="font-bold text-white truncate max-w-[180px]">
              {currentUser?.company_name || 'AOTMS'}
            </span>
          </div>
        </div>

        {/* Center: Prominent "Welcome {User Name}" Greeting requested by user */}
        <div className="flex items-center justify-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-2xl bg-gradient-to-r from-slate_dark-300 via-slate_dark-400 to-slate_dark-300 border border-tech_orange/30 shadow-lg shadow-tech_orange/10 backdrop-blur-xl">
            <Sparkles className="w-4 h-4 text-tech_orange animate-pulse" />
            <span className="text-xs sm:text-sm font-medium text-slate-300">
              Welcome, <span className="font-extrabold text-white tracking-wide">{currentUser?.name || 'Administrator'}</span>
            </span>
          </div>
        </div>

        {/* Right: Quick Search, Notifications & Profile Avatar */}
        <div className="flex items-center gap-3.5">
          
          <Link
            to="/"
            className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate_dark-400/80 hover:bg-slate_dark-300 border border-white/10 transition-all shadow-sm"
          >
            <span>Landing Page</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          {/* Notification Bell */}
          <button 
            type="button"
            className="relative p-2.5 rounded-xl bg-slate_dark-400 hover:bg-slate_dark-300 text-slate-300 hover:text-white border border-white/10 transition-all cursor-pointer shadow-sm"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-tech_orange animate-pulse" />
          </button>

          {/* User Profile Avatar with Tech Orange Ring */}
          <div className="flex items-center gap-3 pl-2 border-l border-white/10">
            <div className="relative w-9 h-9 rounded-full p-[2px] bg-gradient-to-tr from-tech_orange via-amber-400 to-tech_blue shadow-md shadow-tech_orange/20">
              <div className="w-full h-full rounded-full bg-slate_dark flex items-center justify-center text-xs font-black text-white">
                {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate_dark" />
            </div>

            <button
              type="button"
              onClick={onLogout}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

      {/* Mini Navbar (Height: py-3.5) with HeroSection Theme */}
      <div className="bg-slate_dark-400/95 border-t border-white/5 overflow-x-auto scrollbar-none shadow-inner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 py-3.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-tech_orange to-tech_orange-600 text-white shadow-lg shadow-tech_orange/25 border border-tech_orange-400/40 scale-102'
                    : 'text-slate-300 hover:text-white hover:bg-slate_dark-300/90 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="tracking-wide">{item.label}</span>
                {item.badge && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-tech_blue/20 text-tech_blue-700 border border-tech_blue/30'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
