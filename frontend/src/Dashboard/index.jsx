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
  Search
} from 'lucide-react';
import { IoLogoInstagram as Instagram } from 'react-icons/io5';

export default function DashboardPage() {
  // Default tab is 'users' (Overview permanently removed)
  const [activeTab, setActiveTab] = useState('users');
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
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

  // Sample organizational users stored in Neon PostgreSQL
  const teamUsers = [
    {
      id: 'usr_001',
      name: currentUser?.name || 'Administrator',
      email: currentUser?.email || 'admin@aotms.com',
      phone: currentUser?.phone || '+91 98765 43210',
      company: currentUser?.company_name || 'AOTMS',
      role: 'Enterprise Admin',
      status: 'Active',
      leadsHandled: 420,
      conversionRate: '88.4%',
      activeDeals: '₹34.5L',
      joined: 'September 2024',
      avatarBg: 'bg-[#212529] text-white',
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
      avatarBg: 'bg-tech_blue text-white',
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
      avatarBg: 'bg-tech_orange text-white',
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
      avatarBg: 'bg-[#495057] text-white',
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] text-[#212529] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-tech_orange border-t-transparent animate-spin" />
          <p className="text-xs font-mono text-[#6c757d]">Loading Workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#212529] flex flex-col font-sans selection:bg-tech_orange selection:text-white">
      
      {/* Top Navbar with Clean White & Platinum Palette */}
      <DashboardNavbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        currentUser={currentUser} 
        onLogout={handleLogout}
      />

      {/* Main Workspace Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* ========================================================================= */}
        {/* TAB: USERS (CARD STYLE WITH OVERALL INFORMATION MODAL) */}
        {/* ========================================================================= */}
        {activeTab === 'users' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Header & Actions Bar in Clean White Theme */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-[#dee2e6] shadow-sm">
              <div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-tech_orange" />
                  <h1 className="text-xl font-extrabold text-[#212529] tracking-tight">
                    Users Directory
                  </h1>
                </div>
                <p className="text-xs text-[#6c757d] mt-1">
                  Click on any user card to view overall information, direct contact links, and performance metrics.
                </p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6c757d]" />
                  <input
                    type="text"
                    placeholder="Search name, role, email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#f8f9fa] border border-[#ced4da] text-xs text-[#212529] placeholder-[#6c757d] focus:outline-none focus:border-[#212529] focus:bg-white focus:ring-1 focus:ring-[#212529] transition-all"
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

            {/* CARD STYLE USER GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className="p-6 rounded-2xl bg-white hover:bg-white border border-[#dee2e6] hover:border-[#adb5bd] shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4 group"
                >
                  {/* Top: Avatar, Name, Status & Role */}
                  <div className="space-y-3.5">
                    <div className="flex items-start justify-between">
                      <div className="relative w-12 h-12 rounded-2xl bg-[#f8f9fa] border border-[#dee2e6] flex items-center justify-center text-base font-black text-[#212529] shadow-sm group-hover:scale-105 transition-transform">
                        {user.name.charAt(0)}
                        <span className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                          user.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'
                        }`} />
                      </div>

                      <span className="px-2.5 py-1 rounded-full bg-[#e9ecef] text-[#212529] font-bold text-[10px] font-mono border border-[#dee2e6]">
                        {user.role}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-[#212529] group-hover:text-tech_orange transition-colors">
                        {user.name}
                      </h3>
                      <div className="flex items-center gap-1 text-[#6c757d] text-xs mt-0.5 font-medium truncate">
                        <Building2 className="w-3 h-3 text-[#6c757d] shrink-0" />
                        <span className="truncate">{user.company}</span>
                      </div>
                    </div>

                    <div className="space-y-1 text-xs font-mono pt-1 text-[#495057]">
                      <div className="flex items-center gap-2 truncate">
                        <Mail className="w-3.5 h-3.5 text-tech_blue shrink-0" />
                        <span className="truncate text-[#6c757d]">{user.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-emerald-600 font-semibold">
                        <Phone className="w-3.5 h-3.5 shrink-0" />
                        <span>{user.phone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Middle: Performance Metric Badges */}
                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#e9ecef] text-xs">
                    <div className="p-2.5 rounded-xl bg-[#f8f9fa] border border-[#dee2e6]">
                      <div className="text-[10px] text-[#6c757d] font-medium">Leads Handled</div>
                      <div className="text-sm font-black text-[#212529] font-mono">{user.leadsHandled}</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#f8f9fa] border border-[#dee2e6]">
                      <div className="text-[10px] text-[#6c757d] font-medium">Conversion</div>
                      <div className="text-sm font-black text-emerald-600 font-mono">{user.conversionRate}</div>
                    </div>
                  </div>

                  {/* Bottom Action Hint */}
                  <button
                    type="button"
                    className="w-full py-2 px-3 rounded-xl bg-[#f8f9fa] group-hover:bg-[#212529] group-hover:text-white text-[#212529] border border-[#dee2e6] font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <span>Overall Information</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              ))}
            </div>

            {/* OVERALL INFORMATION MODAL (Clean White & Platinum Theme) */}
            {selectedUser && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="relative w-full max-w-2xl bg-white border border-[#dee2e6] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-[#212529] overflow-hidden">
                  
                  {/* Close Modal Button */}
                  <button
                    type="button"
                    onClick={() => setSelectedUser(null)}
                    className="absolute top-5 right-5 p-2 rounded-xl bg-[#f8f9fa] hover:bg-[#e9ecef] text-[#495057] hover:text-[#212529] border border-[#dee2e6] transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  {/* User Profile Header */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pb-4 border-b border-[#e9ecef]">
                    <div className="w-16 h-16 rounded-2xl bg-[#f8f9fa] border border-[#dee2e6] flex items-center justify-center text-2xl font-black text-[#212529] shadow-sm shrink-0">
                      {selectedUser.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h2 className="text-xl font-extrabold text-[#212529]">{selectedUser.name}</h2>
                        <span className="px-2.5 py-0.5 rounded-full bg-tech_orange/10 text-tech_orange font-bold text-xs font-mono border border-tech_orange/20">
                          {selectedUser.role}
                        </span>
                      </div>
                      <div className="text-xs text-[#6c757d] mt-1 flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5 text-tech_orange" />
                        <span className="font-semibold text-[#495057]">{selectedUser.company}</span>
                        <span>•</span>
                        <span className="text-emerald-600 font-semibold font-mono">Status: {selectedUser.status}</span>
                      </div>
                    </div>
                  </div>

                  {/* Direct Contact & Action Buttons */}
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
                      className="p-3 rounded-xl bg-[#f8f9fa] hover:bg-[#e9ecef] border border-[#dee2e6] text-[#212529] font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <Mail className="w-4 h-4 text-tech_orange" />
                      <span>Send Work Email</span>
                    </a>
                  </div>

                  {/* Overall Performance & Telemetry Overview */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-xl bg-[#f8f9fa] border border-[#dee2e6]">
                      <div className="text-[10px] text-[#6c757d] font-medium">Total Leads</div>
                      <div className="text-lg font-black text-[#212529] font-mono mt-0.5">{selectedUser.leadsHandled}</div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#f8f9fa] border border-[#dee2e6]">
                      <div className="text-[10px] text-[#6c757d] font-medium">Conversion Rate</div>
                      <div className="text-lg font-black text-emerald-600 font-mono mt-0.5">{selectedUser.conversionRate}</div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#f8f9fa] border border-[#dee2e6]">
                      <div className="text-[10px] text-[#6c757d] font-medium">Active Pipeline</div>
                      <div className="text-lg font-black text-tech_orange font-mono mt-0.5">{selectedUser.activeDeals}</div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#f8f9fa] border border-[#dee2e6]">
                      <div className="text-[10px] text-[#6c757d] font-medium">Member Since</div>
                      <div className="text-xs font-bold text-[#495057] font-mono mt-1">{selectedUser.joined}</div>
                    </div>
                  </div>

                  {/* Bio & Responsibilities */}
                  <div className="p-4 rounded-xl bg-[#f8f9fa] border border-[#dee2e6] text-xs text-[#495057] space-y-1">
                    <div className="font-bold text-[#212529] uppercase text-[10px] font-mono tracking-wider">
                      Role Overview & Responsibilities
                    </div>
                    <p className="leading-relaxed">{selectedUser.bio}</p>
                  </div>

                  {/* Recent Activity Audit Trail */}
                  <div className="space-y-2">
                    <div className="font-bold text-[#212529] uppercase text-[10px] font-mono tracking-wider">
                      Recent Activity Audit Trail
                    </div>
                    <div className="space-y-1.5 text-xs">
                      {selectedUser.recentActivities.map((act, i) => (
                        <div key={i} className="flex items-center gap-2 text-[#495057]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{act}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Close Button */}
                  <div className="pt-3 border-t border-[#dee2e6] flex justify-end">
                    <button
                      type="button"
                      onClick={() => setSelectedUser(null)}
                      className="px-5 py-2.5 rounded-xl bg-[#212529] hover:bg-[#343a40] text-white font-bold text-xs transition-colors cursor-pointer"
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
        {/* TAB: LEADS PIPELINE */}
        {/* ========================================================================= */}
        {activeTab === 'leads' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-[#dee2e6] shadow-sm">
              <div>
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-tech_orange" />
                  <h1 className="text-xl font-extrabold text-[#212529]">WhatsApp Lead Pipeline</h1>
                </div>
                <p className="text-xs text-[#6c757d] mt-1">Lead progression stages, automatic qualification, and conversion tracking.</p>
              </div>
              <button className="px-4 py-2 rounded-xl bg-tech_orange hover:bg-tech_orange-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm">
                <Plus className="w-4 h-4" />
                <span>Add Lead</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { stage: 'Inquiries', count: 24, border: 'border-t-tech_blue', items: [
                  { name: 'Dr. Srinivas Rao', budget: '₹1,50,000', score: '94%' },
                  { name: 'Arjun Mehra', budget: '₹85,000', score: '82%' }
                ]},
                { stage: 'AI Qualified', count: 18, border: 'border-t-tech_orange', items: [
                  { name: 'Priya Kulkarni', budget: '₹2,20,000', score: '98%' },
                  { name: 'Farhan Akhtar', budget: '₹60,000', score: '76%' }
                ]},
                { stage: 'Demo Confirmed', count: 9, border: 'border-t-purple-600', items: [
                  { name: 'Sanjay Dutt', budget: '₹5,00,000', score: '96%' }
                ]},
                { stage: 'Won / Enrolled', count: 42, border: 'border-t-emerald-600', items: [
                  { name: 'Deepa Patel', budget: '₹3,40,000', score: '100%' },
                  { name: 'Karthik Raja', budget: '₹1,80,000', score: '100%' }
                ]},
              ].map((col, idx) => (
                <div key={idx} className={`p-5 rounded-2xl bg-white border-t-4 ${col.border} border-x border-b border-[#dee2e6] shadow-sm space-y-3.5`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-[#212529]">{col.stage}</span>
                    <span className="px-2 py-0.5 rounded-full bg-[#f8f9fa] text-[10px] font-mono text-tech_orange font-bold border border-[#dee2e6]">{col.count}</span>
                  </div>
                  <div className="space-y-2.5">
                    {col.items.map((lead, i) => (
                      <div key={i} className="p-3.5 rounded-xl bg-[#f8f9fa] border border-[#e9ecef] hover:border-tech_orange/60 transition-all cursor-pointer">
                        <div className="text-xs font-bold text-[#212529]">{lead.name}</div>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#e9ecef] text-[10px]">
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
        {/* TAB: EMPLOYEES */}
        {/* ========================================================================= */}
        {activeTab === 'employees' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="p-6 rounded-2xl bg-white border border-[#dee2e6] shadow-sm">
              <h1 className="text-xl font-extrabold text-[#212529] flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-tech_blue" />
                <span>Employee Team Directory</span>
              </h1>
              <p className="text-xs text-[#6c757d] mt-1">Departments, attendance, and direct operational responsibilities.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { name: 'Kavita Menon', role: 'Chief Growth Officer', dept: 'Marketing & Inbound', quota: '98% SLA' },
                { name: 'Rohan Deshmukh', role: 'AI Telephony Specialist', dept: 'AI Voice Ops', quota: '1,420 calls' },
                { name: 'Sneha Agarwal', role: 'WhatsApp Automation Engineer', dept: 'Technical Support', quota: '100% SLA' },
              ].map((emp, i) => (
                <div key={i} className="p-5 rounded-2xl bg-white border border-[#dee2e6] shadow-sm space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#212529] text-white font-black flex items-center justify-center text-sm">
                      {emp.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[#212529]">{emp.name}</div>
                      <div className="text-xs text-tech_orange font-medium">{emp.role}</div>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#f8f9fa] border border-[#e9ecef] text-xs space-y-1 text-[#495057] font-mono">
                    <div>Department: <span className="text-[#212529] font-sans font-semibold">{emp.dept}</span></div>
                    <div>Performance: <span className="text-emerald-600 font-bold">{emp.quota}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB: AI CALLING */}
        {activeTab === 'ai-calling' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-[#dee2e6] shadow-sm">
              <div>
                <h1 className="text-xl font-extrabold text-[#212529] flex items-center gap-2">
                  <PhoneCall className="w-5 h-5 text-tech_blue" />
                  <span>Autonomous AI Voice Telephony</span>
                </h1>
                <p className="text-xs text-[#6c757d] mt-1">Conversational neural voice bots dialing leads, booking demos, and logging sentiment.</p>
              </div>
              <button className="px-5 py-2.5 rounded-xl bg-tech_orange hover:bg-tech_orange-600 text-white font-bold text-xs flex items-center gap-2 shadow-sm">
                <PhoneForwarded className="w-4 h-4" />
                <span>Launch Batch Call</span>
              </button>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#dee2e6] shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-[#212529]">Live Call Telemetry Stream</h3>
              {[
                { target: 'Venkatesh Babu', phone: '+91 99887 66554', duration: '3m 42s', sentiment: 'Positive (98%)', outcome: 'Demo Confirmed for Friday' },
                { target: 'Geeta Nair', phone: '+91 98776 55443', duration: '1m 15s', sentiment: 'Interested (84%)', outcome: 'Brochure sent on WhatsApp' },
                { target: 'Mohit Chawla', phone: '+91 97665 44332', duration: '4m 02s', sentiment: 'Follow-Up Needed', outcome: 'Callback scheduled tomorrow' },
              ].map((call, i) => (
                <div key={i} className="p-4 rounded-xl bg-[#f8f9fa] border border-[#e9ecef] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="font-bold text-[#212529] flex items-center gap-2">
                      <span>{call.target}</span>
                      <span className="font-mono text-[#6c757d] text-[11px]">{call.phone}</span>
                    </div>
                    <p className="text-[#495057] mt-1">Outcome: <span className="text-emerald-600 font-semibold">{call.outcome}</span></p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[#6c757d]">{call.duration}</span>
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
        {/* TAB: WHATSAPP */}
        {activeTab === 'whatsapp' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="p-6 rounded-2xl bg-white border border-[#dee2e6] shadow-sm">
              <h1 className="text-xl font-extrabold text-[#212529] flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-600" />
                <span>Enterprise WhatsApp Business Console</span>
              </h1>
              <p className="text-xs text-[#6c757d] mt-1">Verified Meta Cloud API gateway with 100K messages/day broadcast throughput.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-white border border-emerald-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-700">Gateway Status</span>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] font-mono border border-emerald-200">Live • Connected</span>
                </div>
                <div className="text-xl font-black text-[#212529] font-mono">+91 98765 43210</div>
                <p className="text-xs text-[#495057]">Verified Account: <span className="text-[#212529] font-bold">{currentUser?.company_name || 'AOTMS'}</span></p>
                <div className="pt-3 border-t border-[#e9ecef] flex items-center justify-between text-xs">
                  <span className="text-[#6c757d]">Daily Limit</span>
                  <span className="font-mono text-emerald-700 font-bold">100,000 / Day</span>
                </div>
              </div>

              <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-[#dee2e6] shadow-sm space-y-3">
                <h3 className="text-sm font-bold text-[#212529]">Broadcast Campaign Template Sender</h3>
                <input 
                  type="text" 
                  placeholder="Campaign Title (e.g. Masterclass New Cohort Announcement)" 
                  className="w-full px-4 py-2.5 rounded-xl bg-[#f8f9fa] border border-[#ced4da] text-xs text-[#212529] placeholder-[#6c757d] focus:bg-white focus:outline-none focus:border-[#212529]"
                />
                <textarea 
                  rows={3} 
                  placeholder="Template Message Body with dynamic tags {{name}}, {{company}}..." 
                  className="w-full px-4 py-2.5 rounded-xl bg-[#f8f9fa] border border-[#ced4da] text-xs text-[#212529] placeholder-[#6c757d] focus:bg-white focus:outline-none focus:border-[#212529]"
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
        {/* TAB: TODO LIST */}
        {activeTab === 'todos' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-[#dee2e6] shadow-sm">
              <div>
                <h1 className="text-xl font-extrabold text-[#212529] flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-tech_orange" />
                  <span>CRM Team Todo & Action Items</span>
                </h1>
                <p className="text-xs text-[#6c757d] mt-1">Scheduled callbacks, invoice checks, and verification tasks.</p>
              </div>
              <button className="px-4 py-2.5 rounded-xl bg-tech_orange text-white font-bold text-xs flex items-center gap-2 shadow-sm">
                <Plus className="w-4 h-4" />
                <span>New Task</span>
              </button>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#dee2e6] shadow-sm space-y-3">
              {[
                { task: 'Follow up with Dr. Srinivas Rao on corporate invoice and tax clearance', due: 'Today, 5:00 PM', priority: 'High', done: false },
                { task: 'Verify Neon PostgreSQL live database schema integrity and connection pool', due: 'Today, 8:00 PM', priority: 'Critical', done: true },
                { task: 'Review AI Calling conversational prompt for upcoming SIP campaign', due: 'Tomorrow, 11:00 AM', priority: 'Medium', done: false },
                { task: 'Send WhatsApp broadcast to newly enrolled students for orientation', due: 'March 5', priority: 'Normal', done: false },
              ].map((t, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-[#f8f9fa] border border-[#e9ecef] flex items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" defaultChecked={t.done} className="w-4 h-4 rounded text-tech_orange bg-white border-[#ced4da] focus:ring-tech_orange cursor-pointer" />
                    <span className={t.done ? 'line-through text-[#6c757d] font-medium' : 'text-[#212529] font-medium'}>{t.task}</span>
                  </div>
                  <div className="flex items-center gap-2.5 shrink-0">
                    <span className="text-[11px] font-mono text-[#6c757d]">{t.due}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      t.priority === 'Critical' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                      t.priority === 'High' ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                      'bg-[#e9ecef] text-[#495057] border border-[#ced4da]'
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
        {/* TAB: INSTAGRAM */}
        {activeTab === 'instagram' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="p-6 rounded-2xl bg-white border border-[#dee2e6] shadow-sm">
              <h1 className="text-xl font-extrabold text-[#212529] flex items-center gap-2">
                <Instagram className="w-5 h-5 text-pink-600" />
                <span>Instagram Direct Message Automation</span>
              </h1>
              <p className="text-xs text-[#6c757d] mt-1">Keyword triggers, story mention lead capture, and DM funnels.</p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#dee2e6] shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-[#212529]">Active Triggers</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-[#f8f9fa] border border-[#dee2e6] space-y-2">
                  <div className="font-bold text-[#212529] flex items-center justify-between">
                    <span>Keyword: "CRM" or "AOTMS"</span>
                    <span className="text-emerald-700 font-mono text-[10px]">Active</span>
                  </div>
                  <p className="text-[#6c757d] text-[11px]">Sends WhatsApp demo registration link directly to the user's DM inbox in under 3 seconds.</p>
                </div>

                <div className="p-4 rounded-xl bg-[#f8f9fa] border border-[#dee2e6] space-y-2">
                  <div className="font-bold text-[#212529] flex items-center justify-between">
                    <span>Story Mention Trigger</span>
                    <span className="text-emerald-700 font-mono text-[10px]">Active</span>
                  </div>
                  <p className="text-[#6c757d] text-[11px]">Acknowledges story tags and provides exclusive discount vouchers for AOTMS masterclasses.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB: PAY_SIP */}
        {activeTab === 'pay-sip' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-[#dee2e6] shadow-sm">
              <div>
                <h1 className="text-xl font-extrabold text-[#212529] flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-purple-600" />
                  <span>Pay_SIP Recurring Invoices & Mandate Collections</span>
                </h1>
                <p className="text-xs text-[#6c757d] mt-1">Automated recurring payment links, UPI autopay mandates, and monthly SIP collections.</p>
              </div>
              <button className="px-5 py-2.5 rounded-xl bg-[#212529] text-white font-bold text-xs flex items-center gap-2 shadow-sm">
                <Plus className="w-4 h-4" />
                <span>New SIP Mandate</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-[#dee2e6] shadow-sm">
                <span className="text-xs text-[#6c757d] font-semibold">Active Recurring Mandates</span>
                <div className="text-3xl font-black text-[#212529] mt-2 font-mono">164 Clients</div>
                <div className="text-[11px] text-emerald-700 mt-1 font-mono">99.1% On-time debit</div>
              </div>
              <div className="p-5 rounded-2xl bg-white border border-[#dee2e6] shadow-sm">
                <span className="text-xs text-[#6c757d] font-semibold">Total Collections (This Month)</span>
                <div className="text-3xl font-black text-[#212529] mt-2 font-mono">₹18,42,500</div>
                <div className="text-[11px] text-tech_orange mt-1 font-mono">Razorpay & Cashfree UPI</div>
              </div>
              <div className="p-5 rounded-2xl bg-white border border-[#dee2e6] shadow-sm">
                <span className="text-xs text-[#6c757d] font-semibold">GST Invoices Dispatched</span>
                <div className="text-3xl font-black text-[#212529] mt-2 font-mono">592 Invoices</div>
                <div className="text-[11px] text-sky-700 mt-1 font-mono">WhatsApp PDF Delivery</div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="p-6 rounded-2xl bg-white border border-[#dee2e6] shadow-sm">
              <h1 className="text-xl font-extrabold text-[#212529] flex items-center gap-2">
                <Settings className="w-5 h-5 text-[#6c757d]" />
                <span>Enterprise Workspace Settings</span>
              </h1>
              <p className="text-xs text-[#6c757d] mt-1">Environment configurations, database endpoints, and JWT session rules.</p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#dee2e6] shadow-sm space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-[#f8f9fa] border border-[#dee2e6] space-y-2">
                <div className="font-bold text-[#212529] text-sm">Database Engine</div>
                <div className="font-mono text-emerald-700 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Neon Serverless PostgreSQL (US East AWS Pooler) • Connected & Operational</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#f8f9fa] border border-[#dee2e6] space-y-2">
                <div className="font-bold text-[#212529] text-sm">Authentication Engine</div>
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
