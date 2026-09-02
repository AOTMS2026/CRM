import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardNavbar from './DashboardNavbar';
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
  TrendingUp,
  Activity,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Send,
  Plus,
  Filter,
  Download,
  Calendar,
  Sparkles,
  PhoneForwarded,
  Bot,
  Leaf,
  BarChart3,
  Layers,
  Zap,
  Check,
  ChevronRight
} from 'lucide-react';
import { IoLogoInstagram as Instagram } from 'react-icons/io5';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [currentUser, setCurrentUser] = useState(null);
  const [graphTimeframe, setGraphTimeframe] = useState('30D');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const userStr = localStorage.getItem('crm_user');
    const token = localStorage.getItem('crm_token');
    if (!token || !userStr) {
      navigate('/login');
      return;
    }
    try {
      setCurrentUser(JSON.parse(userStr));
    } catch (e) {
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('crm_token');
    localStorage.removeItem('crm_user');
    window.dispatchEvent(new Event('auth-change'));
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#061412] text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-emerald-400 border-t-transparent animate-spin" />
          <p className="text-xs font-mono text-emerald-200/70 tracking-wider">Awakening AOTMS Enterprise CRM...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#061412] text-emerald-50 flex flex-col selection:bg-emerald-500 selection:text-white relative overflow-hidden">
      
      {/* Nature Aurora Glow Background Orbs */}
      <div className="fixed top-0 left-1/4 w-[650px] h-[650px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-10 w-[550px] h-[550px] bg-teal-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* Increased Size & Height Dashboard Navbar with Nature Vibe */}
      <DashboardNavbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        currentUser={currentUser} 
        onLogout={handleLogout}
      />

      {/* Main Workspace Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* TAB 1: OVERVIEW WITH ADVANCED NATURE GRAPH STYLES */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            
            {/* Nature Hero Welcome Banner */}
            <div className="p-7 sm:p-9 rounded-3xl bg-gradient-to-r from-[#0c2822] via-[#0f342c] to-[#123e35] border border-emerald-500/30 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <Leaf className="w-64 h-64 text-emerald-400" />
              </div>

              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                <div className="space-y-2 max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-xs font-semibold text-emerald-300">
                    <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                    <span>AOTMS Intelligent Ecosystem • Live Active</span>
                  </div>
                  <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                    Good day, {currentUser?.name || 'Administrator'} 🌿
                  </h1>
                  <p className="text-xs sm:text-sm text-emerald-100/70 leading-relaxed">
                    Overview of your enterprise automation engine. High-throughput WhatsApp pipelines, autonomous AI voice dialing, and automated Pay_SIP collections are operating harmoniously.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button 
                    onClick={() => setActiveTab('whatsapp')}
                    className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate_dark font-extrabold text-xs flex items-center gap-2 shadow-xl shadow-emerald-500/25 transition-all cursor-pointer hover:-translate-y-0.5"
                  >
                    <MessageSquare className="w-4 h-4 text-[#061412]" />
                    <span>WhatsApp Console</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('ai-calling')}
                    className="px-5 py-3 rounded-2xl bg-[#144238] hover:bg-[#1a5548] text-emerald-100 border border-emerald-400/30 font-extrabold text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer hover:-translate-y-0.5"
                  >
                    <Bot className="w-4 h-4 text-emerald-400" />
                    <span>Launch AI Voice Bot</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 4 Cool Nature Metric Cards with Mini Sparklines */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { title: 'Inbound Leads Captured', val: '3,184', change: '+22.4%', sub: 'this month', spark: 'M0,18 L15,12 L30,15 L45,8 L60,11 L75,4 L90,2' },
                { title: 'WhatsApp Broadcast Rate', val: '99.4%', change: '+3.8%', sub: 'delivery health', spark: 'M0,16 L15,14 L30,12 L45,10 L60,8 L75,5 L90,3' },
                { title: 'Autonomous AI Minutes', val: '1,840m', change: '+34.1%', sub: 'voice dialed', spark: 'M0,18 L15,16 L30,10 L45,13 L60,7 L75,5 L90,2' },
                { title: 'Recurring SIP Revenue', val: '₹18.42L', change: '+15.2%', sub: 'active mandates', spark: 'M0,17 L15,13 L30,11 L45,9 L60,8 L75,4 L90,1' },
              ].map((card, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-[#09221d]/85 border border-emerald-500/20 shadow-xl backdrop-blur-xl relative overflow-hidden group hover:border-emerald-400/40 transition-all">
                  <div className="flex items-center justify-between text-xs text-emerald-200/70 font-medium">
                    <span>{card.title}</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 group-hover:animate-ping" />
                  </div>
                  <div className="text-3xl font-black text-white mt-2.5 tracking-tight">{card.val}</div>
                  
                  {/* Mini Sparkline Graph */}
                  <div className="flex items-end justify-between mt-3 pt-3 border-t border-emerald-500/10">
                    <span className="text-xs font-bold text-emerald-400 flex items-center font-mono">
                      <TrendingUp className="w-3.5 h-3.5 mr-1" />
                      {card.change}
                    </span>
                    <svg className="w-24 h-6 text-emerald-400 stroke-current fill-none stroke-2" viewBox="0 0 90 20">
                      <path d={card.spark} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>

            {/* PRESENTATION GRAPH SECTION: NATURE SPLINE CURVE & CONVERSION WATERFALL */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Main Area Graph: Revenue & Pipeline Growth Curve */}
              <div className="lg:col-span-2 p-6 sm:p-7 rounded-3xl bg-[#09221d]/90 border border-emerald-500/20 shadow-2xl backdrop-blur-2xl space-y-6">
                
                {/* Graph Header with Timeframe Selectors */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-emerald-400" />
                      <h3 className="text-base font-bold text-white">Lead Generation & Revenue Velocity</h3>
                    </div>
                    <p className="text-xs text-emerald-100/60 mt-0.5">Continuous visual tracking across WhatsApp, AI Calling, and Instagram leads</p>
                  </div>

                  {/* Timeframe Pill Buttons */}
                  <div className="flex items-center p-1 rounded-xl bg-[#071915] border border-emerald-500/20 text-xs font-mono font-semibold self-start sm:self-auto">
                    {['7D', '30D', '90D', '1Y'].map((tf) => (
                      <button
                        key={tf}
                        onClick={() => setGraphTimeframe(tf)}
                        className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                          graphTimeframe === tf 
                            ? 'bg-emerald-500 text-slate_dark font-bold shadow-md shadow-emerald-500/30' 
                            : 'text-emerald-100/60 hover:text-white'
                        }`}
                      >
                        {tf}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Interactive SVG Bézier Spline Graph */}
                <div className="relative w-full h-64 sm:h-72">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 600 220" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="natureEmeraldGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.45" />
                        <stop offset="60%" stopColor="#059669" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="#047857" stopOpacity="0.0" />
                      </linearGradient>
                      <linearGradient id="natureTealGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#0891b2" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Horizontal Grid Lines */}
                    <line x1="0" y1="30" x2="600" y2="30" stroke="#0f3d33" strokeDasharray="4,4" strokeWidth="1" />
                    <line x1="0" y1="80" x2="600" y2="80" stroke="#0f3d33" strokeDasharray="4,4" strokeWidth="1" />
                    <line x1="0" y1="130" x2="600" y2="130" stroke="#0f3d33" strokeDasharray="4,4" strokeWidth="1" />
                    <line x1="0" y1="180" x2="600" y2="180" stroke="#0f3d33" strokeDasharray="4,4" strokeWidth="1" />

                    {/* Secondary Spline: Inbound Volume */}
                    <path
                      d="M 0,160 Q 60,140 120,135 T 240,115 T 360,125 T 480,90 T 600,70 L 600,210 L 0,210 Z"
                      fill="url(#natureTealGradient)"
                    />
                    <path
                      d="M 0,160 Q 60,140 120,135 T 240,115 T 360,125 T 480,90 T 600,70"
                      fill="none"
                      stroke="#06b6d4"
                      strokeWidth="2"
                      strokeDasharray="5,3"
                    />

                    {/* Primary Spline: Revenue & Conversion Curve */}
                    <path
                      d="M 0,140 Q 60,110 120,95 T 240,75 T 360,60 T 480,45 T 600,25 L 600,210 L 0,210 Z"
                      fill="url(#natureEmeraldGradient)"
                    />
                    <path
                      d="M 0,140 Q 60,110 120,95 T 240,75 T 360,60 T 480,45 T 600,25"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="3.5"
                    />

                    {/* Glowing Interactive Data Nodes */}
                    {[
                      { cx: 120, cy: 95, val: '₹4.2L' },
                      { cx: 240, cy: 75, val: '₹8.6L' },
                      { cx: 360, cy: 60, val: '₹12.1L' },
                      { cx: 480, cy: 45, val: '₹15.8L' },
                      { cx: 600, cy: 25, val: '₹18.4L' },
                    ].map((pt, i) => (
                      <g key={i} className="hover:scale-125 transition-transform cursor-pointer">
                        <circle cx={pt.cx} cy={pt.cy} r="6" fill="#061412" stroke="#34d399" strokeWidth="3" />
                        <circle cx={pt.cx} cy={pt.cy} r="2.5" fill="#a7f3d0" />
                      </g>
                    ))}
                  </svg>

                  {/* Horizontal Axis Labels */}
                  <div className="flex justify-between text-[11px] font-mono text-emerald-200/50 pt-2 border-t border-emerald-500/20">
                    <span>Week 1</span>
                    <span>Week 2</span>
                    <span>Week 3</span>
                    <span>Week 4</span>
                    <span>Current Active</span>
                  </div>
                </div>

                {/* Graph Legend & Status */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-emerald-500/10 text-xs">
                  <div className="flex items-center gap-5">
                    <span className="flex items-center gap-2 text-emerald-200 font-medium">
                      <span className="w-3 h-3 rounded-full bg-emerald-400 shadow-sm" />
                      <span>Converted Collections (Peak ₹18.4L)</span>
                    </span>
                    <span className="flex items-center gap-2 text-cyan-200 font-medium">
                      <span className="w-3 h-1 bg-cyan-400 rounded" />
                      <span>Inbound Leads Captured (3,184)</span>
                    </span>
                  </div>

                  <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1 font-bold">
                    <Zap className="w-3 h-3" /> Live Telemetry
                  </span>
                </div>

              </div>

              {/* Secondary Card: AI Sentiment Donut & Conversion Waterfall */}
              <div className="p-6 sm:p-7 rounded-3xl bg-[#09221d]/90 border border-emerald-500/20 shadow-2xl backdrop-blur-2xl space-y-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Activity className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-base font-bold text-white">AI Voice Sentiment</h3>
                  </div>
                  <p className="text-xs text-emerald-100/60">Autonomous feedback breakdown</p>

                  {/* SVG Circular Donut Chart */}
                  <div className="relative w-40 h-40 mx-auto my-6 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      {/* Background Ring */}
                      <circle cx="50" cy="50" r="38" fill="none" stroke="#0e352d" strokeWidth="12" />
                      {/* Positive Sentiment Arc (68%) */}
                      <circle cx="50" cy="50" r="38" fill="none" stroke="#10b981" strokeWidth="12" strokeDasharray="162 238" strokeDashoffset="0" strokeLinecap="round" />
                      {/* Interested Arc (22%) */}
                      <circle cx="50" cy="50" r="38" fill="none" stroke="#06b6d4" strokeWidth="12" strokeDasharray="52 238" strokeDashoffset="-162" strokeLinecap="round" />
                      {/* Neutral Arc (10%) */}
                      <circle cx="50" cy="50" r="38" fill="none" stroke="#f59e0b" strokeWidth="12" strokeDasharray="24 238" strokeDashoffset="-214" strokeLinecap="round" />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="text-2xl font-black text-white font-mono">68%</span>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">Positive</span>
                    </div>
                  </div>

                  {/* Donut Legend */}
                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center justify-between p-2 rounded-xl bg-[#071b17] border border-emerald-500/10">
                      <span className="flex items-center gap-2 text-emerald-200">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                        <span>Highly Positive / Enrolled</span>
                      </span>
                      <span className="font-mono font-bold text-white">68%</span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-xl bg-[#071b17] border border-emerald-500/10">
                      <span className="flex items-center gap-2 text-cyan-200">
                        <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                        <span>Interested / Demo Requested</span>
                      </span>
                      <span className="font-mono font-bold text-white">22%</span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-xl bg-[#071b17] border border-emerald-500/10">
                      <span className="flex items-center gap-2 text-amber-200">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                        <span>Follow-up Callback</span>
                      </span>
                      <span className="font-mono font-bold text-white">10%</span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setActiveTab('leads')}
                  className="w-full py-2.5 rounded-xl bg-[#0c2c25] hover:bg-[#124238] border border-emerald-500/25 text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <span>Inspect Pipeline Funnel</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </div>

            {/* Live WhatsApp Stream & Quick Access Bar */}
            <div className="p-6 sm:p-7 rounded-3xl bg-[#09221d]/90 border border-emerald-500/20 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <h3 className="text-base font-bold text-white">Real-Time Inbound WhatsApp Feed</h3>
                </div>
                <button 
                  onClick={() => setActiveTab('whatsapp')}
                  className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                >
                  <span>Open Full Inbox</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { name: 'Dr. Srinivas Rao', phone: '+91 98450 11223', text: 'Interested in the AOTMS Masterclass corporate syllabus.', time: 'Just now', status: 'AI Responded' },
                  { name: 'Pooja Reddy', phone: '+91 91234 56789', text: 'Confirmed payment for SIP recurring mandate of ₹15,000.', time: '12m ago', status: 'Mandate Active' },
                  { name: 'Kiran Verma', phone: '+91 87654 32100', text: 'Requested live demonstration for WhatsApp Automation API.', time: '28m ago', status: 'Assigned Agent' },
                ].map((item, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-[#071a16] border border-emerald-500/15 flex flex-col justify-between gap-2.5">
                    <div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-white">{item.name}</span>
                        <span className="text-[10px] font-mono text-emerald-300/60">{item.time}</span>
                      </div>
                      <span className="text-[11px] font-mono text-emerald-400">{item.phone}</span>
                      <p className="text-xs text-emerald-100/70 mt-1 line-clamp-2">{item.text}</p>
                    </div>
                    <div className="pt-2 border-t border-emerald-500/10 flex items-center justify-between text-[10px]">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold font-mono">
                        {item.status}
                      </span>
                      <button onClick={() => setActiveTab('whatsapp')} className="text-emerald-400 font-bold hover:underline">
                        Reply →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: USERS */}
        {activeTab === 'users' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2.5">
                  <Users className="w-6 h-6 text-emerald-400" />
                  <span>Enterprise User & Member Management</span>
                </h2>
                <p className="text-xs text-emerald-100/70">Manage organizational members, credentials, and access roles stored in Neon Database.</p>
              </div>
              <button className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate_dark font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/25 transition-all">
                <Plus className="w-4 h-4" />
                <span>Invite New User</span>
              </button>
            </div>

            <div className="rounded-2xl bg-[#09221d]/90 border border-emerald-500/20 overflow-hidden shadow-2xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#071a16] text-emerald-300/70 uppercase font-mono text-[10px] border-b border-emerald-500/20">
                  <tr>
                    <th className="p-4">User</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">WhatsApp Phone</th>
                    <th className="p-4">Organization</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-500/10 text-emerald-100">
                  <tr className="hover:bg-[#0c2c25]/60 transition-colors">
                    <td className="p-4 font-bold text-white flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-emerald-500 text-slate_dark flex items-center justify-center font-black text-xs">
                        {currentUser?.name ? currentUser.name.charAt(0) : 'A'}
                      </div>
                      <span>{currentUser?.name || 'Administrator'}</span>
                    </td>
                    <td className="p-4 font-mono text-emerald-200/80">{currentUser?.email || 'admin@aotms.com'}</td>
                    <td className="p-4 font-mono text-emerald-400 font-semibold">{currentUser?.phone || '+91 98765 43210'}</td>
                    <td className="p-4 text-emerald-300 font-semibold">{currentUser?.company_name || 'AOTMS'}</td>
                    <td className="p-4"><span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">Enterprise Admin</span></td>
                    <td className="p-4"><span className="text-emerald-400 flex items-center gap-1.5 font-semibold text-[11px]"><CheckCircle2 className="w-3.5 h-3.5" /> Active</span></td>
                  </tr>
                  <tr className="hover:bg-[#0c2c25]/60 transition-colors">
                    <td className="p-4 font-bold text-white flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center font-black text-xs">V</div>
                      <span>Vikram Sharma</span>
                    </td>
                    <td className="p-4 font-mono text-emerald-200/80">vikram@techmasters.com</td>
                    <td className="p-4 font-mono text-emerald-400 font-semibold">+91 98450 11223</td>
                    <td className="p-4 text-emerald-300 font-semibold">AOTMS Enterprise</td>
                    <td className="p-4"><span className="px-2.5 py-1 rounded-full bg-teal-500/20 text-teal-300 font-bold text-[10px]">CRM Manager</span></td>
                    <td className="p-4"><span className="text-emerald-400 flex items-center gap-1.5 font-semibold text-[11px]"><CheckCircle2 className="w-3.5 h-3.5" /> Active</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: LEADS */}
        {activeTab === 'leads' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2.5">
                  <Target className="w-6 h-6 text-emerald-400" />
                  <span>Lead Pipeline & Kanban Waterfall</span>
                </h2>
                <p className="text-xs text-emerald-100/70">Stage-by-stage progression from WhatsApp inquiry to won enrollment.</p>
              </div>
              <button className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate_dark font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/25 transition-all">
                <Plus className="w-4 h-4" />
                <span>Add New Lead</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { stage: 'Inquiries', count: 24, border: 'border-emerald-500', items: [
                  { name: 'Dr. Srinivas Rao', budget: '₹1,50,000', score: '94%' },
                  { name: 'Arjun Mehra', budget: '₹85,000', score: '82%' }
                ]},
                { stage: 'AI Qualified', count: 18, border: 'border-teal-400', items: [
                  { name: 'Priya Kulkarni', budget: '₹2,20,000', score: '98%' },
                  { name: 'Farhan Akhtar', budget: '₹60,000', score: '76%' }
                ]},
                { stage: 'Demo Confirmed', count: 9, border: 'border-cyan-400', items: [
                  { name: 'Sanjay Dutt', budget: '₹5,00,000', score: '96%' }
                ]},
                { stage: 'Won / Enrolled', count: 42, border: 'border-emerald-400', items: [
                  { name: 'Deepa Patel', budget: '₹3,40,000', score: '100%' },
                  { name: 'Karthik Raja', budget: '₹1,80,000', score: '100%' }
                ]},
              ].map((col, idx) => (
                <div key={idx} className={`p-4 rounded-2xl bg-[#09221d]/90 border-t-4 ${col.border} border-emerald-500/20 shadow-xl space-y-3`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-white">{col.stage}</span>
                    <span className="px-2 py-0.5 rounded-full bg-[#061412] text-[10px] font-mono text-emerald-400 font-bold">{col.count}</span>
                  </div>
                  <div className="space-y-2.5">
                    {col.items.map((lead, i) => (
                      <div key={i} className="p-3.5 rounded-xl bg-[#071b17] border border-emerald-500/15 hover:border-emerald-400/40 transition-all cursor-pointer">
                        <div className="text-xs font-bold text-white">{lead.name}</div>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-emerald-500/10 text-[10px]">
                          <span className="text-emerald-400 font-bold font-mono">{lead.budget}</span>
                          <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono">Score {lead.score}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: EMPLOYEES */}
        {activeTab === 'employees' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2.5">
                <Briefcase className="w-6 h-6 text-teal-400" />
                <span>Employee Team Directory</span>
              </h2>
              <p className="text-xs text-emerald-100/70">Team members, departments, attendance, and active lead assignments.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { name: 'Kavita Menon', role: 'Chief Growth Officer', dept: 'Marketing & Inbound', quota: '98% SLA' },
                { name: 'Rohan Deshmukh', role: 'AI Telephony Specialist', dept: 'AI Voice Ops', quota: '1,420 calls' },
                { name: 'Sneha Agarwal', role: 'WhatsApp Automation Engineer', dept: 'Technical Support', quota: '100% SLA' },
              ].map((emp, i) => (
                <div key={i} className="p-5 rounded-2xl bg-[#09221d]/90 border border-emerald-500/20 shadow-xl space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-500 text-slate_dark font-black flex items-center justify-center text-sm">
                      {emp.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">{emp.name}</div>
                      <div className="text-xs text-emerald-400 font-medium">{emp.role}</div>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#071a16] text-xs space-y-1 text-emerald-100/70 font-mono">
                    <div>Department: <span className="text-white font-sans font-semibold">{emp.dept}</span></div>
                    <div>Output: <span className="text-emerald-400 font-bold">{emp.quota}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: AI CALLING */}
        {activeTab === 'ai-calling' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2.5">
                  <PhoneCall className="w-6 h-6 text-emerald-400" />
                  <span>Autonomous AI Calling & Voice Telephony</span>
                </h2>
                <p className="text-xs text-emerald-100/70">Conversational neural voice bots dialing leads, qualifiying intent, and logging recordings.</p>
              </div>
              <button className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-slate_dark font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/25">
                <PhoneForwarded className="w-4 h-4" />
                <span>Trigger New AI Campaign</span>
              </button>
            </div>

            <div className="p-6 rounded-3xl bg-[#09221d]/90 border border-emerald-500/20 shadow-xl space-y-3">
              <h3 className="text-sm font-bold text-white">Live Call Telemetry Logs</h3>
              {[
                { target: 'Venkatesh Babu', phone: '+91 99887 66554', duration: '3m 42s', sentiment: 'Positive (98%)', outcome: 'Demo Confirmed for Friday' },
                { target: 'Geeta Nair', phone: '+91 98776 55443', duration: '1m 15s', sentiment: 'Interested (84%)', outcome: 'Brochure sent on WhatsApp' },
                { target: 'Mohit Chawla', phone: '+91 97665 44332', duration: '4m 02s', sentiment: 'Follow-Up Needed', outcome: 'Callback scheduled tomorrow' },
              ].map((call, i) => (
                <div key={i} className="p-4 rounded-xl bg-[#071a16] border border-emerald-500/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="font-bold text-white flex items-center gap-2">
                      <span>{call.target}</span>
                      <span className="font-mono text-emerald-300/60 text-[11px]">{call.phone}</span>
                    </div>
                    <p className="text-emerald-100/70 mt-1">Outcome: <span className="text-emerald-400 font-medium">{call.outcome}</span></p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-emerald-200/60">{call.duration}</span>
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold text-[10px]">
                      {call.sentiment}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: WHATSAPP */}
        {activeTab === 'whatsapp' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2.5">
                <MessageSquare className="w-6 h-6 text-emerald-400" />
                <span>Enterprise WhatsApp Business Cloud Console</span>
              </h2>
              <p className="text-xs text-emerald-100/70">Official Meta Cloud API gateway with 100K messages/day broadcast throughput.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="p-6 rounded-3xl bg-[#09221d]/90 border border-emerald-500/30 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400">Gateway Status</span>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] font-mono">Live • Connected</span>
                </div>
                <div className="text-xl font-black text-white font-mono">+91 98765 43210</div>
                <p className="text-xs text-emerald-100/70">Verified Enterprise Account: <span className="text-white font-bold">{currentUser?.company_name || 'AOTMS'}</span></p>
                <div className="pt-3 border-t border-emerald-500/15 flex items-center justify-between text-xs">
                  <span className="text-emerald-200/60">Tier Limit</span>
                  <span className="font-mono text-emerald-400 font-bold">100,000 / Day</span>
                </div>
              </div>

              <div className="lg:col-span-2 p-6 rounded-3xl bg-[#09221d]/90 border border-emerald-500/20 shadow-xl space-y-3">
                <h3 className="text-sm font-bold text-white">Broadcast Campaign Template Sender</h3>
                <input 
                  type="text" 
                  placeholder="Campaign Title (e.g. Masterclass New Cohort Announcement)" 
                  className="w-full px-4 py-2.5 rounded-xl bg-[#071a16] border border-emerald-500/20 text-xs text-white placeholder-emerald-100/40"
                />
                <textarea 
                  rows={3} 
                  placeholder="Template Message Body with dynamic tags {{name}}, {{company}}..." 
                  className="w-full px-4 py-2.5 rounded-xl bg-[#071a16] border border-emerald-500/20 text-xs text-white placeholder-emerald-100/40"
                />
                <button className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate_dark font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/25">
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Broadcast to 3,184 Contacts</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: TODO LIST */}
        {activeTab === 'todos' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2.5">
                  <CheckSquare className="w-6 h-6 text-emerald-400" />
                  <span>CRM Team Todo & Action Items</span>
                </h2>
                <p className="text-xs text-emerald-100/70">Scheduled callbacks, manual contract reviews, and automated verification tasks.</p>
              </div>
              <button className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate_dark font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/25">
                <Plus className="w-4 h-4" />
                <span>New Task</span>
              </button>
            </div>

            <div className="p-6 rounded-3xl bg-[#09221d]/90 border border-emerald-500/20 shadow-xl space-y-3">
              {[
                { task: 'Follow up with Dr. Srinivas Rao on corporate invoice and tax clearance', due: 'Today, 5:00 PM', priority: 'High', done: false },
                { task: 'Verify Neon PostgreSQL live database schema integrity and connection pool', due: 'Today, 8:00 PM', priority: 'Critical', done: true },
                { task: 'Review AI Calling conversational prompt for upcoming SIP campaign', due: 'Tomorrow, 11:00 AM', priority: 'Medium', done: false },
                { task: 'Send WhatsApp broadcast to newly enrolled students for orientation', due: 'March 5', priority: 'Normal', done: false },
              ].map((t, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-[#071a16] border border-emerald-500/10 flex items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" defaultChecked={t.done} className="w-4 h-4 rounded text-emerald-500 bg-[#061412] border-emerald-500/30 focus:ring-emerald-500 cursor-pointer" />
                    <span className={t.done ? 'line-through text-emerald-100/40 font-medium' : 'text-white font-medium'}>{t.task}</span>
                  </div>
                  <div className="flex items-center gap-2.5 shrink-0">
                    <span className="text-[11px] font-mono text-emerald-200/60">{t.due}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      t.priority === 'Critical' ? 'bg-rose-500/20 text-rose-300' :
                      t.priority === 'High' ? 'bg-emerald-500/20 text-emerald-300' :
                      'bg-[#0f342c] text-emerald-200/70'
                    }`}>
                      {t.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 8: INSTAGRAM */}
        {activeTab === 'instagram' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2.5">
                <Instagram className="w-6 h-6 text-pink-400" />
                <span>Instagram Direct Message Automation</span>
              </h2>
              <p className="text-xs text-emerald-100/70">Keyword auto-replies, story mention lead capture, and Instagram DM funnels.</p>
            </div>

            <div className="p-6 rounded-3xl bg-[#09221d]/90 border border-emerald-500/20 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white">Active Instagram Auto-Triggers</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-[#071a16] border border-pink-500/20 space-y-2">
                  <div className="font-bold text-white flex items-center justify-between">
                    <span>Keyword: "CRM" or "AOTMS"</span>
                    <span className="text-emerald-400 font-mono text-[10px]">Active</span>
                  </div>
                  <p className="text-emerald-100/70 text-[11px]">Sends WhatsApp demo registration link directly to the user's DM inbox in under 3 seconds.</p>
                </div>

                <div className="p-4 rounded-2xl bg-[#071a16] border border-pink-500/20 space-y-2">
                  <div className="font-bold text-white flex items-center justify-between">
                    <span>Story Mention Trigger</span>
                    <span className="text-emerald-400 font-mono text-[10px]">Active</span>
                  </div>
                  <p className="text-emerald-100/70 text-[11px]">Acknowledges story tags and provides exclusive discount vouchers for AOTMS masterclasses.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 9: PAY_SIP */}
        {activeTab === 'pay-sip' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2.5">
                  <CreditCard className="w-6 h-6 text-emerald-400" />
                  <span>Pay_SIP Recurring Invoices & Mandate Collections</span>
                </h2>
                <p className="text-xs text-emerald-100/70">Automated recurring payment links, UPI autopay mandates, and monthly SIP collections.</p>
              </div>
              <button className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate_dark font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/25">
                <Plus className="w-4 h-4" />
                <span>Create New SIP Mandate</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-[#09221d]/90 border border-emerald-500/20">
                <span className="text-xs text-emerald-200/70 font-semibold">Active Recurring Mandates</span>
                <div className="text-3xl font-black text-white mt-2 font-mono">164 Clients</div>
                <div className="text-[11px] text-emerald-400 mt-1 font-mono">99.1% On-time debit</div>
              </div>
              <div className="p-5 rounded-2xl bg-[#09221d]/90 border border-emerald-500/20">
                <span className="text-xs text-emerald-200/70 font-semibold">Total Collections (This Month)</span>
                <div className="text-3xl font-black text-white mt-2 font-mono">₹18,42,500</div>
                <div className="text-[11px] text-emerald-300 mt-1 font-mono">Razorpay & Cashfree UPI</div>
              </div>
              <div className="p-5 rounded-2xl bg-[#09221d]/90 border border-emerald-500/20">
                <span className="text-xs text-emerald-200/70 font-semibold">GST Invoices Dispatched</span>
                <div className="text-3xl font-black text-white mt-2 font-mono">592 Invoices</div>
                <div className="text-[11px] text-teal-400 mt-1 font-mono">WhatsApp PDF Delivery</div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 10: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2.5">
                <Settings className="w-6 h-6 text-emerald-400" />
                <span>Enterprise Workspace Settings</span>
              </h2>
              <p className="text-xs text-emerald-100/70">Server configuration, Neon PostgreSQL connection pool, and security certificates.</p>
            </div>

            <div className="p-6 rounded-3xl bg-[#09221d]/90 border border-emerald-500/20 shadow-xl space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-[#071a16] border border-emerald-500/15 space-y-2">
                <div className="font-bold text-white text-sm">Database Engine</div>
                <div className="font-mono text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Neon Serverless PostgreSQL (US East AWS Pooler) • Healthy & Connected</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#071a16] border border-emerald-500/15 space-y-2">
                <div className="font-bold text-white text-sm">Authentication Engine</div>
                <div className="font-mono text-emerald-300 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Native HMAC-SHA256 JWT Token Session (7-Day Duration)</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
