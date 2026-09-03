import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Plus, 
  Search, 
  RotateCw, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Clock, 
  User, 
  Tag, 
  Filter, 
  Check, 
  ShieldCheck,
  Calendar,
  IndianRupee,
  Building,
  Send,
  Sparkles,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { IoLogoWhatsapp as WhatsApp } from 'react-icons/io5';

export default function PaySipGenerator({ onOpenBlast }) {
  const [paysips, setPaysips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Modals & Toast State
  const [showAddModal, setShowAddModal] = useState(false);
  const [editSip, setEditSip] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deduplicating, setDeduplicating] = useState(false);
  const [toast, setToast] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    clientName: '',
    phone: '',
    folioNumber: '',
    sipAmount: '5000',
    monthlyDay: '10',
    installmentCount: '12',
    fundName: 'HDFC Flexi Cap Fund',
    paymentStatus: 'Active'
  });

  const [phoneError, setPhoneError] = useState('');

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

  // Fetch Pay_SIP records from MongoDB
  const fetchPaySips = async () => {
    setRefreshing(true);
    try {
      const res = await fetch(`${getApiBase()}/api/paysip`);
      const data = await res.json();
      if (res.ok && data && data.success && Array.isArray(data.paysips)) {
        setPaysips(data.paysips);
      } else {
        setPaysips([]);
      }
    } catch (err) {
      console.error("Failed to fetch Pay_SIP records:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPaySips();
  }, []);

  // Strict 10-Digit Mobile Handler
  const handlePhoneChange = (e, isEdit = false) => {
    const raw = e.target.value;
    let digits = raw.replace(/\D/g, '');
    if (digits.startsWith('91') && digits.length > 10) {
      digits = digits.slice(2);
    }
    const clean10 = digits.slice(0, 10);

    if (isEdit) {
      setEditSip(prev => ({ ...prev, phone: clean10 }));
    } else {
      setFormData(prev => ({ ...prev, phone: clean10 }));
    }

    if (!clean10) {
      setPhoneError('Mobile number is required (10 digits).');
    } else if (clean10.length !== 10) {
      setPhoneError(`Exactly 10 digits required (${clean10.length}/10 entered).`);
    } else if (!['6', '7', '8', '9'].includes(clean10[0])) {
      setPhoneError('Indian mobile numbers must start with 6, 7, 8, or 9.');
    } else {
      setPhoneError('');
    }
  };

  // Create Pay_SIP Submit
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.clientName.trim() || !formData.phone || !formData.folioNumber.trim() || !formData.sipAmount) {
      showToastMsg("Client Name, Phone, Folio Number, and SIP Amount are required.", "error");
      return;
    }

    if (phoneError) {
      showToastMsg("Please fix phone number errors first.", "error");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${getApiBase()}/api/paysip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: formData.clientName.trim(),
          phone: formData.phone,
          folioNumber: formData.folioNumber.trim(),
          sipAmount: Number(formData.sipAmount),
          monthlyDay: Number(formData.monthlyDay || 10),
          installmentCount: Number(formData.installmentCount || 12),
          fundName: formData.fundName.trim(),
          paymentStatus: formData.paymentStatus
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToastMsg(data.message || "Pay_SIP created and saved in MongoDB!", "success");
        setShowAddModal(false);
        setFormData({
          clientName: '',
          phone: '',
          folioNumber: '',
          sipAmount: '5000',
          monthlyDay: '10',
          installmentCount: '12',
          fundName: 'HDFC Flexi Cap Fund',
          paymentStatus: 'Active'
        });
        await fetchPaySips();
      } else {
        throw new Error(data.message || "Failed to create Pay_SIP.");
      }
    } catch (err) {
      showToastMsg(err.message || "Error creating Pay_SIP.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Edit Pay_SIP Submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editSip) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${getApiBase()}/api/paysip/${editSip._id || editSip.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: editSip.clientName.trim(),
          phone: editSip.phone,
          folioNumber: editSip.folioNumber.trim(),
          sipAmount: Number(editSip.sipAmount),
          monthlyDay: Number(editSip.monthlyDay),
          installmentCount: Number(editSip.installmentCount),
          fundName: editSip.fundName.trim(),
          paymentStatus: editSip.paymentStatus
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToastMsg("Pay_SIP record updated in MongoDB!", "success");
        setEditSip(null);
        await fetchPaySips();
      } else {
        throw new Error(data.message || "Failed to update Pay_SIP.");
      }
    } catch (err) {
      showToastMsg(err.message || "Error updating Pay_SIP.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Pay_SIP
  const handleDeletePaySip = async (id, folio) => {
    if (!window.confirm(`Are you sure you want to delete Pay_SIP record '${folio}'?`)) return;

    try {
      const res = await fetch(`${getApiBase()}/api/paysip/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        showToastMsg("Pay_SIP deleted successfully.", "success");
        await fetchPaySips();
      }
    } catch (err) {
      showToastMsg("Error deleting Pay_SIP.", "error");
    }
  };

  // Purge Duplicates from MongoDB
  const handleRemoveDuplicates = async () => {
    setDeduplicating(true);
    try {
      const res = await fetch(`${getApiBase()}/api/paysip/remove-duplicates`, { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        showToastMsg(data.message || `Removed ${data.removed_count} duplicate Pay_SIP records!`, "success");
        await fetchPaySips();
      } else {
        throw new Error(data.message || "Failed to remove duplicates.");
      }
    } catch (err) {
      showToastMsg(err.message || "Error purging duplicates.", "error");
    } finally {
      setDeduplicating(false);
    }
  };

  // Filter Pay_SIP records
  const filteredPaysips = paysips.filter(item => {
    const statusMatches = filterStatus === 'ALL' || item.paymentStatus === filterStatus;
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      (item.clientName || '').toLowerCase().includes(query) ||
      (item.phone || '').toLowerCase().includes(query) ||
      (item.folioNumber || '').toLowerCase().includes(query) ||
      (item.fundName || '').toLowerCase().includes(query);

    return statusMatches && matchesSearch;
  });

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus]);

  const totalPages = Math.ceil(filteredPaysips.length / ITEMS_PER_PAGE) || 1;
  const paginatedPaysips = filteredPaysips.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const statusBadgeStyle = {
    Active: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    Pending: 'bg-amber-100 text-amber-800 border-amber-300',
    Completed: 'bg-sky-100 text-sky-800 border-sky-300',
    Paused: 'bg-rose-100 text-rose-800 border-rose-300'
  };

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
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-600 to-sky-600 text-white flex items-center justify-center shadow-md">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                Pay_SIP Auto Generator & Portfolio Manager
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 font-mono">
                {filteredPaysips.length} Active Pay_SIPs
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Real-time MongoDB Atlas connected Pay_SIP generator with folio tracking and duplicate data purging.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Remove Duplicate Data Button */}
          <button
            type="button"
            onClick={handleRemoveDuplicates}
            disabled={deduplicating}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer border border-slate-200 shadow-2xs shrink-0"
            title="Remove duplicate Pay_SIP records from database"
          >
            <ShieldCheck className={`w-4 h-4 ${deduplicating ? 'animate-spin text-rose-600' : 'text-slate-600'}`} />
            <span>{deduplicating ? 'Cleaning Duplicates...' : 'Remove Duplicate Data'}</span>
          </button>

          {/* Generate Pay_SIP Button */}
          <button
            type="button"
            onClick={() => {
              setFormData({
                clientName: '',
                phone: '',
                folioNumber: `FOLIO-${Math.floor(100000 + Math.random() * 900000)}`,
                sipAmount: '5000',
                monthlyDay: '10',
                installmentCount: '12',
                fundName: 'HDFC Flexi Cap Fund',
                paymentStatus: 'Active'
              });
              setPhoneError('');
              setShowAddModal(true);
            }}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Generate Pay_SIP</span>
          </button>
        </div>
      </div>

      {/* Search & Status Filters Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by client name, folio number, phone, or fund..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-emerald-500 shadow-2xs"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5" /> Status:
          </span>
          {['ALL', 'Active', 'Pending', 'Completed', 'Paused'].map((statusKey) => (
            <button
              key={statusKey}
              onClick={() => setFilterStatus(statusKey)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                filterStatus === statusKey
                  ? 'bg-slate-900 text-white shadow-2xs font-mono'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 font-medium'
              }`}
            >
              {statusKey === 'ALL' ? 'All Status' : statusKey}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={fetchPaySips}
          disabled={refreshing}
          className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200 shadow-2xs shrink-0"
        >
          <RotateCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-emerald-600' : ''}`} />
          <span>Refresh</span>
        </button>

      </div>

      {/* CARD STYLE SHOWING PAY_SIP LIST */}
      {loading ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
          <RotateCw className="w-6 h-6 animate-spin text-emerald-600 mx-auto mb-2" />
          <p className="text-xs text-slate-500 font-semibold">Loading Pay_SIP records from MongoDB...</p>
        </div>
      ) : filteredPaysips.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <CreditCard className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No Pay_SIP Records Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Generate your first Pay_SIP to track mutual fund installments and automated WhatsApp payment reminders.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs inline-flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Generate First Pay_SIP</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginatedPaysips.map((item) => {
              const cleanPhone = (item.phone || '').replace(/\D/g, '');
              const initials = item.clientName ? item.clientName.charAt(0).toUpperCase() : 'S';

              return (
                <div
                  key={item._id || item.id}
                  className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-xl hover:border-emerald-300 transition-all duration-200 flex flex-col justify-between space-y-4 group relative overflow-hidden"
                >
                  <div className="space-y-3">
                    
                    {/* Top Bar: Folio Number Tag & Status Badge */}
                    <div className="flex items-start justify-between">
                      <div className="px-2.5 py-1 rounded-full font-mono text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        📄 {item.folioNumber}
                      </div>

                      <span className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] font-extrabold border ${statusBadgeStyle[item.paymentStatus] || statusBadgeStyle.Active}`}>
                        {item.paymentStatus || 'Active'}
                      </span>
                    </div>

                    {/* Client Name & Fund Info */}
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white font-black text-base flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                        {initials}
                      </div>
                      <div>
                        <h3 className="text-base font-extrabold text-slate-900 group-hover:text-emerald-600 transition-colors">
                          {item.clientName}
                        </h3>
                        <div className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                          <Building className="w-3.5 h-3.5 text-slate-400" />
                          <span>{item.fundName || 'HDFC Flexi Cap Fund'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Details Card Grid */}
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs font-mono">
                      <div className="flex items-center justify-between text-slate-700 font-sans">
                        <span className="text-[11px] text-slate-500 font-medium">Monthly Amount:</span>
                        <span className="text-sm font-black text-emerald-600 flex items-center font-mono">
                          ₹{Number(item.sipAmount).toLocaleString('en-IN')}/mo
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[11px]">
                        <span className="text-slate-500 font-medium font-sans">Debit Day:</span>
                        <span className="font-bold text-slate-800">{item.monthlyDay || 10}th of every month</span>
                      </div>

                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 font-medium font-sans">Installments:</span>
                        <span className="font-bold text-slate-800">{item.installmentCount || 12} Months Tenure</span>
                      </div>
                    </div>

                    {/* Phone Details */}
                    {item.phone && (
                      <div className="flex items-center gap-2 text-emerald-700 font-bold font-mono text-xs pt-0.5">
                        <WhatsApp className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>+91 {item.phone}</span>
                      </div>
                    )}

                  </div>

                  {/* Footer Action Buttons */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <a
                      href={`https://wa.me/${cleanPhone.startsWith('91') ? cleanPhone : '91' + cleanPhone}?text=${encodeURIComponent(`Hello ${item.clientName}, your Pay_SIP installment of ₹${item.sipAmount} for Folio ${item.folioNumber} is due on the ${item.monthlyDay}th. Thank you!`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center gap-1.5 border border-emerald-200 transition-colors"
                      title="Send WhatsApp Payment Reminder"
                    >
                      <Send className="w-3.5 h-3.5 text-emerald-600" />
                      <span>WhatsApp Reminder</span>
                    </a>

                    <div className="flex items-center gap-1.5 ml-auto">
                      <button
                        type="button"
                        onClick={() => setEditSip({ ...item })}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                        title="Edit Pay_SIP Details"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-sky-600" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeletePaySip(item._id || item.id, item.folioNumber)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 border border-slate-200 transition-colors cursor-pointer"
                        title="Delete Pay_SIP Record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

          {/* Pagination Footer Controls */}
          {filteredPaysips.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs gap-3">
              <div className="text-xs font-bold text-slate-500">
                Showing <span className="text-slate-900 font-extrabold">{paginatedPaysips.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0}</span> to <span className="text-slate-900 font-extrabold">{Math.min(currentPage * ITEMS_PER_PAGE, filteredPaysips.length)}</span> of <span className="text-slate-900 font-extrabold">{filteredPaysips.length}</span> records
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
      {/* MODAL 1: GENERATE PAY_SIP FORM                                            */}
      {/* ========================================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-5 my-auto text-slate-900">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">Generate Pay_SIP Portfolio</h3>
                  <p className="text-xs text-slate-500 font-medium">Create client mutual fund Pay_SIP for automated WhatsApp tracking.</p>
                </div>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} id="paysip-add-form" className="space-y-4 text-xs font-medium">
              
              {/* Client Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Client Full Name <span className="text-rose-500 font-bold">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikramaditya Verma"
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Phone & Folio Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    WhatsApp Phone Number (+91) <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-slate-400 font-mono font-bold text-xs">+91</span>
                    <input
                      type="text"
                      required
                      maxLength={10}
                      placeholder="9876543210"
                      value={formData.phone}
                      onChange={(e) => handlePhoneChange(e, false)}
                      className="w-full pl-12 pr-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono text-xs placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  {phoneError && <p className="text-[10px] text-rose-600 font-semibold mt-1">{phoneError}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Folio Number <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="FOLIO-984210"
                    value={formData.folioNumber}
                    onChange={(e) => setFormData({ ...formData, folioNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono text-xs placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* SIP Amount & Monthly Debit Day */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Monthly SIP Amount (₹) <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="500"
                    step="500"
                    placeholder="5000"
                    value={formData.sipAmount}
                    onChange={(e) => setFormData({ ...formData, sipAmount: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono font-bold text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Monthly Debit Day (1 - 28)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="28"
                    placeholder="10"
                    value={formData.monthlyDay}
                    onChange={(e) => setFormData({ ...formData, monthlyDay: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Fund Name & Payment Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Mutual Fund Name
                  </label>
                  <input
                    type="text"
                    placeholder="HDFC Flexi Cap Fund"
                    value={formData.fundName}
                    onChange={(e) => setFormData({ ...formData, fundName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Payment Status
                  </label>
                  <select
                    value={formData.paymentStatus}
                    onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                    <option value="Paused">Paused</option>
                  </select>
                </div>
              </div>

            </form>

            <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="paysip-add-form"
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {submitting ? <RotateCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>{submitting ? 'Saving to Database...' : 'Save Pay_SIP Record'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: EDIT PAY_SIP FORM                                                */}
      {/* ========================================================================= */}
      {editSip && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-5 my-auto text-slate-900">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-md">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">Edit Pay_SIP Portfolio</h3>
                  <p className="text-xs text-slate-500 font-medium">Update folio number, SIP amount, or debit status.</p>
                </div>
              </div>
              <button onClick={() => setEditSip(null)} className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} id="paysip-edit-form" className="space-y-4 text-xs font-medium">
              
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">Client Full Name</label>
                <input
                  type="text"
                  required
                  value={editSip.clientName || ''}
                  onChange={(e) => setEditSip({ ...editSip, clientName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">Folio Number</label>
                  <input
                    type="text"
                    required
                    value={editSip.folioNumber || ''}
                    onChange={(e) => setEditSip({ ...editSip, folioNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">Monthly SIP Amount (₹)</label>
                  <input
                    type="number"
                    required
                    value={editSip.sipAmount || ''}
                    onChange={(e) => setEditSip({ ...editSip, sipAmount: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">Payment Status</label>
                  <select
                    value={editSip.paymentStatus || 'Active'}
                    onChange={(e) => setEditSip({ ...editSip, paymentStatus: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:border-sky-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                    <option value="Paused">Paused</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">Mutual Fund Name</label>
                  <input
                    type="text"
                    value={editSip.fundName || ''}
                    onChange={(e) => setEditSip({ ...editSip, fundName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

            </form>

            <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditSip(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="paysip-edit-form"
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs flex items-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {submitting ? <RotateCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>{submitting ? 'Updating...' : 'Update Pay_SIP'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
