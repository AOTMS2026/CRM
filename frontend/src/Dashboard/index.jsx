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
  ShieldCheck, 
  CheckCircle2, 
  Send, 
  Plus, 
  PhoneForwarded, 
  Mail, 
  Phone, 
  Building2, 
  X, 
  ChevronRight,
  Search,
  RotateCw,
  Activity,
  Award
} from 'lucide-react';
import { IoLogoInstagram as Instagram } from 'react-icons/io5';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('users');
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null); // For Overall Information Modal
  const [searchTerm, setSearchTerm] = useState('');
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

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  };

  // Sample organizational users stored in Neon PostgreSQL
  const teamUsers = [
    {
      id: 'usr_001',
      name: currentUser?.name || 'Administrator',
      email: currentUser?.email || 'admin@aotms.com',
      phone: currentUser?.phone || '+91 98765 43210',
      company: currentUser?.company_name || 'AOTMS Enterprise',
      role: 'Enterprise Admin',
      status: 'Active',
      leadsHandled: 420,
      conversionRate: '88.4%',
      activeDeals: '₹34.5L',
      joined: 'September 2024',
      bio: 'Executive administrator overseeing company automation pipelines, WhatsApp gateways, and user credentials.',
      recentActivities: [
        'Activated automated 100K WhatsApp broadcast campaign',
        'Provisioned Neon PostgreSQL database migration pool',
        'Authorized Pay_SIP recurring collection batch'
      ]
    },
    {
      id: 'usr_002',
      name: 'Vikram Sharma',
      email: 'vikram@techmasters.com',
      phone: '+91 98450 11223',
      company: 'AOTMS Enterprise Solutions',
      role: 'CRM Manager',
      status: 'Active',
      leadsHandled: 312,
      conversionRate: '79.2%',
      activeDeals: '₹22.1L',
      joined: 'January 2025',
      bio: 'Lead operations strategist coordinating sales agents and WhatsApp inbound workflows.',
      recentActivities: [
        'Qualified 14 enterprise leads from Bangalore seminar',
        'Adjusted AI voice prompt sensitivity for corporate calls',
        'Reviewed quarterly sales quotas and conversion rates'
      ]
    },
    {
      id: 'usr_003',
      name: 'Ananya Rao',
      email: 'ananya@techmasters.com',
      phone: '+91 98765 43210',
      company: 'AOTMS AI & Automation Labs',
      role: 'Senior Sales Lead',
      status: 'Active',
      leadsHandled: 285,
      conversionRate: '84.6%',
      activeDeals: '₹18.8L',
      joined: 'March 2025',
      bio: 'Specialist in student enrollment, Masterclass consultations, and Pay_SIP subscriptions.',
      recentActivities: [
        'Enrolled 8 students into Advanced AI Masterclass',
        'Generated ₹1,20,000 in recurring SIP UPI mandates',
        'Followed up with 25 WhatsApp inbound inquiries'
      ]
    },
    {
      id: 'usr_004',
      name: 'Rohan Deshmukh',
      email: 'rohan@aotms.com',
      phone: '+91 97665 44332',
      company: 'AOTMS Cloud Technologies',
      role: 'AI Calling Specialist',
      status: 'In Call',
      leadsHandled: 540,
      conversionRate: '72.1%',
      activeDeals: '₹14.2L',
      joined: 'June 2025',
      bio: 'Telephony engineer managing autonomous voice bots, call sentiment analysis, and queue routing.',
      recentActivities: [
        'Ran 400-call AI voice batch with 98% sentiment accuracy',
        'Resolved telephony gateway latency on Airtel trunk',
        'Exported demo confirmation recordings to CRM leads'
      ]
    }
  ];

  const filteredUsers = teamUsers.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Mini Navbar tab items (Styled with underline indicator as in user image)
  const navTabs = [
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'leads', label: 'Leads & Pipeline', icon: Target },
    { id: 'employees', label: 'Employees', icon: Briefcase },
    { id: 'ai-calling', label: 'AI Calling', icon: PhoneCall },
    { id: 'whatsapp', label: 'WhatsApp Gateway', icon: MessageSquare },
    { id: 'todos', label: 'Todo List', icon: CheckSquare },
    { id: 'instagram', label: 'Instagram', icon: Instagram },
    { id: 'pay-sip', label: 'Pay_SIP', icon: CreditCard },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] text-slate-800 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-tech_orange border-t-transparent animate-spin" />
          <p className="text-xs font-mono text-slate-500">Loading Platform Administration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fef5ee] via-[#fbfcfe] to-[#eaf4fb] text-slate-800 flex flex-col font-sans selection:bg-tech_orange selection:text-white relative">
      
      {/* Ambient Luminous Orbs for Rich Background Shade (as in screenshot) */}
      <div className="fixed top-0 left-0 w-[550px] h-[450px] bg-gradient-to-br from-amber-200/50 via-orange-100/35 to-transparent rounded-full blur-[110px] pointer-events-none -z-10" />
      <div className="fixed top-0 right-0 w-[550px] h-[450px] bg-gradient-to-bl from-sky-200/45 via-cyan-100/25 to-transparent rounded-full blur-[110px] pointer-events-none -z-10" />

      {/* Subtle Background Mesh & Light Dot Grid Pattern */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.55] -z-10" 
        style={{
          backgroundImage: 'radial-gradient(#94a3b8 1.1px, transparent 1.1px)',
          backgroundSize: '24px 24px'
        }}
      />

      {/* Top Navbar */}
      <DashboardNavbar 
        currentUser={currentUser} 
        onLogout={handleLogout}
      />

      {/* Main Workspace Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">
        
        {/* ========================================================================= */}
        {/* PLATFORM ADMINISTRATION HEADER (As shown in user's image) */}
        {/* ========================================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Platform Administration
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
              Overview of system performance, user activities, and platform logs.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs border border-slate-200 shadow-sm hover:shadow transition-all cursor-pointer active:scale-98"
          >
            <RotateCw className={`w-3.5 h-3.5 text-sky-600 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh Data</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* 5 TOP STAT CARDS: Users Total, Leads, Todo List, Employees, System Health */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          
          {/* Card 1: TOTAL USERS */}
          <div className="bg-white/95 rounded-2xl p-5 border border-slate-200/90 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] hover:shadow-lg hover:-translate-y-0.5 transition-all flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 border border-sky-200/70 flex items-center justify-center shadow-xs">
                <Users className="w-5 h-5" />
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-xs">
                +12.5%
              </span>
            </div>
            <div className="mt-4">
              <div className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
                TOTAL USERS
              </div>
              <div className="text-3xl sm:text-4xl font-black text-slate-900 mt-1 tracking-tight">
                69
              </div>
              <div className="text-xs font-semibold text-slate-600 mt-1">
                Registered accounts
              </div>
            </div>
          </div>

          {/* Card 2: ACTIVE LEADS */}
          <div className="bg-white/95 rounded-2xl p-5 border border-slate-200/90 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] hover:shadow-lg hover:-translate-y-0.5 transition-all flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 border border-amber-200/70 flex items-center justify-center shadow-xs">
                <Target className="w-5 h-5" />
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                Steady
              </span>
            </div>
            <div className="mt-4">
              <div className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
                ACTIVE LEADS
              </div>
              <div className="text-3xl sm:text-4xl font-black text-slate-900 mt-1 tracking-tight">
                184
              </div>
              <div className="text-xs font-semibold text-slate-600 mt-1">
                WhatsApp inbounds
              </div>
            </div>
          </div>

          {/* Card 3: TODO LIST */}
          <div className="bg-white/95 rounded-2xl p-5 border border-slate-200/90 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] hover:shadow-lg hover:-translate-y-0.5 transition-all flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 border border-rose-200/70 flex items-center justify-center shadow-xs">
                <CheckSquare className="w-5 h-5" />
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                Clear
              </span>
            </div>
            <div className="mt-4">
              <div className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
                TODO LIST
              </div>
              <div className="text-3xl sm:text-4xl font-black text-slate-900 mt-1 tracking-tight">
                5
              </div>
              <div className="text-xs font-semibold text-slate-600 mt-1">
                Pending approval queue
              </div>
            </div>
          </div>

          {/* Card 4: EMPLOYEES */}
          <div className="bg-white/95 rounded-2xl p-5 border border-slate-200/90 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] hover:shadow-lg hover:-translate-y-0.5 transition-all flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 border border-sky-200/70 flex items-center justify-center shadow-xs">
                <Briefcase className="w-5 h-5" />
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                Real-time
              </span>
            </div>
            <div className="mt-4">
              <div className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
                EMPLOYEES
              </div>
              <div className="text-3xl sm:text-4xl font-black text-slate-900 mt-1 tracking-tight">
                12
              </div>
              <div className="text-xs font-semibold text-slate-600 mt-1">
                Currently active now
              </div>
            </div>
          </div>

          {/* Card 5: SYSTEM HEALTH */}
          <div className="bg-white/95 rounded-2xl p-5 border border-slate-200/90 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] hover:shadow-lg hover:-translate-y-0.5 transition-all flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 border border-teal-200/70 flex items-center justify-center shadow-xs">
                <Activity className="w-5 h-5" />
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                Optimal
              </span>
            </div>
            <div className="mt-4">
              <div className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
                SYSTEM HEALTH
              </div>
              <div className="text-3xl sm:text-4xl font-black text-slate-900 mt-1 tracking-tight">
                99.4%
              </div>
              <div className="text-xs font-semibold text-slate-600 mt-1">
                Platform-wide
              </div>
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* MINI NAVBAR (Horizontal Underline Tab Bar with Vivid Contrast)             */}
        {/* ========================================================================= */}
        <div className="border-b border-slate-200 pt-2 flex items-center gap-7 overflow-x-auto scrollbar-none">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 pb-3.5 text-xs font-bold whitespace-nowrap transition-all cursor-pointer relative ${
                  isActive
                    ? 'text-sky-600 font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-sky-600' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-500 rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: USER MANAGEMENT (Card Style with Overall Info Modal)               */}
        {/* ========================================================================= */}
        {activeTab === 'users' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            
            {/* Search & New User Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Registered Accounts ({filteredUsers.length})
                </h2>
                <p className="text-xs text-slate-500">Click any card to inspect overall user telemetry, WhatsApp links, and credentials.</p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search users by name, role, email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white transition-all"
                  />
                </div>

                <button
                  type="button"
                  className="px-4 py-2 rounded-xl bg-tech_orange hover:bg-tech_orange-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  <span>New User</span>
                </button>
              </div>
            </div>

            {/* User Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className="p-6 rounded-2xl bg-white border border-slate-200 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] hover:shadow-xl hover:border-sky-300 transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3.5">
                    <div className="flex items-start justify-between">
                      <div className="relative w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-base font-black text-slate-900 shadow-sm group-hover:scale-105 transition-transform">
                        {user.name.charAt(0)}
                        <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
                          user.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'
                        }`} />
                      </div>

                      <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 font-bold text-[10px] font-mono border border-slate-200">
                        {user.role}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 group-hover:text-tech_orange transition-colors">
                        {user.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-slate-600 text-xs mt-0.5 font-semibold truncate">
                        <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="truncate">{user.company}</span>
                      </div>
                    </div>

                    <div className="space-y-1 text-xs font-mono pt-1 text-slate-700">
                      <div className="flex items-center gap-2 truncate">
                        <Mail className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                        <span className="truncate text-slate-600 font-medium">{user.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-emerald-700 font-bold">
                        <Phone className="w-3.5 h-3.5 shrink-0" />
                        <span>{user.phone}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                      <div className="text-[10px] text-slate-500 font-bold">Leads Handled</div>
                      <div className="text-sm font-black text-slate-900 font-mono">{user.leadsHandled}</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                      <div className="text-[10px] text-slate-500 font-bold">Conversion</div>
                      <div className="text-sm font-black text-emerald-700 font-mono">{user.conversionRate}</div>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-100 group-hover:bg-slate-900 group-hover:text-white text-slate-800 border border-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <span>Overall Information</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              ))}
            </div>

            {/* Overall Information Modal */}
            {selectedUser && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
                <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-slate-900 overflow-hidden">
                  
                  <button
                    type="button"
                    onClick={() => setSelectedUser(null)}
                    className="absolute top-5 right-5 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 border border-slate-200 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pb-4 border-b border-slate-200">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-2xl font-black text-slate-900 shadow-sm shrink-0">
                      {selectedUser.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h2 className="text-xl font-extrabold text-slate-900">{selectedUser.name}</h2>
                        <span className="px-2.5 py-0.5 rounded-full bg-tech_orange/10 text-tech_orange font-bold text-xs font-mono border border-tech_orange/20">
                          {selectedUser.role}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5 text-tech_orange" />
                        <span className="font-semibold text-slate-700">{selectedUser.company}</span>
                        <span>•</span>
                        <span className="text-emerald-600 font-semibold font-mono">Status: {selectedUser.status}</span>
                      </div>
                    </div>
                  </div>

                  {/* Direct Contact Actions */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <a
                      href={`https://wa.me/${selectedUser.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4 text-emerald-600" />
                      <span>WhatsApp Direct</span>
                    </a>

                    <a
                      href={`tel:${selectedUser.phone}`}
                      className="p-3 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <Phone className="w-4 h-4 text-sky-600" />
                      <span>Direct Phone Call</span>
                    </a>

                    <a
                      href={`mailto:${selectedUser.email}`}
                      className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <Mail className="w-4 h-4 text-tech_orange" />
                      <span>Send Work Email</span>
                    </a>
                  </div>

                  {/* Telemetry Overview */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-[10px] text-slate-400">Total Leads</div>
                      <div className="text-lg font-black text-slate-900 font-mono mt-0.5">{selectedUser.leadsHandled}</div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-[10px] text-slate-400">Conversion Rate</div>
                      <div className="text-lg font-black text-emerald-600 font-mono mt-0.5">{selectedUser.conversionRate}</div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-[10px] text-slate-400">Active Pipeline</div>
                      <div className="text-lg font-black text-tech_orange font-mono mt-0.5">{selectedUser.activeDeals}</div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-[10px] text-slate-400">Member Since</div>
                      <div className="text-xs font-bold text-slate-700 font-mono mt-1">{selectedUser.joined}</div>
                    </div>
                  </div>

                  {/* Role Bio */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
                    <div className="font-bold text-slate-900 uppercase text-[10px] font-mono tracking-wider">
                      Role Overview & Responsibilities
                    </div>
                    <p className="leading-relaxed">{selectedUser.bio}</p>
                  </div>

                  {/* Activity Log */}
                  <div className="space-y-2">
                    <div className="font-bold text-slate-900 uppercase text-[10px] font-mono tracking-wider">
                      Recent Activity Audit Trail
                    </div>
                    <div className="space-y-1.5 text-xs">
                      {selectedUser.recentActivities.map((act, i) => (
                        <div key={i} className="flex items-center gap-2 text-slate-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{act}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setSelectedUser(null)}
                      className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
                    >
                      Close Overview
                    </button>
                  </div>

                </div>
              </div>
            )}

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: LEADS & PIPELINE                                                   */}
        {/* ========================================================================= */}
        {activeTab === 'leads' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div>
                <h2 className="text-base font-bold text-slate-900">WhatsApp Lead Pipeline</h2>
                <p className="text-xs text-slate-500 mt-0.5">Automated stage-by-stage progression from WhatsApp inquiry to won enrollment.</p>
              </div>
              <button className="px-4 py-2 rounded-xl bg-tech_orange hover:bg-tech_orange-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm">
                <Plus className="w-4 h-4" />
                <span>Add Lead</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { stage: 'Inquiries', count: 24, border: 'border-t-sky-500', items: [
                  { name: 'Dr. Srinivas Rao', budget: '₹1,50,000', score: '94%' },
                  { name: 'Arjun Mehra', budget: '₹85,000', score: '82%' }
                ]},
                { stage: 'AI Qualified', count: 18, border: 'border-t-amber-500', items: [
                  { name: 'Priya Kulkarni', budget: '₹2,20,000', score: '98%' },
                  { name: 'Farhan Akhtar', budget: '₹60,000', score: '76%' }
                ]},
                { stage: 'Demo Confirmed', count: 9, border: 'border-t-purple-500', items: [
                  { name: 'Sanjay Dutt', budget: '₹5,00,000', score: '96%' }
                ]},
                { stage: 'Won / Enrolled', count: 42, border: 'border-t-emerald-500', items: [
                  { name: 'Deepa Patel', budget: '₹3,40,000', score: '100%' },
                  { name: 'Karthik Raja', budget: '₹1,80,000', score: '100%' }
                ]},
              ].map((col, idx) => (
                <div key={idx} className={`p-5 rounded-2xl bg-white border-t-4 ${col.border} border-x border-b border-slate-200 shadow-sm space-y-3.5`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900">{col.stage}</span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-mono text-slate-700 font-bold border border-slate-200">{col.count}</span>
                  </div>
                  <div className="space-y-2.5">
                    {col.items.map((lead, i) => (
                      <div key={i} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-tech_orange/50 transition-all cursor-pointer">
                        <div className="text-xs font-bold text-slate-900">{lead.name}</div>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200 text-[10px]">
                          <span className="text-emerald-600 font-bold font-mono">{lead.budget}</span>
                          <span className="px-1.5 py-0.2 rounded bg-sky-50 text-sky-700 font-mono border border-sky-200">Score {lead.score}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: EMPLOYEES                                                          */}
        {/* ========================================================================= */}
        {activeTab === 'employees' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <h2 className="text-base font-bold text-slate-900">Employee Team Directory</h2>
              <p className="text-xs text-slate-500 mt-0.5">Departments, attendance, and direct operational responsibilities.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { name: 'Kavita Menon', role: 'Chief Growth Officer', dept: 'Marketing & Inbound', quota: '98% SLA' },
                { name: 'Rohan Deshmukh', role: 'AI Telephony Specialist', dept: 'AI Voice Ops', quota: '1,420 calls' },
                { name: 'Sneha Agarwal', role: 'WhatsApp Automation Engineer', dept: 'Technical Support', quota: '100% SLA' },
              ].map((emp, i) => (
                <div key={i} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white font-black flex items-center justify-center text-sm">
                      {emp.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">{emp.name}</div>
                      <div className="text-xs text-tech_orange font-medium">{emp.role}</div>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1 text-slate-600 font-mono">
                    <div>Department: <span className="text-slate-900 font-sans font-semibold">{emp.dept}</span></div>
                    <div>Performance: <span className="text-emerald-600 font-bold">{emp.quota}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: AI CALLING                                                         */}
        {/* ========================================================================= */}
        {activeTab === 'ai-calling' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div>
                <h2 className="text-base font-bold text-slate-900">Autonomous AI Voice Telephony</h2>
                <p className="text-xs text-slate-500 mt-0.5">Conversational neural voice bots dialing leads, booking demos, and logging sentiment.</p>
              </div>
              <button className="px-5 py-2.5 rounded-xl bg-tech_orange hover:bg-tech_orange-600 text-white font-bold text-xs flex items-center gap-2 shadow-sm">
                <PhoneForwarded className="w-4 h-4" />
                <span>Launch Batch Call</span>
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-900">Live Call Telemetry Stream</h3>
              {[
                { target: 'Venkatesh Babu', phone: '+91 99887 66554', duration: '3m 42s', sentiment: 'Positive (98%)', outcome: 'Demo Confirmed for Friday' },
                { target: 'Geeta Nair', phone: '+91 98776 55443', duration: '1m 15s', sentiment: 'Interested (84%)', outcome: 'Brochure sent on WhatsApp' },
                { target: 'Mohit Chawla', phone: '+91 97665 44332', duration: '4m 02s', sentiment: 'Follow-Up Needed', outcome: 'Callback scheduled tomorrow' },
              ].map((call, i) => (
                <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="font-bold text-slate-900 flex items-center gap-2">
                      <span>{call.target}</span>
                      <span className="font-mono text-slate-400 text-[11px]">{call.phone}</span>
                    </div>
                    <p className="text-slate-600 mt-1">Outcome: <span className="text-emerald-600 font-semibold">{call.outcome}</span></p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-slate-500">{call.duration}</span>
                    <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-[10px]">
                      {call.sentiment}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: WHATSAPP                                                           */}
        {/* ========================================================================= */}
        {activeTab === 'whatsapp' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <h2 className="text-base font-bold text-slate-900">Enterprise WhatsApp Business Console</h2>
              <p className="text-xs text-slate-500 mt-0.5">Verified Meta Cloud API gateway with 100K messages/day broadcast throughput.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-white border border-emerald-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-700">Gateway Status</span>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] font-mono border border-emerald-200">Live • Connected</span>
                </div>
                <div className="text-xl font-black text-slate-900 font-mono">+91 98765 43210</div>
                <p className="text-xs text-slate-600">Verified Account: <span className="text-slate-900 font-bold">{currentUser?.company_name || 'AOTMS'}</span></p>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Daily Limit</span>
                  <span className="font-mono text-emerald-700 font-bold">100,000 / Day</span>
                </div>
              </div>

              <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
                <h3 className="text-sm font-bold text-slate-900">Broadcast Campaign Template Sender</h3>
                <input 
                  type="text" 
                  placeholder="Campaign Title (e.g. Masterclass New Cohort Announcement)" 
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-sky-500"
                />
                <textarea 
                  rows={3} 
                  placeholder="Template Message Body with dynamic tags {{name}}, {{company}}..." 
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-sky-500"
                />
                <button className="px-5 py-2.5 rounded-xl bg-tech_orange hover:bg-tech_orange-600 text-white font-bold text-xs flex items-center gap-2 shadow-sm">
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Broadcast to 3,184 Contacts</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: TODO LIST                                                          */}
        {/* ========================================================================= */}
        {activeTab === 'todos' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div>
                <h2 className="text-base font-bold text-slate-900">CRM Team Todo & Action Items</h2>
                <p className="text-xs text-slate-500 mt-0.5">Scheduled callbacks, invoice checks, and verification tasks.</p>
              </div>
              <button className="px-4 py-2.5 rounded-xl bg-tech_orange text-white font-bold text-xs flex items-center gap-2 shadow-sm">
                <Plus className="w-4 h-4" />
                <span>New Task</span>
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
              {[
                { task: 'Follow up with Dr. Srinivas Rao on corporate invoice and tax clearance', due: 'Today, 5:00 PM', priority: 'High', done: false },
                { task: 'Verify Neon PostgreSQL live database schema integrity and connection pool', due: 'Today, 8:00 PM', priority: 'Critical', done: true },
                { task: 'Review AI Calling conversational prompt for upcoming SIP campaign', due: 'Tomorrow, 11:00 AM', priority: 'Medium', done: false },
                { task: 'Send WhatsApp broadcast to newly enrolled students for orientation', due: 'March 5', priority: 'Normal', done: false },
              ].map((t, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" defaultChecked={t.done} className="w-4 h-4 rounded text-tech_orange bg-white border-slate-300 focus:ring-tech_orange cursor-pointer" />
                    <span className={t.done ? 'line-through text-slate-400 font-medium' : 'text-slate-900 font-medium'}>{t.task}</span>
                  </div>
                  <div className="flex items-center gap-2.5 shrink-0">
                    <span className="text-[11px] font-mono text-slate-400">{t.due}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      t.priority === 'Critical' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                      t.priority === 'High' ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                      'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}>
                      {t.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 7: INSTAGRAM                                                          */}
        {/* ========================================================================= */}
        {activeTab === 'instagram' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <h2 className="text-base font-bold text-slate-900">Instagram Direct Message Automation</h2>
              <p className="text-xs text-slate-500 mt-0.5">Keyword triggers, story mention lead capture, and DM funnels.</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Active Triggers</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="font-bold text-slate-900 flex items-center justify-between">
                    <span>Keyword: "CRM" or "AOTMS"</span>
                    <span className="text-emerald-700 font-mono text-[10px]">Active</span>
                  </div>
                  <p className="text-slate-500 text-[11px]">Sends WhatsApp demo registration link directly to the user's DM inbox in under 3 seconds.</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="font-bold text-slate-900 flex items-center justify-between">
                    <span>Story Mention Trigger</span>
                    <span className="text-emerald-700 font-mono text-[10px]">Active</span>
                  </div>
                  <p className="text-slate-500 text-[11px]">Acknowledges story tags and provides exclusive discount vouchers for AOTMS masterclasses.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 8: PAY_SIP                                                            */}
        {/* ========================================================================= */}
        {activeTab === 'pay-sip' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div>
                <h2 className="text-base font-bold text-slate-900">Pay_SIP Recurring Invoices & Mandate Collections</h2>
                <p className="text-xs text-slate-500 mt-0.5">Automated recurring payment links, UPI autopay mandates, and monthly SIP collections.</p>
              </div>
              <button className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center gap-2 shadow-sm">
                <Plus className="w-4 h-4" />
                <span>New SIP Mandate</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <span className="text-xs text-slate-500 font-semibold">Active Recurring Mandates</span>
                <div className="text-3xl font-black text-slate-900 mt-2 font-mono">164 Clients</div>
                <div className="text-[11px] text-emerald-700 mt-1 font-mono">99.1% On-time debit</div>
              </div>
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <span className="text-xs text-slate-500 font-semibold">Total Collections (This Month)</span>
                <div className="text-3xl font-black text-slate-900 mt-2 font-mono">₹18,42,500</div>
                <div className="text-[11px] text-tech_orange mt-1 font-mono">Razorpay & Cashfree UPI</div>
              </div>
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <span className="text-xs text-slate-500 font-semibold">GST Invoices Dispatched</span>
                <div className="text-3xl font-black text-slate-900 mt-2 font-mono">592 Invoices</div>
                <div className="text-[11px] text-sky-700 mt-1 font-mono">WhatsApp PDF Delivery</div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 9: SETTINGS                                                           */}
        {/* ========================================================================= */}
        {activeTab === 'settings' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <h2 className="text-base font-bold text-slate-900">Enterprise Workspace Settings</h2>
              <p className="text-xs text-slate-500 mt-0.5">Environment configurations, database endpoints, and JWT session rules.</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="font-bold text-slate-900 text-sm">Database Engine</div>
                <div className="font-mono text-emerald-700 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Neon Serverless PostgreSQL (US East AWS Pooler) • Connected & Operational</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="font-bold text-slate-900 text-sm">Authentication Engine</div>
                <div className="font-mono text-tech_orange flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-tech_orange" />
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
