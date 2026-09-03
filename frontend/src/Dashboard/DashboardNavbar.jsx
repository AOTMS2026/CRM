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
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.03)] transition-all">
      {/* Top Navbar Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-6">

        {/* Left: Brand Logo & Role Badge */}
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src="/logo.png"
              alt="AOTMS"
              className="h-10 w-auto object-contain group-hover:scale-105 transition-transform"
            />
          </Link>

          {/* Active Role Panel Badge */}
          {(() => {
            const role = currentUser?.role?.toLowerCase() || 'admin';
            if (role === 'admin') {
              return (
                <span className="px-3 py-1 rounded-xl text-xs font-black font-mono bg-rose-100 text-rose-800 border border-rose-300 uppercase tracking-wide shrink-0 shadow-xs">
                  🛡️ Admin Panel
                </span>
              );
            }
            if (role === 'manager') {
              return (
                <span className="px-3 py-1 rounded-xl text-xs font-black font-mono bg-amber-100 text-amber-800 border border-amber-300 uppercase tracking-wide shrink-0 shadow-xs">
                  💼 Manager Panel
                </span>
              );
            }
            return (
              <span className="px-3 py-1 rounded-xl text-xs font-black font-mono bg-sky-100 text-sky-800 border border-sky-300 uppercase tracking-wide shrink-0 shadow-xs">
                👤 Employee Panel
              </span>
            );
          })()}
        </div>

        {/* Center: Global Search Bar */}
        <div className="hidden lg:flex items-center flex-1 max-w-lg mx-6">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search users, leads, WhatsApp chats, tasks... (Ctrl + K)"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition-all"
            />
          </div>
        </div>

        {/* Right: Notifications & User Profile Chip */}
        <div className="flex items-center gap-4">

          {/* Notification Bell */}
          <button
            type="button"
            className="relative p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 transition-all cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4.5 h-4.5" />
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-tech_orange" />
          </button>

          {/* User Profile Avatar */}
          <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
            <div className="relative w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr from-tech_orange via-amber-400 to-sky-500 shadow-sm">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-sm font-black text-slate-900">
                {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
            </div>

            <div className="hidden sm:block text-left leading-tight">
              <div className="text-sm font-extrabold text-slate-900 truncate max-w-[150px]">
                {currentUser?.name || 'Administrator'}
              </div>
              <div className="text-xs text-slate-500 font-semibold font-mono capitalize">
                {currentUser?.role || 'Admin'}
              </div>
            </div>

            <button
              type="button"
              onClick={onLogout}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>
          </div>

        </div>

      </div>
    </header>
  );
}
