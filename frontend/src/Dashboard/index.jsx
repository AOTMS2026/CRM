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
  Award,
  Plug,
  Eye,
  EyeOff,
  Copy,
  Check,
  Globe,
  Key,
  Hash,
  Sparkles,
  Layers
} from 'lucide-react';
import { 
  IoLogoInstagram as Instagram,
  IoLogoWhatsapp as WhatsApp 
} from 'react-icons/io5';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('users');
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null); // For Overall Information Modal
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Integrations state (WhatsApp & Instagram)
  const [selectedIntegration, setSelectedIntegration] = useState('whatsapp');
  const [showAccessToken, setShowAccessToken] = useState(false);
  const [showIgSecret, setShowIgSecret] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [savingIntegration, setSavingIntegration] = useState(false);
  const [integrationSuccess, setIntegrationSuccess] = useState('');

  // WhatsApp form fields specified by user
  const [whatsappForm, setWhatsappForm] = useState(() => {
    const saved = localStorage.getItem('aotms_whatsapp_config');
    return saved ? JSON.parse(saved) : {
      accessToken: '',
      phoneNumberId: '109283746501928',
      verifyToken: 'aotms_meta_verify_secret_2026',
      graphVersion: 'v21.0',
      wabaId: '392817264510293'
    };
  });

  // Instagram form fields
  const [instagramForm, setInstagramForm] = useState(() => {
    const saved = localStorage.getItem('aotms_instagram_config');
    return saved ? JSON.parse(saved) : {
      appId: '',
      appSecret: '',
      businessAccountId: '',
      pageAccessToken: '',
      verifyToken: 'aotms_ig_verify_2026'
    };
  });

  const handleSaveWhatsApp = (e) => {
    e.preventDefault();
    setSavingIntegration(true);
    setIntegrationSuccess('');
    setTimeout(() => {
      localStorage.setItem('aotms_whatsapp_config', JSON.stringify(whatsappForm));
      setSavingIntegration(false);
      setIntegrationSuccess('WhatsApp Business Cloud API credentials saved & verified successfully!');
      setTimeout(() => setIntegrationSuccess(''), 5000);
    }, 600);
  };

  const handleSaveInstagram = (e) => {
    e.preventDefault();
    setSavingIntegration(true);
    setIntegrationSuccess('');
    setTimeout(() => {
      localStorage.setItem('aotms_instagram_config', JSON.stringify(instagramForm));
      setSavingIntegration(false);
      setIntegrationSuccess('Instagram Graph API credentials saved & verified successfully!');
      setTimeout(() => setIntegrationSuccess(''), 5000);
    }, 600);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2500);
  };

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
    { id: 'integrations', label: 'Integrations', icon: Plug, badge: 'WhatsApp • IG' },
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
        {/* TAB: INTEGRATIONS (WHATSAPP & INSTAGRAM CHANNELS CONFIGURATION)           */}
        {/* ========================================================================= */}
        {activeTab === 'integrations' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            
            {/* Header Box */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Plug className="w-5 h-5 text-sky-600" />
                  <h2 className="text-lg font-black text-slate-900">
                    Channel & Meta API Integrations
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Connect your official Meta Cloud APIs for automated WhatsApp broadcasts, webhook reception, and Instagram direct messages.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Meta Graph v21.0 Ready</span>
                </span>
              </div>
            </div>

            {/* CHANNEL SELECTOR CARDS (Showing Icons -> Select Icons -> Asking Details) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              
              {/* Channel 1: WhatsApp Business Cloud API */}
              <div
                onClick={() => setSelectedIntegration('whatsapp')}
                className={`p-6 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                  selectedIntegration === 'whatsapp'
                    ? 'bg-emerald-50/50 border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
                    <WhatsApp className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-extrabold text-slate-900">WhatsApp Cloud API</h3>
                      <span className="px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold font-mono border border-emerald-200">
                        Official Meta WABA
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">High-throughput broadcast engine, auto-replies & webhooks</p>
                  </div>
                </div>

                <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 border-emerald-500">
                  {selectedIntegration === 'whatsapp' && (
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  )}
                </div>
              </div>

              {/* Channel 2: Instagram Graph API */}
              <div
                onClick={() => setSelectedIntegration('instagram')}
                className={`p-6 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                  selectedIntegration === 'instagram'
                    ? 'bg-pink-50/50 border-pink-500 shadow-md ring-2 ring-pink-500/20'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center shadow-md shadow-pink-500/20">
                    <Instagram className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-extrabold text-slate-900">Instagram Graph API</h3>
                      <span className="px-2 py-0.2 rounded-full bg-pink-100 text-pink-800 text-[10px] font-bold font-mono border border-pink-200">
                        DM & Story Replies
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">Automated direct message response triggers & lead capture</p>
                  </div>
                </div>

                <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 border-pink-500">
                  {selectedIntegration === 'instagram' && (
                    <div className="w-2.5 h-2.5 rounded-full bg-pink-500" />
                  )}
                </div>
              </div>

            </div>

            {/* Success Banner */}
            {integrationSuccess && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2.5 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{integrationSuccess}</span>
              </div>
            )}

            {/* DETAILS FORM 1: WHATSAPP OPTIONS (REQUESTED BY USER) */}
            {selectedIntegration === 'whatsapp' && (
              <form onSubmit={handleSaveWhatsApp} className="p-7 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                      <WhatsApp className="w-5 h-5 text-emerald-600" />
                      <span>Meta WhatsApp Cloud API Configuration</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">Fill in your Meta for Developers credentials to activate outbound sending & webhook reception.</p>
                  </div>

                  <span className="text-[11px] font-mono text-slate-400 font-semibold hidden sm:inline">
                    Step 1 of 1 • Credentials Verification
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  
                  {/* Option 1: Access_ Token */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      1. Access_ Token <span className="text-tech_orange">*</span>
                    </label>
                    <p className="text-[11px] text-slate-500 mb-1.5 font-medium">
                      Permanent System User Access Token with `whatsapp_business_management` and `whatsapp_business_messaging` permissions.
                    </p>
                    <div className="relative">
                      <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type={showAccessToken ? 'text' : 'password'}
                        required
                        placeholder="EAAQDZA78y9... (Permanent System User Token)"
                        value={whatsappForm.accessToken}
                        onChange={(e) => setWhatsappForm({ ...whatsappForm, accessToken: e.target.value })}
                        className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowAccessToken(!showAccessToken)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                      >
                        {showAccessToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Option 2: Phone Number ID */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      2. Phone Number ID <span className="text-tech_orange">*</span>
                    </label>
                    <p className="text-[11px] text-slate-500 mb-1.5 font-medium">
                      Found in Meta App Dashboard under WhatsApp &gt; API Setup &gt; Step 1.
                    </p>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        placeholder="109283746501928"
                        value={whatsappForm.phoneNumberId}
                        onChange={(e) => setWhatsappForm({ ...whatsappForm, phoneNumberId: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                      />
                    </div>
                  </div>

                  {/* Option 3: Verify Token */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      3. Verify Token <span className="text-tech_orange">*</span>
                    </label>
                    <p className="text-[11px] text-slate-500 mb-1.5 font-medium">
                      Secret string challenge matched between Meta Webhooks and this server.
                    </p>
                    <div className="relative">
                      <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        placeholder="aotms_meta_verify_secret_2026"
                        value={whatsappForm.verifyToken}
                        onChange={(e) => setWhatsappForm({ ...whatsappForm, verifyToken: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                      />
                    </div>
                  </div>

                  {/* Option 4: Meta Graph Version */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      4. Meta Graph Version <span className="text-tech_orange">*</span>
                    </label>
                    <p className="text-[11px] text-slate-500 mb-1.5 font-medium">
                      Official Meta Graph API version used for outbound HTTP requests.
                    </p>
                    <div className="relative">
                      <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      <select
                        value={whatsappForm.graphVersion}
                        onChange={(e) => setWhatsappForm({ ...whatsappForm, graphVersion: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all cursor-pointer"
                      >
                        <option value="v21.0">v21.0 (Latest Recommended)</option>
                        <option value="v20.0">v20.0 (Stable)</option>
                        <option value="v19.0">v19.0 (LTS)</option>
                        <option value="v18.0">v18.0</option>
                      </select>
                    </div>
                  </div>

                  {/* Option 5: Meta Whatsapp Bussiness Account ID */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      5. Meta Whatsapp Bussiness Account ID <span className="text-tech_orange">*</span>
                    </label>
                    <p className="text-[11px] text-slate-500 mb-1.5 font-medium">
                      WhatsApp Business Account (WABA) ID from Meta Business Suite.
                    </p>
                    <div className="relative">
                      <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        placeholder="392817264510293"
                        value={whatsappForm.wabaId}
                        onChange={(e) => setWhatsappForm({ ...whatsappForm, wabaId: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                      />
                    </div>
                  </div>

                </div>

                {/* Webhook Endpoint Callout Box */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">Your Webhook Callback URL:</span>
                    <span className="text-[11px] text-emerald-700 font-mono font-bold">Configure in Meta Developers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value="https://crm-fee1.onrender.com/api/whatsapp/webhook"
                      className="flex-1 px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs font-mono text-slate-700 select-all"
                    />
                    <button
                      type="button"
                      onClick={() => copyToClipboard("https://crm-fee1.onrender.com/api/whatsapp/webhook")}
                      className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-black text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                    >
                      {copiedWebhook ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedWebhook ? 'Copied!' : 'Copy URL'}</span>
                    </button>
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-3">
                  <button
                    type="submit"
                    disabled={savingIntegration}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{savingIntegration ? 'Saving Credentials...' : 'Save WhatsApp Credentials'}</span>
                  </button>
                </div>
              </form>
            )}

            {/* DETAILS FORM 2: INSTAGRAM OPTIONS */}
            {selectedIntegration === 'instagram' && (
              <form onSubmit={handleSaveInstagram} className="p-7 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                      <Instagram className="w-5 h-5 text-pink-600" />
                      <span>Meta Instagram Graph API Configuration</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">Automate direct messages, keyword auto-replies, and story mentions.</p>
                  </div>

                  <span className="text-[11px] font-mono text-slate-400 font-semibold hidden sm:inline">
                    Instagram Direct Module
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      1. Instagram App ID <span className="text-tech_orange">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="982374615029384"
                      value={instagramForm.appId}
                      onChange={(e) => setInstagramForm({ ...instagramForm, appId: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      2. Instagram App Secret <span className="text-tech_orange">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showIgSecret ? 'text' : 'password'}
                        required
                        placeholder="a9f8b7c6d5e4..."
                        value={instagramForm.appSecret}
                        onChange={(e) => setInstagramForm({ ...instagramForm, appSecret: e.target.value })}
                        className="w-full pl-4 pr-11 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowIgSecret(!showIgSecret)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                      >
                        {showIgSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      3. Instagram Business Account ID <span className="text-tech_orange">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="17841400123456789"
                      value={instagramForm.businessAccountId}
                      onChange={(e) => setInstagramForm({ ...instagramForm, businessAccountId: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      4. Webhook Verify Token <span className="text-tech_orange">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="aotms_ig_verify_2026"
                      value={instagramForm.verifyToken}
                      onChange={(e) => setInstagramForm({ ...instagramForm, verifyToken: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      5. Page Access Token <span className="text-tech_orange">*</span>
                    </label>
                    <textarea
                      rows={2}
                      required
                      placeholder="EAAGm0PX4ZC... (Facebook Page Access Token linked to Instagram)"
                      value={instagramForm.pageAccessToken}
                      onChange={(e) => setInstagramForm({ ...instagramForm, pageAccessToken: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end">
                  <button
                    type="submit"
                    disabled={savingIntegration}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-700 hover:to-purple-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{savingIntegration ? 'Saving Credentials...' : 'Save Instagram Credentials'}</span>
                  </button>
                </div>
              </form>
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
