import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  LogOut, 
  Bell, 
  Search, 
  Building2 
} from 'lucide-react';

export default function DashboardNavbar({ currentUser, onLogout }) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.03)]">
      {/* Clean Top Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-6">
        
        {/* Left: Brand Logo & Organization Badge */}
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-3 group">
            <img 
              src="/logo.png" 
              alt="AOTMS" 
              className="h-10 w-auto object-contain group-hover:scale-105 transition-transform"
            />
            <span className="text-base font-extrabold tracking-tight text-slate-900 hidden sm:inline">
              AOTMS <span className="text-tech_orange">CRM</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
            <Building2 className="w-3.5 h-3.5 text-tech_orange" />
            <span className="font-semibold text-slate-800 truncate max-w-[190px]">
              {currentUser?.company_name || 'AOTMS Enterprise'}
            </span>
          </div>
        </div>

        {/* Center: Search Bar with Clean Soft White Shadow */}
        <div className="hidden lg:flex items-center flex-1 max-w-lg mx-6">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Search users, leads, WhatsApp chats, tasks... (Ctrl + K)"
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition-all"
            />
          </div>
        </div>

        {/* Right: Notifications & User Profile Chip */}
        <div className="flex items-center gap-3.5">
          
          {/* Notification Bell */}
          <button 
            type="button"
            className="relative p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 border border-slate-200 transition-all cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-tech_orange" />
          </button>

          {/* User Profile Avatar with White / Carbon Black Theme */}
          <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
            <div className="relative w-9 h-9 rounded-full p-[2px] bg-gradient-to-tr from-tech_orange via-amber-400 to-sky-500 shadow-sm">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-xs font-black text-slate-800">
                {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
            </div>

            <div className="hidden sm:block text-left leading-tight">
              <div className="text-xs font-bold text-slate-800 truncate max-w-[130px]">
                {currentUser?.name || 'Administrator'}
              </div>
              <div className="text-[10px] text-slate-500 font-medium">
                Workspace Admin
              </div>
            </div>

            <button
              type="button"
              onClick={onLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </header>
  );
}
