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
  Bot
} from 'lucide-react';
import { IoLogoInstagram as Instagram } from 'react-icons/io5';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const userStr = localStorage.getItem('crm_user');
    const token = localStorage.getItem('crm_token');
    if (!token || !userStr) {
      // Redirect to login if unauthenticated
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
      <div className="min-h-screen bg-slate_dark text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-tech_orange border-t-transparent animate-spin" />
          <p className="text-xs font-mono text-slate-400">Loading Enterprise CRM Workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate_dark text-white flex flex-col selection:bg-tech_orange selection:text-white">
      {/* Another Navbar: Feature Navigation requested by user */}
      <DashboardNavbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        currentUser={currentUser} 
        onLogout={handleLogout}
      />

      {/* Main Workspace Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Welcome Banner */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate_dark-300 via-slate_dark-400 to-tech_blue/20 border border-tech_blue/30 shadow-2xl relative overflow-hidden">
              <div className="absolute right-0 top-0 w-96 h-96 bg-tech_orange/10 rounded-full blur-3xl pointer-events-none" />
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tech_orange/15 border border-tech_orange/30 text-xs font-semibold text-tech_orange mb-3">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Neon PostgreSQL • 7-Day Live Session</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    Welcome back, {currentUser?.name || 'Administrator'}!
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
                    Enterprise operations console for <span className="text-white font-semibold">{currentUser?.company_name || 'AOTMS'}</span>. WhatsApp automation, AI calling pipelines, and SIP collections are running smoothly.
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  <button 
                    onClick={() => setActiveTab('whatsapp')}
                    className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate_dark font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Open WhatsApp</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('ai-calling')}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-tech_orange to-tech_orange-600 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-tech_orange/25 transition-all cursor-pointer"
                  >
                    <Bot className="w-4 h-4" />
                    <span>Launch AI Call</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { title: 'Total Leads Captured', val: '2,845', change: '+18.4%', desc: 'vs last month', icon: Target, color: 'text-tech_orange' },
                { title: 'WhatsApp Broadcasts', val: '98.2%', change: '+4.1%', desc: 'Delivery success rate', icon: MessageSquare, color: 'text-emerald-400' },
                { title: 'AI Calling Completed', val: '1,420', change: '+29.3%', desc: 'Minutes dialed today', icon: PhoneCall, color: 'text-tech_blue-700' },
                { title: 'Pay_SIP Collections', val: '₹14.8L', change: '+12.5%', desc: 'Automated recurring SIPs', icon: CreditCard, color: 'text-purple-400' },
              ].map((kpi, idx) => {
                const Icon = kpi.icon;
                return (
                  <div key={idx} className="p-5 rounded-2xl bg-slate_dark-300/80 border border-white/10 shadow-xl backdrop-blur-md">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-400">{kpi.title}</span>
                      <div className={`p-2 rounded-xl bg-slate_dark-400/80 ${kpi.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-2xl font-extrabold text-white mt-3">{kpi.val}</div>
                    <div className="flex items-center gap-1.5 mt-2 text-xs">
                      <span className="font-bold text-emerald-400 flex items-center">
                        <TrendingUp className="w-3 h-3 mr-0.5" />
                        {kpi.change}
                      </span>
                      <span className="text-slate-400 font-mono text-[11px]">{kpi.desc}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Live Feed & Modules Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* WhatsApp Live Lead Chat */}
              <div className="lg:col-span-2 p-6 rounded-3xl bg-slate_dark-300/80 border border-white/10 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-emerald-400" />
                      <span>Live WhatsApp Inbound Stream</span>
                    </h3>
                    <p className="text-xs text-slate-400">Incoming inquiries routed to AI agents in real time</p>
                  </div>
                  <button 
                    onClick={() => setActiveTab('whatsapp')}
                    className="text-xs text-tech_orange hover:underline font-semibold"
                  >
                    View All Chats →
                  </button>
                </div>

                <div className="space-y-3">
                  {[
                    { sender: 'Rajesh K.', phone: '+91 98450 11223', msg: 'Interested in the AOTMS Masterclass. Can you share syllabus and fees?', time: '2 mins ago', status: 'AI Handled' },
                    { sender: 'Pooja Reddy', phone: '+91 91234 56789', msg: 'Need confirmation on corporate SIP payment link for March.', time: '11 mins ago', status: 'Pending Agent' },
                    { sender: 'Kiran Verma', phone: '+91 87654 32100', msg: 'Requested demo call for WhatsApp CRM API integration.', time: '24 mins ago', status: 'Converted' },
                  ].map((chat, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate_dark-400/80 border border-white/5 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs">
                          {chat.sender.charAt(0)}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-2">
                            <span>{chat.sender}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{chat.phone}</span>
                          </div>
                          <p className="text-xs text-slate-300 line-clamp-1">{chat.msg}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-tech_blue/20 text-tech_blue-700 border border-tech_blue/30">
                          {chat.status}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-1 font-mono">{chat.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Module Shortcuts */}
              <div className="p-6 rounded-3xl bg-slate_dark-300/80 border border-white/10 shadow-xl space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-tech_orange" />
                  <span>CRM Quick Actions</span>
                </h3>

                <div className="space-y-2">
                  <button 
                    onClick={() => setActiveTab('users')}
                    className="w-full p-3 rounded-xl bg-slate_dark-400/80 hover:bg-slate_dark-400 border border-white/5 text-left text-xs font-semibold text-slate-200 hover:text-white flex items-center justify-between transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-tech_blue" />
                      <span>Manage Enterprise Users</span>
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  <button 
                    onClick={() => setActiveTab('leads')}
                    className="w-full p-3 rounded-xl bg-slate_dark-400/80 hover:bg-slate_dark-400 border border-white/5 text-left text-xs font-semibold text-slate-200 hover:text-white flex items-center justify-between transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-tech_orange" />
                      <span>Lead Pipeline & Kanban</span>
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  <button 
                    onClick={() => setActiveTab('todos')}
                    className="w-full p-3 rounded-xl bg-slate_dark-400/80 hover:bg-slate_dark-400 border border-white/5 text-left text-xs font-semibold text-slate-200 hover:text-white flex items-center justify-between transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <CheckSquare className="w-4 h-4 text-emerald-400" />
                      <span>Daily Team Tasks & Todos</span>
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  <button 
                    onClick={() => setActiveTab('pay-sip')}
                    className="w-full p-3 rounded-xl bg-slate_dark-400/80 hover:bg-slate_dark-400 border border-white/5 text-left text-xs font-semibold text-slate-200 hover:text-white flex items-center justify-between transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-purple-400" />
                      <span>Pay_SIP Recurring Invoices</span>
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: USERS */}
        {activeTab === 'users' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-tech_blue" />
                  <span>Enterprise User Management</span>
                </h2>
                <p className="text-xs text-slate-400">Manage organizational members, credentials, and access roles stored in Neon Database.</p>
              </div>
              <button 
                type="button"
                className="px-4 py-2 rounded-xl bg-tech_blue hover:bg-tech_blue-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-tech_blue/20"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Invite New User</span>
              </button>
            </div>

            <div className="rounded-2xl bg-slate_dark-300/90 border border-white/10 overflow-hidden shadow-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate_dark-400/80 text-slate-400 uppercase font-mono text-[10px]">
                  <tr>
                    <th className="p-4">User</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">WhatsApp Phone</th>
                    <th className="p-4">Organization</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-200">
                  <tr className="hover:bg-slate_dark-400/40">
                    <td className="p-4 font-bold text-white flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-tech_orange flex items-center justify-center text-xs font-bold text-white">
                        {currentUser?.name ? currentUser.name.charAt(0) : 'A'}
                      </div>
                      <span>{currentUser?.name || 'Administrator'}</span>
                    </td>
                    <td className="p-4 font-mono text-slate-300">{currentUser?.email || 'admin@techmasters.com'}</td>
                    <td className="p-4 font-mono text-emerald-400">{currentUser?.phone || '+91 98765 43210'}</td>
                    <td className="p-4 text-tech_orange font-medium">{currentUser?.company_name || 'AOTMS'}</td>
                    <td className="p-4"><span className="px-2 py-0.5 rounded-full bg-tech_orange/20 text-tech_orange font-bold text-[10px]">Enterprise Admin</span></td>
                    <td className="p-4"><span className="text-emerald-400 flex items-center gap-1 font-semibold text-[11px]"><CheckCircle2 className="w-3 h-3" /> Active (7d JWT)</span></td>
                  </tr>
                  <tr className="hover:bg-slate_dark-400/40">
                    <td className="p-4 font-bold text-white flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-tech_blue flex items-center justify-center text-xs font-bold text-white">V</div>
                      <span>Vikram Sharma</span>
                    </td>
                    <td className="p-4 font-mono text-slate-300">vikram@techmasters.com</td>
                    <td className="p-4 font-mono text-emerald-400">+91 98450 11223</td>
                    <td className="p-4 text-tech_orange font-medium">AOTMS Enterprise Solutions</td>
                    <td className="p-4"><span className="px-2 py-0.5 rounded-full bg-tech_blue/20 text-tech_blue-700 font-bold text-[10px]">CRM Manager</span></td>
                    <td className="p-4"><span className="text-emerald-400 flex items-center gap-1 font-semibold text-[11px]"><CheckCircle2 className="w-3 h-3" /> Active</span></td>
                  </tr>
                  <tr className="hover:bg-slate_dark-400/40">
                    <td className="p-4 font-bold text-white flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center text-xs font-bold text-white">A</div>
                      <span>Ananya Rao</span>
                    </td>
                    <td className="p-4 font-mono text-slate-300">ananya@techmasters.com</td>
                    <td className="p-4 font-mono text-emerald-400">+91 98765 43210</td>
                    <td className="p-4 text-tech_orange font-medium">Apex Technologies</td>
                    <td className="p-4"><span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold text-[10px]">Sales Lead</span></td>
                    <td className="p-4"><span className="text-emerald-400 flex items-center gap-1 font-semibold text-[11px]"><CheckCircle2 className="w-3 h-3" /> Active</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: LEADS */}
        {activeTab === 'leads' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                  <Target className="w-5 h-5 text-tech_orange" />
                  <span>WhatsApp Lead Pipeline</span>
                </h2>
                <p className="text-xs text-slate-400">Manage deal stages, automatic qualification, and conversion tracking.</p>
              </div>
              <button 
                type="button"
                className="px-4 py-2 rounded-xl bg-tech_orange hover:bg-tech_orange-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-tech_orange/20"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add New Lead</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { stage: 'New Inquiries', count: 18, color: 'border-tech_blue', items: [
                  { name: 'Dr. Srinivas Rao', org: 'MedTech Labs', budget: '₹1,50,000', score: '92%' },
                  { name: 'Arjun Mehra', org: 'Mehra Logistics', budget: '₹85,000', score: '84%' }
                ]},
                { stage: 'AI Qualified', count: 12, color: 'border-tech_orange', items: [
                  { name: 'Priya Kulkarni', org: 'EduSprint Academy', budget: '₹2,20,000', score: '98%' },
                  { name: 'Farhan Akhtar', org: 'Omni Retailers', budget: '₹60,000', score: '79%' }
                ]},
                { stage: 'Demo Scheduled', count: 7, color: 'border-purple-500', items: [
                  { name: 'Sanjay Dutt', org: 'Apex Real Estate', budget: '₹5,00,000', score: '95%' }
                ]},
                { stage: 'Won / Enrolled', count: 34, color: 'border-emerald-500', items: [
                  { name: 'Deepa Patel', org: 'Patel Global Infra', budget: '₹3,40,000', score: '100%' },
                  { name: 'Karthik Raja', org: 'CloudStack Ventures', budget: '₹1,80,000', score: '100%' }
                ]}
              ].map((col, idx) => (
                <div key={idx} className={`p-4 rounded-2xl bg-slate_dark-300/80 border-t-4 ${col.color} border-white/5 shadow-xl space-y-3`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-white">{col.stage}</span>
                    <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-mono">{col.count}</span>
                  </div>
                  <div className="space-y-2.5">
                    {col.items.map((lead, lIdx) => (
                      <div key={lIdx} className="p-3 rounded-xl bg-slate_dark-400/90 border border-white/5 hover:border-white/20 transition-all cursor-pointer">
                        <div className="text-xs font-bold text-white">{lead.name}</div>
                        <div className="text-[11px] text-slate-400">{lead.org}</div>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5 text-[10px]">
                          <span className="text-emerald-400 font-bold">{lead.budget}</span>
                          <span className="px-1.5 py-0.2 rounded bg-tech_blue/20 text-tech_blue-700 font-mono">Score {lead.score}</span>
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
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-purple-400" />
                <span>Employee Team Directory</span>
              </h2>
              <p className="text-xs text-slate-400">Team members, designations, department allocation, and CRM handling quotas.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { name: 'Kavita Menon', role: 'Chief Marketing Officer', dept: 'Growth & Inbound', leads: '412 handled', status: 'Online' },
                { name: 'Rohan Deshmukh', role: 'AI Calling Operations Lead', dept: 'AI Voice Ops', leads: '1,280 calls', status: 'In Call' },
                { name: 'Sneha Agarwal', role: 'WhatsApp Automation Architect', dept: 'Tech Support', leads: '98% SLA', status: 'Online' },
              ].map((emp, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-slate_dark-300/80 border border-white/10 shadow-xl space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-tech_orange to-tech_blue flex items-center justify-center text-sm font-black text-white">
                      {emp.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">{emp.name}</div>
                      <div className="text-xs text-tech_orange font-medium">{emp.role}</div>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate_dark-400/80 text-xs space-y-1 text-slate-300">
                    <div>Department: <span className="text-white font-semibold">{emp.dept}</span></div>
                    <div>Performance: <span className="text-emerald-400 font-mono font-bold">{emp.leads}</span></div>
                    <div className="text-emerald-400 text-[10px] font-mono flex items-center gap-1">● {emp.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: AI CALLING */}
        {activeTab === 'ai-calling' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                  <PhoneCall className="w-5 h-5 text-tech_blue-700" />
                  <span>AI Voice Agent & Calling Campaigns</span>
                </h2>
                <p className="text-xs text-slate-400">Autonomous conversational voice bots dialing leads, collecting feedback, and booking demos.</p>
              </div>
              <button 
                type="button"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-tech_orange to-tech_orange-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-tech_orange/20"
              >
                <PhoneForwarded className="w-3.5 h-3.5" />
                <span>Start New Batch Call</span>
              </button>
            </div>

            <div className="p-6 rounded-3xl bg-slate_dark-300/80 border border-white/10 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white">Recent AI Calling Logs (Live Telephony Stream)</h3>
              <div className="space-y-2.5">
                {[
                  { target: 'Venkatesh Babu', phone: '+91 99887 66554', duration: '3m 42s', sentiment: 'Highly Positive', outcome: 'Demo Confirmed for Friday 4 PM' },
                  { target: 'Geeta Nair', phone: '+91 98776 55443', duration: '1m 15s', sentiment: 'Interested', outcome: 'Requested WhatsApp Brochure' },
                  { target: 'Mohit Chawla', phone: '+91 97665 44332', duration: '4m 02s', sentiment: 'Follow Up Needed', outcome: 'Callback scheduled tomorrow morning' },
                ].map((call, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate_dark-400/80 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="font-bold text-white flex items-center gap-2">
                        <span>{call.target}</span>
                        <span className="font-mono text-slate-400 text-[11px]">{call.phone}</span>
                      </div>
                      <p className="text-slate-300 mt-1">Outcome: <span className="text-emerald-400 font-medium">{call.outcome}</span></p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-slate-400">Duration: {call.duration}</span>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold text-[10px]">
                        {call.sentiment}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: WHATSAPP */}
        {activeTab === 'whatsapp' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-400" />
                <span>Enterprise WhatsApp Automation Console</span>
              </h2>
              <p className="text-xs text-slate-400">WhatsApp Cloud API & Web session management with instant broadcast campaigns.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* WhatsApp Connection Card */}
              <div className="p-6 rounded-3xl bg-slate_dark-300/80 border border-emerald-500/30 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400">WhatsApp Gateway</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">Connected</span>
                </div>
                <div className="text-lg font-extrabold text-white">+91 98765 43210</div>
                <p className="text-xs text-slate-300">Active Business Account: <span className="text-white font-semibold">{currentUser?.company_name || 'AOTMS'}</span></p>
                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Daily Messages Limit</span>
                  <span className="font-mono text-white font-bold">100,000 / day</span>
                </div>
              </div>

              {/* Quick Broadcast Sender */}
              <div className="lg:col-span-2 p-6 rounded-3xl bg-slate_dark-300/80 border border-white/10 shadow-xl space-y-3">
                <h3 className="text-sm font-bold text-white">Send Instant Template Broadcast</h3>
                <div className="space-y-3">
                  <input 
                    type="text" 
                    placeholder="Campaign Name (e.g. Masterclass Batch Enrollment)" 
                    className="w-full px-3.5 py-2 rounded-xl bg-slate_dark-400 border border-white/10 text-xs text-white placeholder-slate-500"
                  />
                  <textarea 
                    rows={3} 
                    placeholder="Message Body with dynamic variables {{name}}, {{company}}..." 
                    className="w-full px-3.5 py-2 rounded-xl bg-slate_dark-400 border border-white/10 text-xs text-white placeholder-slate-500"
                  />
                  <button className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate_dark font-bold text-xs flex items-center gap-2">
                    <Send className="w-3.5 h-3.5" />
                    <span>Broadcast to 2,845 Contacts</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: TODO LIST */}
        {activeTab === 'todos' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-emerald-400" />
                  <span>CRM Team Todo & Action Items</span>
                </h2>
                <p className="text-xs text-slate-400">Daily follow-up tasks, lead callbacks, and automation checks.</p>
              </div>
              <button 
                type="button"
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate_dark font-bold text-xs flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Task</span>
              </button>
            </div>

            <div className="p-6 rounded-3xl bg-slate_dark-300/80 border border-white/10 shadow-xl space-y-3">
              {[
                { task: 'Follow up with Dr. Srinivas Rao regarding Masterclass corporate invoice', due: 'Today, 5:00 PM', priority: 'High', done: false },
                { task: 'Verify Neon PostgreSQL database backup and active sessions', due: 'Today, 7:00 PM', priority: 'Critical', done: true },
                { task: 'Review AI Calling voice prompt for new SIP promotion campaign', due: 'Tomorrow, 11:00 AM', priority: 'Medium', done: false },
                { task: 'Send WhatsApp broadcast to 34 enrolled students for onboarding', due: 'March 5', priority: 'Normal', done: false },
              ].map((todo, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate_dark-400/80 border border-white/5 flex items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      defaultChecked={todo.done} 
                      className="w-4 h-4 rounded text-tech_orange bg-slate_dark border-white/20 focus:ring-tech_orange cursor-pointer"
                    />
                    <span className={todo.done ? 'line-through text-slate-400 font-medium' : 'text-white font-medium'}>
                      {todo.task}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 shrink-0">
                    <span className="text-[11px] font-mono text-slate-400">{todo.due}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      todo.priority === 'Critical' ? 'bg-rose-500/20 text-rose-400' :
                      todo.priority === 'High' ? 'bg-tech_orange/20 text-tech_orange' :
                      'bg-slate-500/20 text-slate-300'
                    }`}>
                      {todo.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 8: INSTAGRAM */}
        {activeTab === 'instagram' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                <Instagram className="w-5 h-5 text-pink-400" />
                <span>Instagram Social Lead Capture & DMs</span>
              </h2>
              <p className="text-xs text-slate-400">Automated DM replies, keyword trigger funnels, and Instagram story lead forms.</p>
            </div>

            <div className="p-6 rounded-3xl bg-slate_dark-300/80 border border-white/10 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white">Active Instagram Auto-Triggers</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate_dark-400/80 border border-pink-500/20 space-y-2">
                  <div className="font-bold text-white flex items-center justify-between">
                    <span>Keyword: "CRM" or "AOTMS"</span>
                    <span className="text-emerald-400 font-mono text-[10px]">Live Trigger</span>
                  </div>
                  <p className="text-slate-300 text-[11px]">Automatically sends instant WhatsApp demo registration link to user's DM within 3 seconds.</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate_dark-400/80 border border-pink-500/20 space-y-2">
                  <div className="font-bold text-white flex items-center justify-between">
                    <span>Story Mention Reply</span>
                    <span className="text-emerald-400 font-mono text-[10px]">Live Trigger</span>
                  </div>
                  <p className="text-slate-300 text-[11px]">Thanks user for tagging @AcademyOfTechMasters and sends discount promo voucher code.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 9: PAY_SIP */}
        {activeTab === 'pay-sip' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-purple-400" />
                  <span>Pay_SIP Recurring Collections & Invoices</span>
                </h2>
                <p className="text-xs text-slate-400">Automate recurring payment links, UPI mandates, and monthly SIP subscription collections.</p>
              </div>
              <button 
                type="button"
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create SIP Mandate</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-slate_dark-300/80 border border-white/10">
                <span className="text-xs text-slate-400 font-semibold">Active Recurring SIPs</span>
                <div className="text-2xl font-extrabold text-white mt-2">142 Clients</div>
                <div className="text-[11px] text-emerald-400 mt-1 font-mono">98.4% On-time debit</div>
              </div>
              <div className="p-5 rounded-2xl bg-slate_dark-300/80 border border-white/10">
                <span className="text-xs text-slate-400 font-semibold">Total Collections (This Month)</span>
                <div className="text-2xl font-extrabold text-white mt-2">₹14,82,500</div>
                <div className="text-[11px] text-tech_orange mt-1 font-mono">Razorpay & Cashfree UPI</div>
              </div>
              <div className="p-5 rounded-2xl bg-slate_dark-300/80 border border-white/10">
                <span className="text-xs text-slate-400 font-semibold">Auto-Generated Invoices</span>
                <div className="text-2xl font-extrabold text-white mt-2">512 Invoices</div>
                <div className="text-[11px] text-tech_blue-700 mt-1 font-mono">GST Compliant</div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 10: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-slate-300" />
                <span>Enterprise Workspace Settings</span>
              </h2>
              <p className="text-xs text-slate-400">Environment configurations, database endpoints, and JWT session rules.</p>
            </div>

            <div className="p-6 rounded-3xl bg-slate_dark-300/80 border border-white/10 shadow-xl space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-slate_dark-400/80 border border-white/5 space-y-2">
                <div className="font-bold text-white text-sm">Database Engine</div>
                <div className="font-mono text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Neon Serverless PostgreSQL (US East AWS) • Connection Pool Active</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate_dark-400/80 border border-white/5 space-y-2">
                <div className="font-bold text-white text-sm">Authentication Protocol</div>
                <div className="font-mono text-tech_orange flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>HMAC-SHA256 JWT Token (7-Day Expiry) with salted password encryption</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
