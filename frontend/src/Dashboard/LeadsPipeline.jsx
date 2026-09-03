import React, { useState, useEffect } from 'react';
import { 
  Target, 
  Plus, 
  Search, 
  RotateCw, 
  Trash2, 
  Edit3, 
  Phone, 
  Mail, 
  MapPin, 
  X, 
  CheckCircle2, 
  ShieldCheck, 
  UserCheck, 
  Send,
  AlertCircle,
  Eye,
  Activity,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { IoLogoWhatsapp as WhatsApp } from 'react-icons/io5';

export default function LeadsPipeline({ onOpenBlast }) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deduplicating, setDeduplicating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  
  // Modals & Toast State
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  // Form State (Cleaned per user specs: name, email, phone, address, status, read_rate)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    status: 'Inquiries',
    read_rate: '95%'
  });

  // Validation States
  const [phoneError, setPhoneError] = useState('');
  const [emailError, setEmailError] = useState('');

  const getApiBase = () => {
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      return 'http://localhost:5000';
    }
    return import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
  };

  const showToastMsg = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 5000);
  };

  const fetchLeads = async () => {
    setRefreshing(true);
    try {
      const res = await fetch(`${getApiBase()}/api/leads`);
      const data = await res.json();
      if (res.ok && data && data.success && Array.isArray(data.leads)) {
        setLeads(data.leads);
      } else {
        setLeads([]);
      }
    } catch (err) {
      console.error("Failed to fetch leads:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  // ---------------------------------------------------------------------------
  // STRICT 10-DIGIT MOBILE & EMAIL VALIDATION
  // ---------------------------------------------------------------------------
  const handlePhoneChange = (e) => {
    const val = e.target.value;
    setFormData(prev => ({ ...prev, phone: val }));

    const digitsOnly = val.replace(/\D/g, '');
    let clean10 = digitsOnly;
    if (digitsOnly.startsWith('91') && digitsOnly.length === 12) {
      clean10 = digitsOnly.slice(2);
    }

    if (!clean10) {
      setPhoneError('Mobile number is required.');
    } else if (clean10.length !== 10) {
      setPhoneError(`Mobile number must be exactly 10 digits (${clean10.length}/10 digits).`);
    } else if (!['6', '7', '8', '9'].includes(clean10[0])) {
      setPhoneError('Indian mobile numbers must start with 6, 7, 8, or 9.');
    } else {
      setPhoneError('');
    }
  };

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setFormData(prev => ({ ...prev, email: val }));

    if (val && val.trim()) {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(val.trim())) {
        setEmailError('Enter a valid email address (e.g., name@domain.com).');
      } else {
        setEmailError('');
      }
    } else {
      setEmailError('');
    }
  };

  // ---------------------------------------------------------------------------
  // DEDUPLICATION
  // ---------------------------------------------------------------------------
  const handleRemoveDuplicates = async () => {
    setDeduplicating(true);
    try {
      const res = await fetch(`${getApiBase()}/api/leads/deduplicate`, { method: 'POST' });
      const result = await res.json();
      if (res.ok && result.success) {
        showToastMsg(result.message || `Removed ${result.duplicates_removed} duplicate records!`, "success");
        await fetchLeads();
      } else {
        throw new Error(result.detail || "Failed to remove duplicates.");
      }
    } catch (err) {
      showToastMsg(err.message || "Error running deduplication.", "error");
    } finally {
      setDeduplicating(false);
    }
  };

  // ---------------------------------------------------------------------------
  // CREATE / EDIT SUBMIT
  // ---------------------------------------------------------------------------
  const handleSubmitLead = async (e) => {
    e.preventDefault();
    if (phoneError || emailError) {
      showToastMsg("Please fix validation errors before saving.", "error");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        status: formData.status || 'Inquiries',
        read_rate: formData.read_rate || '95%'
      };

      const url = editingLead ? `${getApiBase()}/api/leads/${editingLead.id}` : `${getApiBase()}/api/leads`;
      const method = editingLead ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await res.json();
      if (res.ok && (result.success || result.lead)) {
        showToastMsg(result.message || `Lead saved successfully!`, "success");
        setShowAddModal(false);
        setEditingLead(null);
        await fetchLeads();
      } else {
        throw new Error(result.detail || "Failed to save lead.");
      }
    } catch (err) {
      showToastMsg(err.message || "Error saving lead.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteLead = async (leadId, leadName) => {
    if (!window.confirm(`Are you sure you want to delete '${leadName}'?`)) return;

    try {
      const res = await fetch(`${getApiBase()}/api/leads/${leadId}`, { method: 'DELETE' });
      const result = await res.json();
      if (res.ok && result.success) {
        showToastMsg(`Lead '${leadName}' deleted successfully.`, "success");
        await fetchLeads();
      }
    } catch (err) {
      showToastMsg(err.message || "Error deleting lead.", "error");
    }
  };

  const handleEditClick = (lead) => {
    setEditingLead(lead);
    setFormData({
      name: lead.name || '',
      phone: lead.phone || '',
      email: lead.email || '',
      address: lead.address || '',
      status: lead.status || lead.pipeline_stage || 'Inquiries',
      read_rate: lead.read_rate || '95%'
    });
    setPhoneError('');
    setEmailError('');
    setShowAddModal(true);
  };

  const openNewLeadModal = () => {
    setEditingLead(null);
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
      status: 'Inquiries',
      read_rate: '95%'
    });
    setPhoneError('');
    setEmailError('');
    setShowAddModal(true);
  };

  const statusOptions = ['Inquiries', 'Demo', 'Enrolled'];

  const filteredLeads = leads.filter(lead => {
    const currStatus = (lead.status || lead.pipeline_stage || 'Inquiries').toUpperCase();
    const matchesStatus = selectedStatus === 'ALL' || currStatus === selectedStatus.toUpperCase();
    const matchesSearch = (lead.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (lead.phone || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (lead.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (lead.address || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedStatus]);

  const totalPages = Math.ceil(filteredLeads.length / ITEMS_PER_PAGE) || 1;
  const paginatedLeads = filteredLeads.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      
      {/* Toast Alert Banner */}
      {toast && (
        <div className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between shadow-md transition-all animate-in fade-in ${
          toast.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}>
          <div className="flex items-center gap-2.5">
            {toast.type === 'error' ? <AlertCircle className="w-4 h-4 text-rose-600" /> : <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
            <span>{toast.msg}</span>
          </div>
          <button onClick={() => setToast(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                WhatsApp Lead Management Studio
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 font-mono">
                {leads.length} Contacts
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              User Management Style Card view,status pipeline (Inquiries, Demo, Enrolled), and direct WhatsApp Blast integration.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Deduplicate Button */}
          <button
            type="button"
            onClick={handleRemoveDuplicates}
            disabled={deduplicating}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer border border-slate-200 shadow-2xs"
            title="Remove redundant duplicate lead records"
          >
            <ShieldCheck className={`w-4 h-4 ${deduplicating ? 'animate-spin text-rose-600' : 'text-slate-500'}`} />
           
          </button>

          <button
            type="button"
            onClick={fetchLeads}
            disabled={refreshing}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
          >
            <RotateCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-amber-600' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={openNewLeadModal}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-black text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer hover:shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>AddLead</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar (Only 3 Status Stages: Inquiries, Demo, Enrolled) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* 3 Status Stage Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {['ALL', ...statusOptions].map((stg) => (
            <button
              key={stg}
              onClick={() => setSelectedStatus(stg)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 border ${
                selectedStatus.toUpperCase() === stg.toUpperCase()
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {stg === 'ALL' ? 'All Statuses' : stg}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, 10-digit phone, email, address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500 shadow-xs"
          />
        </div>
      </div>

      {/* USER MANAGEMENT STYLE LEAD CARDS GRID */}
      {loading ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
          <RotateCw className="w-6 h-6 animate-spin text-amber-600 mx-auto mb-2" />
          <p className="text-xs text-slate-500 font-semibold">Loading Leads from Neon Database...</p>
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No leads found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Click Add Lead to create a new contact with name, phone, email, address, and status.
          </p>
          <button
            onClick={openNewLeadModal}
            className="px-4 py-2 rounded-xl bg-amber-600 text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Lead</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {paginatedLeads.map((lead) => {
              const cleanPhone = (lead.phone || '').replace(/[^0-9]/g, '');
              const leadStatus = lead.status || lead.pipeline_stage || 'Inquiries';

              return (
                <div
                  key={lead.id}
                  className="p-5 rounded-2xl bg-white border border-slate-200 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] hover:shadow-xl hover:border-amber-300 transition-all duration-200 flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    {/* Header Avatar & Status Badge (Inquiries, Demo, Enrolled) */}
                    <div className="flex items-start justify-between">
                      <div className="relative w-12 h-12 rounded-2xl bg-amber-100/80 border border-amber-200 text-amber-900 flex items-center justify-center text-lg font-black shadow-xs group-hover:scale-105 transition-transform">
                        {(lead.name || 'L').charAt(0)}
                        <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
                          leadStatus === 'Enrolled' ? 'bg-emerald-500' :
                          leadStatus === 'Demo' ? 'bg-purple-500' : 'bg-sky-500'
                        }`} />
                      </div>

                      {/* Interactive Stage Selector */}
                      <select
                        value={leadStatus}
                        onChange={(e) => handleStageChange(lead, e.target.value)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold cursor-pointer border focus:outline-none transition-all shadow-2xs ${
                          leadStatus === 'Enrolled' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                          leadStatus === 'Demo' ? 'bg-purple-50 text-purple-800 border-purple-300' :
                          'bg-sky-50 text-sky-800 border-sky-300'
                        }`}
                      >
                        <option value="Inquiries">Inquiries</option>
                        <option value="Demo">Demo</option>
                        <option value="Enrolled">Enrolled</option>
                      </select>
                    </div>

                    {/* Lead Name */}
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 group-hover:text-amber-600 transition-colors truncate">
                        {lead.name}
                      </h3>
                    </div>

                    {/* Phone & Email */}
                    <div className="space-y-1 text-xs pt-1">
                      <div className="flex items-center gap-2 text-slate-700 font-bold font-mono">
                        <Phone className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>+91 {lead.phone}</span>
                      </div>
                      {lead.email && (
                        <div className="flex items-center gap-2 text-slate-500 font-mono truncate">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{lead.email}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Read Rate / Engagement Badge */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[10px] text-slate-400 font-bold uppercase font-mono">Read Rate</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-black font-mono flex items-center gap-1">
                      <Activity className="w-3 h-3 text-emerald-600" />
                      <span>{lead.read_rate || '95%'}</span>
                    </span>
                  </div>

                  {/* Action Row */}
                  <div className="pt-2 flex items-center justify-end gap-1.5 border-t border-slate-100">
                    {onOpenBlast && (
                      <button
                        type="button"
                        onClick={onOpenBlast}
                        className="py-1.5 px-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-2xs transition-all cursor-pointer"
                        title="Send WhatsApp Blast Template"
                      >
                        <Send className="w-3 h-3" />
                        <span>Blast</span>
                      </button>
                    )}

                    {/* Direct WhatsApp Chat */}
                    <a
                      href={`https://wa.me/${cleanPhone}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors"
                      title="Chat on WhatsApp"
                    >
                      <WhatsApp className="w-3.5 h-3.5 text-emerald-600" />
                    </a>

                    {/* Direct Phone Call */}
                    <a
                      href={`tel:${lead.phone}`}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
                      title="Direct Call"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>

                    {/* Edit */}
                    <button
                      type="button"
                      onClick={() => handleEditClick(lead)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-sky-100 text-slate-600 hover:text-sky-700 border border-slate-200 transition-colors cursor-pointer"
                      title="Edit Lead"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => handleDeleteLead(lead.id, lead.name)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 border border-slate-200 transition-colors cursor-pointer"
                      title="Delete Lead"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>
              );
            })}
          </div>

          {/* Pagination Footer Controls */}
          {filteredLeads.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs gap-3">
              <div className="text-xs font-bold text-slate-500">
                Showing <span className="text-slate-900 font-extrabold">{paginatedLeads.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0}</span> to <span className="text-slate-900 font-extrabold">{Math.min(currentPage * ITEMS_PER_PAGE, filteredLeads.length)}</span> of <span className="text-slate-900 font-extrabold">{filteredLeads.length}</span> leads
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-extrabold text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all flex items-center gap-1.5 shadow-2xs"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <span className="px-3.5 py-1.5 text-xs font-black text-slate-900 bg-slate-100 rounded-lg font-mono">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  type="button"
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  disabled={currentPage >= totalPages}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-extrabold text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all flex items-center gap-1.5 shadow-2xs"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD / EDIT LEAD MODAL (Name, Email, 10-Digit Phone, Address, Status, Read Rate) */}
      {/* ========================================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    {editingLead ? `Edit Lead: ${editingLead.name}` : 'Add WhatsApp Automation Lead'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Fill in name, email, 10-digit mobile number, address, and status stage.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer border border-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmitLead} id="lead-form" className="p-6 space-y-4">
              
              {/* 1. Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Srinivas Rao"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* 2. WhatsApp Mobile Number (10 Digits Only) */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  WhatsApp Mobile Number (10 Digits Only) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    required
                    placeholder="9876543210 (10 digits starting with 6,7,8,9)"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border text-xs font-mono font-bold text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none ${
                      phoneError ? 'border-rose-500 focus:border-rose-500' : 'border-slate-200 focus:border-amber-500'
                    }`}
                  />
                </div>
                {phoneError ? (
                  <p className="text-[10px] text-rose-600 font-bold mt-1">{phoneError}</p>
                ) : (
                  <p className="text-[10px] text-emerald-600 font-semibold mt-1">✓ Formatted as +91 XXXXX XXXXX (10 digits only)</p>
                )}
              </div>

              {/* 3. Corporate / Personal Email */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    placeholder="srinivas@apollohospitals.com"
                    value={formData.email}
                    onChange={handleEmailChange}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border text-xs font-mono text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none ${
                      emailError ? 'border-rose-500 focus:border-rose-500' : 'border-slate-200 focus:border-amber-500'
                    }`}
                  />
                </div>
                {emailError && <p className="text-[10px] text-rose-600 font-bold mt-1">{emailError}</p>}
              </div>

              {/* 4. Address (Replaced Company) */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Address
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <textarea
                    rows={2}
                    placeholder="Full residential or business address..."
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* 5. Status Stage (Inquiries, Demo, Enrolled ONLY) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Status Stage
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    {statusOptions.map(stg => (
                      <option key={stg} value={stg}>{stg}</option>
                    ))}
                  </select>
                </div>

                {/* 6. Read Rate */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Read Rate %
                  </label>
                  <input
                    type="text"
                    placeholder="95%"
                    value={formData.read_rate}
                    onChange={(e) => setFormData({ ...formData, read_rate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

            </form>

            {/* Modal Action Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                form="lead-form"
                disabled={submitting || !!phoneError || !!emailError}
                className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                {submitting ? <RotateCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>{submitting ? 'Saving to Neon DB...' : (editingLead ? 'Update Lead Record' : 'Save Lead to Database')}</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
