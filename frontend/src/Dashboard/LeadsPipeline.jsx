import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  ChevronLeft,
  ChevronRight,
  Download,
  Upload,
  FileSpreadsheet,
  User,
  Tag,
  LayoutGrid,
  List,
  Filter,
  Award,
  Clock,
  Check
} from 'lucide-react';
import { IoLogoWhatsapp as WhatsApp } from 'react-icons/io5';

import ConfirmModal from '../Components/ui/ConfirmModal';

export default function LeadsPipeline({ onOpenBlast }) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deduplicating, setDeduplicating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedEmployeeFilter, setSelectedEmployeeFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'
  
  // Modals & Toast State
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null, name: '' });

  // File Upload Ref
  const fileInputRef = useRef(null);

  // Form State (Cleaned per user specs: identity, employeeName, leadStatusUpdate, secondUpdate, finalUpdate, status)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    identity: 'SAP FICO',
    employeeName: 'Jayaveer',
    leadStatusUpdate: '',
    secondUpdate: '',
    finalUpdate: '',
    status: 'Intrest'
  });

  // Validation States
  const [phoneError, setPhoneError] = useState('');
  const [emailError, setEmailError] = useState('');

  const getApiBase = () => {
    if (import.meta.env.VITE_API_BASE_URL) {
      return import.meta.env.VITE_API_BASE_URL;
    }
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      return 'http://localhost:5000';
    }
    return 'http://localhost:5000';
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
  // SAMPLE EXCEL / CSV TEMPLATE DOWNLOAD ("Template Download")
  // ---------------------------------------------------------------------------
  const handleDownloadTemplate = () => {
    const csvContent = "Name,Phone,Email,Address,Identity,Employee Name,Lead Status Update,2nd Update,Final Update,Status\n" +
      "Jayaveer Lead,9876543210,jayaveer@example.com,Hyderabad,SAP FICO,Jayaveer,First call connected - interested in SAP,Sent course syllabus & fee details,Confirmed enrollment date,Intrest\n" +
      "Rahul Sharma,8121016848,rahul@example.com,Bangalore,VIP,Anjali,Call back requested tomorrow,Discussed pricing plans,Attended live demo session,Pipeline\n" +
      "Suresh Kumar,9123456789,suresh@example.com,Mumbai,Client,Raman,Not reachable on 1st try,Sent WhatsApp message,Not interested currently,Not Intrest\n";
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Leads_Import_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToastMsg("Sample Leads Excel/CSV Template downloaded!", "success");
  };

  // ---------------------------------------------------------------------------
  // FILE UPLOAD FOR LEADS EXCEL / CSV IMPORT
  // ---------------------------------------------------------------------------
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const text = evt.target.result;
        const lines = text.split(/\r\n|\n/);
        if (lines.length < 2) {
          showToastMsg("File is empty or contains no lead rows.", "error");
          return;
        }

        const parsedLeads = [];
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;
          const row = lines[i].split(',').map(cell => cell.trim().replace(/^"|"$/g, ''));
          if (row.length < 2) continue;

          const name = row[0] || 'Imported Lead';
          const rawPhone = (row[1] || '').replace(/\D/g, '');
          const phone = rawPhone.length > 10 && rawPhone.startsWith('91') ? rawPhone.slice(2) : rawPhone;
          const email = row[2] || '';
          const address = row[3] || '';
          const identity = row[4] || 'SAP FICO';
          const employeeName = row[5] || 'Jayaveer';
          const leadStatusUpdate = row[6] || '';
          const secondUpdate = row[7] || '';
          const finalUpdate = row[8] || '';
          const status = row[9] || 'Intrest';

          if (phone.length === 10 && ['6','7','8','9'].includes(phone[0])) {
            parsedLeads.push({
              name,
              phone,
              email,
              address,
              identity,
              employeeName,
              leadStatusUpdate,
              secondUpdate,
              finalUpdate,
              status
            });
          }
        }

        if (parsedLeads.length === 0) {
          showToastMsg("No valid 10-digit mobile leads found in uploaded file.", "error");
          return;
        }

        let addedCount = 0;
        for (const leadData of parsedLeads) {
          try {
            const res = await fetch(`${getApiBase()}/api/leads`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(leadData)
            });
            if (res.ok) addedCount++;
          } catch (err) {
            // Ignore individual duplicate errors
          }
        }

        showToastMsg(`Successfully imported ${addedCount} leads from file!`, "success");
        await fetchLeads();
      } catch (err) {
        showToastMsg("Error parsing uploaded Excel file.", "error");
      }
    };

    reader.readAsText(file);
    e.target.value = '';
  };

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
        showToastMsg(result.message || `Removed ${result.removedCount || 0} duplicate records!`, "success");
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
        identity: formData.identity,
        employeeName: formData.employeeName,
        leadStatusUpdate: formData.leadStatusUpdate,
        secondUpdate: formData.secondUpdate,
        finalUpdate: formData.finalUpdate,
        status: formData.status || 'Intrest'
      };

      const url = editingLead ? `${getApiBase()}/api/leads/${editingLead._id || editingLead.id}` : `${getApiBase()}/api/leads`;
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
        throw new Error(result.message || "Failed to save lead.");
      }
    } catch (err) {
      showToastMsg(err.message || "Error saving lead.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStageChange = async (lead, newStatus) => {
    try {
      const res = await fetch(`${getApiBase()}/api/leads/${lead._id || lead.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const result = await res.json();
      if (res.ok && result.success) {
        showToastMsg(`Lead '${lead.name}' status updated to ${newStatus}!`, "success");
        setLeads(prev => prev.map(l => (l._id || l.id) === (lead._id || lead.id) ? { ...l, status: newStatus } : l));
      }
    } catch (err) {
      showToastMsg("Failed to update status.", "error");
    }
  };

  const handleDeleteLead = (leadId, leadName) => {
    setDeleteConfirm({
      isOpen: true,
      id: leadId,
      name: leadName
    });
  };

  const confirmDeleteLead = async () => {
    if (!deleteConfirm.id) return;
    try {
      const res = await fetch(`${getApiBase()}/api/leads/${deleteConfirm.id}`, { method: 'DELETE' });
      const result = await res.json();
      if (res.ok && result.success) {
        showToastMsg(`Lead '${deleteConfirm.name}' deleted successfully.`, "success");
        await fetchLeads();
      }
    } catch (err) {
      showToastMsg(err.message || "Error deleting lead.", "error");
    } finally {
      setDeleteConfirm({ isOpen: false, id: null, name: '' });
    }
  };

  const handleEditClick = (lead) => {
    setEditingLead(lead);
    setFormData({
      name: lead.name || '',
      phone: lead.phone || '',
      email: lead.email || '',
      address: lead.address || '',
      identity: lead.identity || 'SAP FICO',
      employeeName: lead.employeeName || 'Jayaveer',
      leadStatusUpdate: lead.leadStatusUpdate || '',
      secondUpdate: lead.secondUpdate || '',
      finalUpdate: lead.finalUpdate || '',
      status: lead.status || 'Intrest'
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
      identity: 'SAP FICO',
      employeeName: 'Jayaveer',
      leadStatusUpdate: '',
      secondUpdate: '',
      finalUpdate: '',
      status: 'Intrest'
    });
    setPhoneError('');
    setEmailError('');
    setShowAddModal(true);
  };

  const statusOptions = ['Intrest', 'Not Intrest', 'Pipeline', 'Overall Calls', 'Inquiries', 'Demo', 'Enrolled'];

  // Extract unique, strictly deduplicated Employee Names dynamically from database leads ONLY
  const employeeNamesList = useMemo(() => {
    const seenMap = new Map();

    leads.forEach(l => {
      if (l.employeeName && l.employeeName.trim()) {
        const raw = l.employeeName.trim();
        const lowerKey = raw.toLowerCase();
        if (!seenMap.has(lowerKey)) {
          const formatted = raw.charAt(0).toUpperCase() + raw.slice(1);
          seenMap.set(lowerKey, formatted);
        }
      }
    });

    return Array.from(seenMap.values());
  }, [leads]);

  // Compute Employee Daily Calling Performance Stats (Total = Overall Calls)
  const employeeStats = useMemo(() => {
    const map = {};
    employeeNamesList.forEach(emp => {
      map[emp.toLowerCase()] = { name: emp, total: 0, interested: 0, pipeline: 0, joined: 0 };
    });

    leads.forEach(l => {
      const empRaw = (l.employeeName && l.employeeName.trim()) ? l.employeeName.trim() : 'Jayaveer';
      const lowerKey = empRaw.toLowerCase();
      if (!map[lowerKey]) {
        const formatted = empRaw.charAt(0).toUpperCase() + empRaw.slice(1);
        map[lowerKey] = { name: formatted, total: 0, interested: 0, pipeline: 0, joined: 0 };
      }

      // Total represents Overall Calls / Total Leads handled
      map[lowerKey].total += 1;

      const st = (l.status || '').toLowerCase();
      if (st.includes('intrest') || st.includes('interest')) map[lowerKey].interested += 1;
      if (st.includes('pipe') || st.includes('demo') || st.includes('inquir')) map[lowerKey].pipeline += 1;
      if (st.includes('enrol') || st.includes('joined') || st.includes('total') || st.includes('overall') || st.includes('won')) map[lowerKey].joined += 1;
    });

    return map;
  }, [leads, employeeNamesList]);

  // Filtered Leads
  const filteredLeads = leads.filter(lead => {
    const currStatus = (lead.status || 'Intrest').toUpperCase();
    const matchesStatus = selectedStatus === 'ALL' || currStatus === selectedStatus.toUpperCase() || (selectedStatus === 'Overall Calls' && true);
    
    const currEmp = (lead.employeeName || 'Jayaveer').toUpperCase();
    const matchesEmployee = selectedEmployeeFilter === 'ALL' || currEmp === selectedEmployeeFilter.toUpperCase();

    const query = searchQuery.toLowerCase();
    const matchesSearch = (lead.name || '').toLowerCase().includes(query) ||
                          (lead.phone || '').toLowerCase().includes(query) ||
                          (lead.email || '').toLowerCase().includes(query) ||
                          (lead.identity || '').toLowerCase().includes(query) ||
                          (lead.employeeName || '').toLowerCase().includes(query) ||
                          (lead.address || '').toLowerCase().includes(query);
    
    return matchesStatus && matchesEmployee && matchesSearch;
  });

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedStatus, selectedEmployeeFilter]);

  const totalPages = Math.ceil(filteredLeads.length / ITEMS_PER_PAGE) || 1;
  const paginatedLeads = filteredLeads.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const getStatusBadgeClass = (statusStr) => {
    const st = (statusStr || '').toLowerCase();
    if (st.includes('intrest') && !st.includes('not')) return 'bg-emerald-50 text-emerald-800 border-emerald-300';
    if (st.includes('not intrest')) return 'bg-rose-50 text-rose-800 border-rose-300';
    if (st.includes('pipe')) return 'bg-sky-50 text-sky-800 border-sky-300';
    if (st.includes('enrol') || st.includes('joined')) return 'bg-purple-50 text-purple-800 border-purple-300';
    return 'bg-amber-50 text-amber-800 border-amber-300';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      
      {/* Custom In-App Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        title="Delete Lead Record"
        message={`Are you sure you want to permanently delete lead '${deleteConfirm.name}' from MongoDB?`}
        type="danger"
        confirmText="OK, Delete"
        cancelText="Cancel"
        onConfirm={confirmDeleteLead}
        onCancel={() => setDeleteConfirm({ isOpen: false, id: null, name: '' })}
      />

      {/* Hidden File Input for Excel Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".csv, .xlsx, .xls"
        className="hidden"
      />

      {/* Toast Alert Banner */}
      {toast && (
        <div className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between shadow-md transition-all ${
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
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-inner">
            <Target className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-tight">Leads & Employee Pipeline Studio</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                {leads.length} Active Leads
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5 max-w-xl">
              Track daily employee calling updates (1st Update, 2nd Update, Final Update), employee lead conversions, and Cards / Table view mode.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          
          {/* Cards vs Table View Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-slate-800 border border-slate-700">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`p-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'cards' 
                  ? 'bg-amber-500 text-slate-950 font-black shadow-xs' 
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Switch to Cards View"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Cards</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'table' 
                  ? 'bg-amber-500 text-slate-950 font-black shadow-xs' 
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Switch to Table View"
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Table</span>
            </button>
          </div>

          {/* Download Sample Excel Template Button */}
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-xs"
            title="Download Sample Excel Import Template"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Template Download</span>
          </button>

          {/* Import Excel Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-xs"
            title="Upload & Import Leads Excel Sheet"
          >
            <Upload className="w-3.5 h-3.5 text-sky-400" />
            <span>Upload Excel</span>
          </button>

          {/* Deduplicate Button */}
          <button
            type="button"
            onClick={handleRemoveDuplicates}
            disabled={deduplicating}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs disabled:opacity-50"
            title="Remove redundant duplicate lead records"
          >
            <ShieldCheck className={`w-3.5 h-3.5 ${deduplicating ? 'animate-spin text-rose-400' : 'text-rose-400'}`} />
            <span>Purge Dupes</span>
          </button>

          {/* Refresh */}
          <button
            type="button"
            onClick={fetchLeads}
            disabled={refreshing}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-amber-400' : ''}`} />
            <span>Refresh</span>
          </button>

          {/* Add Lead */}
          <button
            type="button"
            onClick={openNewLeadModal}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-black text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer hover:shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Add Lead</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* OVERALL EMPLOYEE DAILY CALLING & LEAD CONVERSION SUMMARY (EXPANDED UI)    */}
      {/* ========================================================================= */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-md space-y-5 my-2">
        
        {/* Section Title Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-md shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                Overall Employee Daily Calling & Lead Conversion Summary
              </h2>
              <p className="text-xs text-slate-500">
                Track overall calls handled, interested leads, pipeline stages, and member enrollments per Employee.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-slate-100 text-slate-700 border border-slate-200 font-mono">
              {selectedEmployeeFilter === 'ALL' ? 'Showing All Employees' : `Filtered: ${selectedEmployeeFilter}`}
            </span>
            {selectedEmployeeFilter !== 'ALL' && (
              <button
                type="button"
                onClick={() => setSelectedEmployeeFilter('ALL')}
                className="text-xs font-bold text-amber-600 hover:text-amber-700 underline cursor-pointer"
              >
                Clear Filter
              </button>
            )}
          </div>
        </div>

        {/* Employee Cards Grid (Increased Height & Spacing) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {employeeNamesList.map(empName => {
            const key = empName.toLowerCase();
            const stats = employeeStats[key] || { name: empName, total: 0, interested: 0, pipeline: 0, joined: 0 };
            const isSelected = selectedEmployeeFilter.toLowerCase() === key;

            return (
              <div 
                key={empName}
                onClick={() => setSelectedEmployeeFilter(isSelected ? 'ALL' : empName)}
                className={`p-5 rounded-2xl border-2 transition-all duration-200 cursor-pointer space-y-4 flex flex-col justify-between min-h-[160px] ${
                  isSelected 
                    ? 'bg-amber-50/90 border-amber-400 shadow-lg ring-2 ring-amber-400/30 scale-[1.02]' 
                    : 'bg-slate-50/70 hover:bg-white hover:border-amber-300 border-slate-200 shadow-2xs hover:shadow-md'
                }`}
              >
                {/* Top Row: Employee Avatar & Overall Calls Pill */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-900 to-slate-800 text-white font-black text-sm flex items-center justify-center shadow-xs shrink-0">
                      {empName.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-extrabold text-sm text-slate-900 truncate" title={empName}>
                      {empName}
                    </span>
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-black bg-slate-900 text-white shadow-2xs shrink-0" title="Overall Calls / Leads Handled">
                    {stats.total} Calls
                  </span>
                </div>

                {/* Metrics Breakdown Grid (Increased Text Sizes) */}
                <div className="grid grid-cols-3 gap-1.5 pt-3 border-t border-slate-200/80">
                  <div className="text-center p-1.5 rounded-xl bg-white/80 border border-slate-200/60 shadow-2xs">
                    <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Intrest</span>
                    <span className="text-sm font-black text-emerald-600 font-mono">{stats.interested}</span>
                  </div>

                  <div className="text-center p-1.5 rounded-xl bg-white/80 border border-slate-200/60 shadow-2xs">
                    <span className="block text-[9.5px] text-slate-900 font-bold uppercase tracking-wider">Pipeline</span>
                    <span className="text-sm font-black text-sky-600 font-mono">{stats.pipeline}</span>
                  </div>

                  <div className="text-center p-1.5 rounded-xl bg-amber-100/70 border border-amber-300/80 shadow-2xs">
                    <span className="block text-[10px] text-amber-900 font-bold uppercase tracking-wider">Joined</span>
                    <span className="text-sm font-black text-amber-700 font-mono">🌟 {stats.joined}</span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Status Stage Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {['ALL', ...statusOptions].map((stg) => (
            <button
              key={stg}
              onClick={() => setSelectedStatus(stg)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 border ${
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
            placeholder="Search name, phone, identity, employee..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500 shadow-xs"
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MAIN LEAD LISTING (CARDS VS TABLE VIEW MODE)                              */}
      {/* ========================================================================= */}
      {loading ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
          <RotateCw className="w-6 h-6 animate-spin text-amber-600 mx-auto mb-2" />
          <p className="text-xs text-slate-500 font-semibold">Loading Leads from MongoDB Atlas...</p>
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No leads found matching criteria</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try resetting your search query or status filter, or click Add Lead to create a new profile.
          </p>
          <button
            onClick={openNewLeadModal}
            className="px-4 py-2 rounded-xl bg-amber-600 text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Lead</span>
          </button>
        </div>
      ) : viewMode === 'cards' ? (
        
        /* CARD STYLE GRID VIEW */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {paginatedLeads.map((lead) => {
              const cleanPhone = (lead.phone || '').replace(/[^0-9]/g, '');
              const leadStatus = lead.status || 'Intrest';

              return (
                <div
                  key={lead._id || lead.id}
                  className="p-5 rounded-2xl bg-white border border-slate-200 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] hover:shadow-xl hover:border-amber-300 transition-all duration-200 flex flex-col justify-between space-y-4 group relative overflow-hidden"
                >
                  {/* Top Gradient Bar */}
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 to-emerald-500" />

                  <div className="space-y-3 pt-1">
                    
                    {/* Header Avatar & Status Dropdown Selector */}
                    <div className="flex items-start justify-between">
                      <div className="relative w-11 h-11 rounded-2xl bg-amber-100/80 border border-amber-200 text-amber-900 flex items-center justify-center text-base font-black shadow-xs group-hover:scale-105 transition-transform">
                        {(lead.name || 'L').charAt(0).toUpperCase()}
                      </div>

                      <select
                        value={leadStatus}
                        onChange={(e) => handleStageChange(lead, e.target.value)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold cursor-pointer border focus:outline-none transition-all shadow-2xs ${getStatusBadgeClass(leadStatus)}`}
                      >
                        {statusOptions.map(stg => (
                          <option key={stg} value={stg}>{stg}</option>
                        ))}
                      </select>
                    </div>

                    {/* Identity Chip & Assigned Employee */}
                    <div className="flex items-center justify-between text-xs gap-1">
                      <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                        🏷️ {lead.identity || 'SAP FICO'}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                        👤 {lead.employeeName || 'Jayaveer'}
                      </span>
                    </div>

                    {/* Lead Name */}
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 group-hover:text-amber-600 transition-colors truncate">
                        {lead.name}
                      </h3>
                    </div>

                    {/* Phone & Email */}
                    <div className="space-y-1 text-xs">
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

                    {/* 3 Calling Updates Timeline (1st, 2nd, Final) */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-[11px]">
                      {lead.leadStatusUpdate && (
                        <div className="flex items-start gap-1.5 text-slate-800 font-medium leading-tight">
                          <span className="text-[10px] font-mono font-bold text-amber-600 uppercase shrink-0">1st:</span>
                          <span className="line-clamp-2">{lead.leadStatusUpdate}</span>
                        </div>
                      )}
                      {lead.secondUpdate && (
                        <div className="flex items-start gap-1.5 text-slate-700 font-medium leading-tight">
                          <span className="text-[10px] font-mono font-bold text-sky-600 uppercase shrink-0">2nd:</span>
                          <span className="line-clamp-2">{lead.secondUpdate}</span>
                        </div>
                      )}
                      {lead.finalUpdate && (
                        <div className="flex items-start gap-1.5 text-slate-900 font-extrabold leading-tight">
                          <span className="text-[10px] font-mono font-bold text-emerald-600 uppercase shrink-0">Final:</span>
                          <span className="line-clamp-2">{lead.finalUpdate}</span>
                        </div>
                      )}
                      {!lead.leadStatusUpdate && !lead.secondUpdate && !lead.finalUpdate && (
                        <span className="text-[10px] text-slate-400 italic">No calling updates logged yet.</span>
                      )}
                    </div>

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
                      href={`https://wa.me/${cleanPhone.startsWith('91') ? cleanPhone : '91' + cleanPhone}`}
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
                      title="Edit Lead Details"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => handleDeleteLead(lead._id || lead.id, lead.name)}
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

      ) : (

        /* TABLE VIEW MODE */
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                    <th className="py-4 px-6">Lead Name & Mobile</th>
                    <th className="py-4 px-6">Identity</th>
                    <th className="py-4 px-6">Employee</th>
                    <th className="py-4 px-6">Calling Updates (1st, 2nd, Final)</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {paginatedLeads.map((lead) => {
                    const cleanPhone = (lead.phone || '').replace(/[^0-9]/g, '');
                    const leadStatus = lead.status || 'Intrest';

                    return (
                      <tr key={lead._id || lead.id} className="hover:bg-slate-50/80 transition-colors group">
                        
                        {/* Lead Name & Mobile */}
                        <td className="py-4 px-6">
                          <div className="space-y-0.5">
                            <div className="font-extrabold text-slate-900 group-hover:text-amber-600 transition-colors">
                              {lead.name}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-600 font-mono">
                              <Phone className="w-3 h-3 text-amber-600 shrink-0" />
                              <span>+91 {lead.phone}</span>
                            </div>
                          </div>
                        </td>

                        {/* Identity */}
                        <td className="py-4 px-6">
                          <span className="px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 border border-sky-200 text-xs font-bold font-mono">
                            🏷️ {lead.identity || 'SAP FICO'}
                          </span>
                        </td>

                        {/* Employee Name */}
                        <td className="py-4 px-6">
                          <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200 text-xs font-bold font-mono">
                            👤 {lead.employeeName || 'Jayaveer'}
                          </span>
                        </td>

                        {/* Calling Updates (1st, 2nd, Final) */}
                        <td className="py-4 px-6">
                          <div className="space-y-1 text-xs max-w-xs">
                            {lead.leadStatusUpdate && (
                              <div className="text-slate-800"><strong className="text-amber-600">1st:</strong> {lead.leadStatusUpdate}</div>
                            )}
                            {lead.secondUpdate && (
                              <div className="text-slate-700"><strong className="text-sky-600">2nd:</strong> {lead.secondUpdate}</div>
                            )}
                            {lead.finalUpdate && (
                              <div className="text-slate-900 font-bold"><strong className="text-emerald-600">Final:</strong> {lead.finalUpdate}</div>
                            )}
                            {!lead.leadStatusUpdate && !lead.secondUpdate && !lead.finalUpdate && (
                              <span className="text-slate-400 italic">No notes</span>
                            )}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-6">
                          <select
                            value={leadStatus}
                            onChange={(e) => handleStageChange(lead, e.target.value)}
                            className={`px-2.5 py-1 rounded-full text-xs font-extrabold cursor-pointer border focus:outline-none transition-all shadow-2xs ${getStatusBadgeClass(leadStatus)}`}
                          >
                            {statusOptions.map(stg => (
                              <option key={stg} value={stg}>{stg}</option>
                            ))}
                          </select>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <a
                              href={`https://wa.me/${cleanPhone.startsWith('91') ? cleanPhone : '91' + cleanPhone}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                              title="Chat on WhatsApp"
                            >
                              <WhatsApp className="w-3.5 h-3.5" />
                            </a>

                            <button
                              type="button"
                              onClick={() => handleEditClick(lead)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-sky-50 text-slate-600 hover:text-sky-600 border border-slate-200 transition-colors cursor-pointer"
                              title="Edit Lead"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteLead(lead._id || lead.id, lead.name)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 transition-colors cursor-pointer"
                              title="Delete Lead"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer Controls */}
            {filteredLeads.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-white border-t border-slate-200/80 gap-3">
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
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD / EDIT LEAD MODAL FORM                                                */}
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
                    {editingLead ? `Edit Lead: ${editingLead.name}` : 'Add New Lead Profile'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Fill in lead details, assigned employee, calling updates, and status.
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
            <form onSubmit={handleSubmitLead} id="lead-form" className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              
              {/* 1. Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jayaveer Lead"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* 2. WhatsApp Mobile Number */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  WhatsApp Mobile Number (10 Digits Only) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    required
                    placeholder="9876543210 (10 digits)"
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

              {/* 3. Identity Tag */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Identity Tag
                </label>
                <input
                  type="text"
                  placeholder="e.g. SAP FICO, VIP, Client, Lead, Vendor"
                  value={formData.identity}
                  onChange={(e) => setFormData({ ...formData, identity: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500"
                />
                <div className="flex items-center gap-1.5 flex-wrap pt-1.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Quick Fill:</span>
                  {['SAP FICO', 'Client', 'VIP', 'Lead', 'Vendor'].map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setFormData({ ...formData, identity: tag })}
                      className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 cursor-pointer"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Assigned Employee Name */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Assigned Employee Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Jayaveer, Raman, Anjali, Kiran"
                  value={formData.employeeName}
                  onChange={(e) => setFormData({ ...formData, employeeName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500"
                />
                {employeeNamesList.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap pt-1.5">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Quick Select Employee:</span>
                    {employeeNamesList.map(emp => (
                      <button
                        key={emp}
                        type="button"
                        onClick={() => setFormData({ ...formData, employeeName: emp })}
                        className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 cursor-pointer"
                      >
                        {emp}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 5. 1st Calling Update (Lead Status Update) */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Lead Status (1st Calling Update)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1st call connected, interested in SAP course"
                  value={formData.leadStatusUpdate}
                  onChange={(e) => setFormData({ ...formData, leadStatusUpdate: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* 6. 2nd Update */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  2nd Update
                </label>
                <input
                  type="text"
                  placeholder="e.g. Discussed pricing & syllabus details"
                  value={formData.secondUpdate}
                  onChange={(e) => setFormData({ ...formData, secondUpdate: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* 7. Final Update */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Final Update
                </label>
                <input
                  type="text"
                  placeholder="e.g. Confirmed enrollment / Paid registration fee"
                  value={formData.finalUpdate}
                  onChange={(e) => setFormData({ ...formData, finalUpdate: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* 8. Email Address & Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="jayaveer@example.com"
                    value={formData.email}
                    onChange={handleEmailChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Status</label>
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
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Address</label>
                <textarea
                  rows={2}
                  placeholder="Lead location / address..."
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500"
                />
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
                <span>{submitting ? 'Saving Lead...' : (editingLead ? 'Update Lead Record' : 'Save Lead Profile')}</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
