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
  LayoutDashboard,
  LogOut,
  Bell,
  Search,
  ExternalLink,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  Building2,
  Leaf
} from 'lucide-react';
import { IoLogoInstagram as Instagram } from 'react-icons/io5';

export default function DashboardNavbar({ activeTab, setActiveTab, currentUser, onLogout }) {
  const navigate = useNavigate();

  // Navigation items requested by user
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, badge: null },
    { id: 'users', label: 'Users', icon: Users, badge: 'Active' },
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
    <header className="sticky top-0 z-40 w-full bg-[#071714]/95 backdrop-blur-2xl border-b border-emerald-500/20 shadow-2xl">
      {/* Top Bar: INCREASED SIZE (h-20) with Cool Nature Emerald Theme */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-5">
        
        {/* Left: Brand Logo & Organization Badge */}
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <img 
                src="/logo.png" 
                alt="Academy of Tech Masters" 
                className="h-10 w-auto object-contain group-hover:scale-105 transition-transform drop-shadow"
              />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping opacity-75" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black tracking-wider uppercase bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200 bg-clip-text text-transparent">
                  AOTMS CRM
                </span>
                <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 border border-emerald-500/30 text-[9px] font-mono text-emerald-300 font-bold">
                  v2.5
                </span>
              </div>
              <span className="text-[11px] text-emerald-100/60 block -mt-0.5 font-sans font-medium">Enterprise Automation Suite</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#0c2621] border border-emerald-500/25 text-xs text-emerald-100/90 shadow-sm">
            <Building2 className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-white truncate max-w-[200px]">
              {currentUser?.company_name || 'AOTMS'}
            </span>
          </div>
        </div>

        {/* Center: Search Bar with Cool Nature Glass Accent */}
        <div className="hidden lg:flex items-center flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400/70" />
            <input 
              type="text"
              placeholder="Search leads, WhatsApp contacts, voice logs... (Ctrl + K)"
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#0c2420]/80 border border-emerald-500/20 text-xs text-white placeholder-emerald-100/40 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all shadow-inner"
            />
          </div>
        </div>

        {/* Right: Return Link, Notifications & User Profile */}
        <div className="flex items-center gap-3.5">
          
          <Link
            to="/"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-emerald-200 hover:text-white bg-[#0e2c26]/70 hover:bg-[#123931] border border-emerald-500/20 transition-all shadow-sm"
          >
            <span>Landing Page</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          {/* Notification Bell */}
          <button 
            type="button"
            className="relative p-2.5 rounded-xl bg-[#0c2621] hover:bg-[#123931] text-emerald-200 hover:text-white border border-emerald-500/20 transition-all cursor-pointer shadow-sm"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </button>

          {/* User Profile Header Chip */}
          <div className="flex items-center gap-3 pl-2 border-l border-emerald-500/20">
            <div className="relative w-9 h-9 rounded-full p-[2px] bg-gradient-to-tr from-emerald-400 via-teal-400 to-cyan-400 shadow-md shadow-emerald-500/20">
              <div className="w-full h-full rounded-full bg-[#071714] flex items-center justify-center text-xs font-black text-emerald-200">
                {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#071714]" />
            </div>
            <div className="hidden sm:block text-left leading-tight">
              <div className="text-xs font-bold text-white truncate max-w-[130px]">{currentUser?.name || 'Administrator'}</div>
              <div className="text-[10px] text-emerald-400 font-semibold font-mono">Workspace Admin</div>
            </div>

            <button
              type="button"
              onClick={onLogout}
              className="p-2 rounded-xl text-emerald-200/60 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

      {/* Mini Navbar: INCREASED HEIGHT (py-3.5) with Cool Nature Emerald Theme */}
      <div className="bg-[#091e1a]/95 border-t border-emerald-500/15 overflow-x-auto scrollbar-none shadow-inner">
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
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30 border border-emerald-300/40 scale-102'
                    : 'text-emerald-100/70 hover:text-white hover:bg-[#0f322b] border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-emerald-400/80'}`} />
                <span className="tracking-wide">{item.label}</span>
                {item.badge && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                    isActive
                      ? 'bg-white/25 text-white'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
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
