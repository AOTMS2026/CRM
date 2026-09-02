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
  Building2
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
    { id: 'ai-calling', label: 'AI Calling', icon: PhoneCall, badge: 'AI Live' },
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare, badge: '99+' },
    { id: 'todos', label: 'Todo List', icon: CheckSquare, badge: '5' },
    { id: 'instagram', label: 'Instagram', icon: Instagram, badge: null },
    { id: 'pay-sip', label: 'Pay_SIP', icon: CreditCard, badge: 'Pro' },
    { id: 'settings', label: 'Settings', icon: Settings, badge: null },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-slate_dark/95 backdrop-blur-xl border-b border-tech_blue/20 shadow-2xl">
      {/* Top Bar: Brand, Search, Quick Status, User Profile */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Left: Logo & Company Switcher */}
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2.5 group">
            <img 
              src="/logo.png" 
              alt="Academy of Tech Masters" 
              className="h-8 w-auto object-contain group-hover:scale-105 transition-transform"
            />
            <div className="hidden sm:block">
              <span className="text-xs font-black tracking-wider uppercase text-tech_orange">CRM Suite</span>
              <span className="text-[10px] text-slate-400 block -mt-1 font-mono">Enterprise v2.0</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate_dark-400/80 border border-tech_blue/30 text-xs text-slate-300">
            <Building2 className="w-3.5 h-3.5 text-tech_orange" />
            <span className="font-semibold text-white truncate max-w-[180px]">
              {currentUser?.company_name || 'Academy of Tech Masters'}
            </span>
          </div>
        </div>

        {/* Center: Quick Search Bar */}
        <div className="hidden lg:flex items-center flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Search leads, contacts, AI logs, chats..."
              className="w-full pl-10 pr-4 py-1.5 rounded-xl bg-slate_dark-400/70 border border-white/10 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-tech_orange focus:ring-1 focus:ring-tech_orange transition-all"
            />
          </div>
        </div>

        {/* Right: Notifications, Return to Website & User Profile */}
        <div className="flex items-center gap-3">
          
          <Link
            to="/"
            className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate_dark-400/60 hover:bg-slate_dark-400 border border-white/5 transition-colors"
          >
            <span>Landing Page</span>
            <ExternalLink className="w-3 h-3" />
          </Link>

          {/* Notification Bell */}
          <button 
            type="button"
            className="relative p-2 rounded-xl bg-slate_dark-400 hover:bg-slate_dark-300 text-slate-300 hover:text-white border border-white/10 transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-tech_orange animate-pulse" />
          </button>

          {/* User Profile Header Chip */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-white/10">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-tech_orange via-amber-500 to-tech_blue p-[2px] shadow-lg shadow-tech_orange/20">
              <div className="w-full h-full rounded-full bg-slate_dark flex items-center justify-center text-xs font-black text-white">
                {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'A'}
              </div>
            </div>
            <div className="hidden sm:block text-left leading-tight">
              <div className="text-xs font-bold text-white truncate max-w-[120px]">{currentUser?.name || 'Admin User'}</div>
              <div className="text-[10px] text-tech_orange font-medium">Enterprise Admin</div>
            </div>

            <button
              type="button"
              onClick={onLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

      {/* Another Navbar: Feature Navigation Bar (Requested by User) */}
      <div className="bg-slate_dark-400/95 border-t border-white/5 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1.5 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-tech_orange to-tech_orange-600 text-white shadow-md shadow-tech_orange/25 border border-tech_orange-400/40'
                    : 'text-slate-300 hover:text-white hover:bg-slate_dark-300/80 border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
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
