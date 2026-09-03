import React from 'react';
import { 
  IoLogoWhatsapp, 
  IoLogoGithub, 
  IoLogoTwitter, 
  IoLogoLinkedin, 
  IoHeart,
  IoCheckmarkCircle,
  IoShieldCheckmarkOutline,
  IoRocketOutline,
  IoFlashOutline
} from 'react-icons/io5';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-t border-emerald-500/20 pt-16 pb-12 text-slate-300 text-sm relative overflow-hidden">
      
      {/* Top Accent Gradient Line Bar */}
      <div className="h-[3px] w-full bg-gradient-to-r from-amber-500 via-emerald-400 via-teal-400 to-amber-500 absolute top-0 left-0 right-0 shadow-sm" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          
          {/* Brand & Enterprise Identity */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <img 
                src="/logo.png" 
                alt="AOTMS Enterprise WhatsApp CRM" 
                className="h-10 sm:h-12 w-auto object-contain drop-shadow-[0_0_12px_rgba(16,185,129,0.4)]" 
              />
            </div>

            <p className="text-sm text-slate-400 max-w-sm leading-relaxed font-normal">
              Enterprise-grade WhatsApp CRM automation, multi-agent lead management, official Meta Cloud API broadcast engine, and automated Pay_SIP reminders built on Node.js, Express, MongoDB Atlas, and React.
            </p>

            {/* Live Render Backend API Status Pill */}
            <a 
              href="https://crm-1-62pl.onrender.com" 
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono font-bold text-emerald-400 hover:bg-emerald-500/20 transition-all shadow-xs"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Meta Backend API Live (crm-1-62pl.onrender.com)</span>
            </a>

            {/* Social & Community Links */}
            <div className="flex items-center gap-3 pt-2">
              <a 
                href="https://github.com/aotmscrm-crypto/CRM-1" 
                target="_blank" 
                rel="noreferrer" 
                className="w-10 h-10 rounded-xl bg-slate-800/90 hover:bg-emerald-500 hover:text-slate-950 text-slate-300 border border-slate-700 flex items-center justify-center transition-all cursor-pointer shadow-xs"
                title="GitHub Repository"
              >
                <IoLogoGithub className="text-xl" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-xl bg-slate-800/90 hover:bg-sky-500 hover:text-slate-950 text-slate-300 border border-slate-700 flex items-center justify-center transition-all cursor-pointer shadow-xs"
                title="Twitter / X"
              >
                <IoLogoTwitter className="text-xl" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-xl bg-slate-800/90 hover:bg-blue-600 hover:text-white text-slate-300 border border-slate-700 flex items-center justify-center transition-all cursor-pointer shadow-xs"
                title="LinkedIn"
              >
                <IoLogoLinkedin className="text-xl" />
              </a>
              <a 
                href="https://wa.me/919876543210" 
                target="_blank" 
                rel="noreferrer"
                className="w-10 h-10 rounded-xl bg-slate-800/90 hover:bg-emerald-600 hover:text-white text-slate-300 border border-slate-700 flex items-center justify-center transition-all cursor-pointer shadow-xs"
                title="WhatsApp Direct Support"
              >
                <IoLogoWhatsapp className="text-xl text-emerald-400" />
              </a>
            </div>
          </div>

          {/* Product Modules */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-extrabold uppercase tracking-wider text-amber-400">
              CRM Modules
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="/dashboard" className="hover:text-emerald-400 transition-colors">Meta WhatsApp Blast</a></li>
              <li><a href="/dashboard" className="hover:text-emerald-400 transition-colors">Multi-Agent Team Inbox</a></li>
              <li><a href="/dashboard" className="hover:text-emerald-400 transition-colors">Leads & Daily Calling</a></li>
              <li><a href="/dashboard" className="hover:text-emerald-400 transition-colors">Pay_SIP Reminders</a></li>
              <li><a href="/dashboard" className="hover:text-emerald-400 transition-colors">User Management & RBAC</a></li>
              <li><a href="/dashboard" className="hover:text-emerald-400 transition-colors">Employee Performance</a></li>
            </ul>
          </div>

          {/* Live API & Tech Stack */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-extrabold uppercase tracking-wider text-emerald-400">
              Cloud Infrastructure
            </h4>
            <ul className="space-y-2.5 text-xs font-mono">
              <li>
                <a href="https://crm-1-62pl.onrender.com" target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline flex items-center gap-1.5">
                  <IoFlashOutline className="text-amber-400" />
                  <span>Meta Cloud API Endpoint</span>
                </a>
              </li>
              <li>
                <span className="text-slate-400 flex items-center gap-1.5">
                  <IoCheckmarkCircle className="text-emerald-400" />
                  <span>MongoDB Atlas Cluster</span>
                </span>
              </li>
              <li>
                <span className="text-slate-400 flex items-center gap-1.5">
                  <IoCheckmarkCircle className="text-sky-400" />
                  <span>Vite + React 19 Frontend</span>
                </span>
              </li>
              <li>
                <span className="text-slate-400 flex items-center gap-1.5">
                  <IoCheckmarkCircle className="text-teal-400" />
                  <span>Node.js + Express Backend</span>
                </span>
              </li>
              <li>
                <span className="text-slate-400 flex items-center gap-1.5">
                  <IoShieldCheckmarkOutline className="text-purple-400" />
                  <span>JWT 7-Day Session Auth</span>
                </span>
              </li>
            </ul>
          </div>

          {/* Compliance & Security */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-extrabold uppercase tracking-wider text-sky-400">
              Enterprise Compliance
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="#" className="hover:text-white transition-colors">Official Meta Partner API</a></li>
              <li><a href="#" className="hover:text-white transition-colors">End-to-End Encryption</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Anti-Spam Rate Pacing</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy & Data Security</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Enterprise SLA</a></li>
            </ul>
          </div>

        </div>

        {/* Bottom Production Copyright Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 font-mono">
          <p>© {new Date().getFullYear()} AOTMS Enterprise CRM • Official WhatsApp Automation Platform</p>
          <div className="flex items-center gap-1.5 text-slate-300">
            <span>Architected with</span>
            <IoHeart className="text-rose-500 text-sm inline animate-pulse" />
            <span>for Production High-Volume Workloads</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
