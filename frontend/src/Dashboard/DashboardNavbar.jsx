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
  Building2 
} from 'lucide-react';
import { IoLogoInstagram as Instagram } from 'react-icons/io5';

export default function DashboardNavbar({ activeTab, setActiveTab, currentUser, onLogout }) {
  const navigate = useNavigate();

  // Navigation items (Overview permanently removed; Users is primary)
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
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-xl border-b border-[#dee2e6] shadow-sm">
      {/* Top Bar: INCREASED HEIGHT (h-24) with Clean White / Platinum Executive Palette */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-24 flex items-center justify-between gap-6">
        
        {/* Left: Clean Brand Logo Only (Removed messy subtitle text as requested) */}
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-3.5 group">
            <img 
              src="/logo.png" 
              alt="AOTMS" 
              className="h-11 w-auto object-contain group-hover:scale-105 transition-transform"
            />
            <div className="hidden sm:block">
              <span className="text-base font-black tracking-tight text-[#212529]">
                AOTMS <span className="text-tech_orange">CRM</span>
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#f8f9fa] border border-[#e9ecef] text-xs text-[#495057]">
            <Building2 className="w-3.5 h-3.5 text-tech_orange" />
            <span className="font-bold text-[#212529] truncate max-w-[190px]">
              {currentUser?.company_name || 'AOTMS'}
            </span>
          </div>
        </div>

        {/* Center: Search Bar with Clean White Palette (Removed Welcome text as requested) */}
        <div className="hidden lg:flex items-center flex-1 max-w-lg mx-6">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6c757d]" />
            <input 
              type="text"
              placeholder="Search users, leads, WhatsApp contacts... (Ctrl + K)"
              className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-[#f8f9fa] border border-[#ced4da] text-xs text-[#212529] placeholder-[#6c757d] focus:outline-none focus:bg-white focus:border-[#212529] focus:ring-1 focus:ring-[#212529] transition-all shadow-inner"
            />
          </div>
        </div>

        {/* Right: Notifications & Sleek Profile Badge (Removed Landing Page link as requested) */}
        <div className="flex items-center gap-4">
          
          {/* Notification Bell */}
          <button 
            type="button"
            className="relative p-2.5 rounded-xl bg-[#f8f9fa] hover:bg-[#e9ecef] text-[#495057] hover:text-[#212529] border border-[#dee2e6] transition-all cursor-pointer shadow-sm"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-tech_orange" />
          </button>

          {/* User Profile Avatar with White / Carbon Black Theme */}
          <div className="flex items-center gap-3 pl-3 border-l border-[#dee2e6]">
            <div className="relative w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr from-tech_orange to-[#212529] shadow-sm">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-xs font-black text-[#212529]">
                {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
            </div>

            <div className="hidden sm:block text-left leading-tight">
              <div className="text-xs font-extrabold text-[#212529] truncate max-w-[130px]">
                {currentUser?.name || 'Administrator'}
              </div>
              <div className="text-[11px] text-[#6c757d] font-semibold">
                Enterprise Admin
              </div>
            </div>

            <button
              type="button"
              onClick={onLogout}
              className="p-2 rounded-xl text-[#6c757d] hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

      {/* Mini Navbar: Clean Bright Snow / Platinum Bar with Height py-4 */}
      <div className="bg-[#f8f9fa] border-t border-[#dee2e6] overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 py-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-[#212529] text-white shadow-md border border-[#212529]'
                    : 'text-[#495057] hover:text-[#212529] hover:bg-[#e9ecef] border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#6c757d]'}`} />
                <span className="tracking-wide">{item.label}</span>
                {item.badge && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-[#e9ecef] text-[#495057] border border-[#ced4da]'
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
