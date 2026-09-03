import React, { useState, useEffect, useRef } from 'react';
import { 
  BookUser, 
  Plus, 
  Search, 
  RotateCw, 
  Trash2, 
  Phone, 
  Mail, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Upload, 
  FileSpreadsheet, 
  Send,
  User,
  Check,
  Activity,
  Filter,
  Tag,
  Shield,
  Download
} from 'lucide-react';
import { IoLogoWhatsapp as WhatsApp } from 'react-icons/io5';

import ConfirmModal from '../components/ui/ConfirmModal';

export default function Contacts({ onOpenBlast }) {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIdentity, setSelectedIdentity] = useState('ALL');
  
  // Modals & Toast State
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUploadExcelModal, setShowUploadExcelModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  // In-App Confirm Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'danger',
    confirmText: 'OK, Delete',
    cancelText: 'Cancel',
    onConfirm: null
  });

  // Form State (All Required Fields)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    identity: 'SAP FICO'
  });

  const [phoneError, setPhoneError] = useState('');
  const [emailError, setEmailError] = useState('');

  // Excel Upload State
  const [excelPreviewData, setExcelPreviewData] = useState([]);
  const [excelFileName, setExcelFileName] = useState('');
  const [importingExcel, setImportingExcel] = useState(false);

  const fileInputRef = useRef(null);

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

  const fetchContacts = async () => {
    setRefreshing(true);
    try {
      const res = await fetch(`${getApiBase()}/api/contacts`);
      const data = await res.json();
      if (res.ok && data && data.success && Array.isArray(data.contacts)) {
        const mapped = data.contacts.map((c, index) => ({
          ...c,
          id: String(c._id || c.id || c.phone || `contact_${index}`)
        }));
        setContacts(mapped);
      } else {
        setContacts([]);
      }
    } catch (err) {
      console.error("Failed to fetch contacts:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  // ---------------------------------------------------------------------------
  // STRICT 10-DIGIT MOBILE & EMAIL VALIDATION
  // ---------------------------------------------------------------------------
  const handlePhoneChange = (e) => {
    const raw = e.target.value;
    // Strip all non-digit characters
    let digits = raw.replace(/\D/g, '');
    
    // If starting with country code 91 and > 10 digits, strip leading 91
    if (digits.startsWith('91') && digits.length > 10) {
      digits = digits.slice(2);
    }

    // STRICT MAX 10 DIGITS — Reject any 11th digit from even being entered or displayed!
    const clean10 = digits.slice(0, 10);

    setFormData(prev => ({ ...prev, phone: clean10 }));

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

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setFormData(prev => ({ ...prev, email: val }));

    if (!val || !val.trim()) {
      setEmailError('Email address is required.');
    } else {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(val.trim())) {
        setEmailError('Enter a valid email address (e.g., name@domain.com).');
      } else {
        setEmailError('');
      }
    }
  };

  // ---------------------------------------------------------------------------
  // EXCEL / CSV TEMPLATE DOWNLOAD & PARSER
  // ---------------------------------------------------------------------------
  const handleDownloadTemplate = () => {
    const csvContent = "First name,Phone,Email,Identity\n" +
      "Dr. Srinivas Rao,9876543210,srinivas.rao@hospital.org,VIP Client\n" +
      "Kavita Menon,9812345678,kavita.m@techcorp.in,Vendor\n" +
      "Sneha Agarwal,9988776655,sneha.a@gmail.com,Lead";

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'contacts_upload_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToastMsg("Downloaded contact sheet template (First name, Phone, Email, Identity)!", "success");
  };

  const handleExcelFileUploaded = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setExcelFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        parseCSVText(text);
      }
    };
    reader.readAsText(file);
  };

  const parseCSVText = (text) => {
    const lines = text.split(/\r\n|\n/).filter(line => line.trim().length > 0);
    if (lines.length <= 1) {
      showToastMsg("The uploaded CSV file is empty or has no data rows.", "error");
      return;
    }

    const parsed = [];
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map(p => p.replace(/^"|"$/g, '').trim());
      if (parts.length >= 2) {
        let rawPhone = parts[1] || '';
        let digits = rawPhone.replace(/\D/g, '');
        if (digits.startsWith('91') && digits.length > 10) digits = digits.slice(2);
        const clean10 = digits.slice(0, 10);
        const formattedPhone = clean10 ? `+91 ${clean10}` : rawPhone;

        parsed.push({
          name: parts[0] || `Contact ${i}`,
          phone: formattedPhone,
          email: parts[2] || '',
          identity: parts[3] || 'Client'
        });
      }
    }

    setExcelPreviewData(parsed);
  };

  const handleBulkImportSubmit = async () => {
    if (excelPreviewData.length === 0) {
      showToastMsg("No valid contacts found in the preview data.", "error");
      return;
    }

    setImportingExcel(true);
    try {
      const res = await fetch(`${getApiBase()}/api/contacts/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contacts: excelPreviewData, source: 'excel' })
      });

      const result = await res.json();
      if (res.ok && result.success) {
        showToastMsg(result.message || `Imported contacts successfully!`, "success");
        setShowUploadExcelModal(false);
        setExcelPreviewData([]);
        setExcelFileName('');
        await fetchContacts();
      } else {
        throw new Error(result.detail || "Failed to import contacts from Excel.");
      }
    } catch (err) {
      showToastMsg(err.message || "Error importing contacts.", "error");
    } finally {
      setImportingExcel(false);
    }
  };

  // ---------------------------------------------------------------------------
  // CREATE CONTACT SUBMIT
  // ---------------------------------------------------------------------------
  const handleSubmitContact = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone || !formData.email.trim() || !formData.identity.trim()) {
      showToastMsg("All fields marked with * are required.", "error");
      return;
    }

    if (phoneError || emailError) {
      showToastMsg("Please fix validation errors before saving.", "error");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${getApiBase()}/api/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          phone: formData.phone,
          email: formData.email.trim(),
          identity: formData.identity.trim(),
          source: 'manual'
        })
      });

      const result = await res.json();
      if (res.ok && result.success) {
        showToastMsg(result.message || `Contact '${formData.name}' created in MongoDB!`, "success");
        setShowAddModal(false);
        setFormData({ name: '', phone: '', email: '', identity: 'Client' });
        await fetchContacts();
      } else {
        throw new Error(result.message || "Failed to create contact.");
      }
    } catch (err) {
      showToastMsg(err.message || "Error creating contact in database.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteContact = (contactId, contactName) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Contact",
      message: `Are you sure you want to delete contact '${contactName}'?`,
      type: "danger",
      confirmText: "OK, Delete",
      cancelText: "Cancel",
      onConfirm: () => executeDeleteContact(contactId, contactName)
    });
  };

  const executeDeleteContact = async (contactId, contactName) => {
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
    try {
      const res = await fetch(`${getApiBase()}/api/contacts/${contactId}`, { method: 'DELETE' });
      const result = await res.json();
      if (res.ok && result.success) {
        showToastMsg(`Contact '${contactName}' deleted successfully.`, "success");
        await fetchContacts();
      }
    } catch (err) {
      showToastMsg(err.message || "Error deleting contact.", "error");
    }
  };

  // Extract unique identities dynamically with strict case-insensitive deduplication
  const availableIdentities = (() => {
    const defaultList = ['ALL', 'Client', 'VIP', 'Lead', 'Vendor'];
    const seenLower = new Set(defaultList.map(item => item.toLowerCase()));
    const dynamicList = [];

    contacts.forEach(c => {
      const tag = (c.identity || '').trim();
      if (tag && !seenLower.has(tag.toLowerCase())) {
        seenLower.add(tag.toLowerCase());
        dynamicList.push(tag);
      }
    });

    return [...defaultList, ...dynamicList];
  })();

  // Filter contacts by Search Query & Identity
  const filteredContacts = contacts.filter(c => {
    const contactIdentity = c.identity || 'Client';
    const matchesIdentity = selectedIdentity === 'ALL' || contactIdentity.toLowerCase() === selectedIdentity.toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      (c.name || '').toLowerCase().includes(query) ||
      (c.phone || '').toLowerCase().includes(query) ||
      (c.email || '').toLowerCase().includes(query) ||
      contactIdentity.toLowerCase().includes(query);

    return matchesIdentity && matchesSearch;
  });

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
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center shadow-md">
            <BookUser className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                WhatsApp Meta Account Contacts
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-300 font-mono">
                {filteredContacts.length} Contacts
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage audience contacts with custom Identities, strict 10-digit mobile validation, and Excel bulk upload.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Download Template Button */}
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer border border-slate-200 shadow-2xs"
            title="Download sample CSV format (First name, Phone, Email, Identity)"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Download Template</span>
          </button>

          {/* Upload Excel Sheet Modal Trigger */}
          <button
            type="button"
            onClick={() => setShowUploadExcelModal(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer border border-emerald-200 shadow-2xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Upload Excel Sheet</span>
          </button>

          {/* Normal Form Fill Add Contact */}
          <button
            type="button"
            onClick={() => {
              setFormData({ name: '', phone: '', email: '', identity: 'Client' });
              setPhoneError('');
              setEmailError('');
              setShowAddModal(true);
            }}
            className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-black text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer hover:shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Add Contact</span>
          </button>
        </div>
      </div>

      {/* Search & Identity Filter Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search contacts by name, 10-digit phone, email, identity..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-sky-500 shadow-xs"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Identity Filters (Pills Showing Existing & Custom Identities) */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mr-1 shrink-0">
            <Tag className="w-3.5 h-3.5 text-tech_orange" /> Identity:
          </span>
          {availableIdentities.map((identity) => (
            <button
              key={identity}
              onClick={() => setSelectedIdentity(identity)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer shrink-0 ${
                selectedIdentity === identity
                  ? 'bg-slate-900 text-white shadow-sm font-mono'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 font-medium'
              }`}
            >
              {identity === 'ALL' ? 'All Identities' : identity}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={fetchContacts}
          disabled={refreshing}
          className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200 shadow-xs shrink-0"
        >
          <RotateCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-sky-600' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* CONTACTS CARDS GRID */}
      {loading ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
          <RotateCw className="w-6 h-6 animate-spin text-sky-600 mx-auto mb-2" />
          <p className="text-xs text-slate-500 font-semibold">Loading Meta contacts from database...</p>
        </div>
      ) : filteredContacts.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto">
            <BookUser className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No Meta Contacts found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery || selectedIdentity !== 'ALL'
              ? 'Try clearing your search or identity filter.'
              : 'Add your first contact via normal form fill or upload an Excel sheet.'}
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setShowUploadExcelModal(true)}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Excel Sheet</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-xl bg-sky-600 text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Contact</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredContacts.map((contact) => {
            const cleanPhone = (contact.phone || '').replace(/[^0-9]/g, '');
            const initials = contact.name ? contact.name.charAt(0).toUpperCase() : 'C';

            return (
              <div
                key={contact._id || contact.id}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] hover:shadow-xl hover:border-sky-300 transition-all duration-200 flex flex-col justify-between space-y-4 group relative overflow-hidden"
              >
                <div className="space-y-3">
                  
                  {/* Initials Avatar, Identity Tag & Status */}
                  <div className="flex items-start justify-between">
                    <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-tech_orange p-[2px] shadow-sm group-hover:scale-105 transition-transform">
                      <div className="w-full h-full rounded-2xl bg-white flex items-center justify-center text-base font-black text-slate-900">
                        {initials}
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white bg-emerald-500" />
                    </div>

                    <span className="px-2.5 py-1 rounded-full font-extrabold text-[10px] font-mono border bg-sky-50 text-sky-700 border-sky-200">
                      🏷️ {contact.identity || 'Client'}
                    </span>
                  </div>

                  {/* Contact Name */}
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 group-hover:text-sky-600 transition-colors truncate">
                      {contact.name}
                    </h3>
                  </div>

                  {/* Phone & Email Details */}
                  <div className="space-y-1.5 text-xs pt-1">
                    <div className="flex items-center gap-2 text-emerald-700 font-bold font-mono">
                      <Phone className="w-3.5 h-3.5 shrink-0" />
                      <span>+91 {contact.phone}</span>
                    </div>

                    {contact.email && (
                      <div className="flex items-center gap-2 text-slate-600 font-medium truncate font-mono">
                        <Mail className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                        <span className="truncate">{contact.email}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Read Rate / Segment Badge */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-400 font-bold uppercase font-mono">Segment</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-black font-mono flex items-center gap-1 uppercase">
                    <Activity className="w-3 h-3 text-emerald-600" />
                    <span>{contact.segment || 'New'}</span>
                  </span>
                </div>

                {/* Action Buttons: WhatsApp Blast, Direct Chat, Call, Delete */}
                <div className="pt-2 flex items-center justify-between gap-1.5 border-t border-slate-100">
                  {onOpenBlast && (
                    <button
                      type="button"
                      onClick={onOpenBlast}
                      className="py-1.5 px-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-2xs transition-all cursor-pointer flex-1"
                      title="Trigger WhatsApp Blast to this contact"
                    >
                      <Send className="w-3 h-3" />
                      <span>WhatsApp Blast</span>
                    </button>
                  )}

                  {/* Direct Chat */}
                  <a
                    href={`https://wa.me/${cleanPhone.startsWith('91') ? cleanPhone : '91' + cleanPhone}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors"
                    title="Chat on WhatsApp"
                  >
                    <WhatsApp className="w-3.5 h-3.5 text-emerald-600" />
                  </a>

                  {/* Phone Call */}
                  <a
                    href={`tel:${contact.phone}`}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
                    title="Direct Call"
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </a>

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => handleDeleteContact(contact._id || contact.id, contact.name)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 border border-slate-200 transition-colors cursor-pointer"
                    title="Delete Contact"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: ADD CONTACT FORM (LIGHT GRADIENT BG, ALL REQUIRED *, STRICT 10-DIGIT) */}
      {/* ========================================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          
          <div className="relative w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 my-auto text-slate-900">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-md">
                  <BookUser className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    Add New Contact Profile
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    All fields marked with <span className="text-rose-500 font-bold">*</span> are required for database store.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-900 border border-slate-300 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Professional Form */}
            <form onSubmit={handleSubmitContact} id="contact-form" className="space-y-4 text-xs">
              
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                  Full Name <span className="text-rose-500 font-bold">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 font-medium text-xs placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 shadow-2xs transition-all"
                  />
                </div>
              </div>

              {/* WhatsApp Mobile Number (+91 STRICT 10 DIGITS ONLY) */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                  WhatsApp Mobile Number <span className="text-rose-500 font-bold">*</span>
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 flex items-center gap-1 text-slate-700 font-mono font-semibold pointer-events-none">
                    <Phone className="w-4 h-4 text-emerald-600" />
                    <span>+91</span>
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    placeholder="9876543210 (Strictly 10 digits)"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    className={`w-full pl-16 pr-4 py-2.5 rounded-xl bg-white border text-slate-900 font-mono font-medium text-xs placeholder-slate-400 focus:outline-none shadow-2xs transition-all ${
                      phoneError ? 'border-rose-500 focus:ring-2 focus:ring-rose-500/10' : 'border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10'
                    }`}
                  />
                </div>
                {phoneError ? (
                  <p className="text-[11px] text-rose-600 font-semibold mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{phoneError}</span>
                  </p>
                ) : (
                  <p className="text-[10px] text-emerald-700 font-medium mt-1.5 flex items-center gap-1 font-mono">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Formatted as +91 {formData.phone || 'XXXXXXXXXX'} (Max 10 digits strictly enforced)</span>
                  </p>
                )}
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                  Email Address <span className="text-rose-500 font-bold">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="ramesh@company.com"
                    value={formData.email}
                    onChange={handleEmailChange}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border text-slate-900 font-mono font-medium text-xs placeholder-slate-400 focus:outline-none shadow-2xs transition-all ${
                      emailError ? 'border-rose-500 focus:ring-2 focus:ring-rose-500/10' : 'border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10'
                    }`}
                  />
                </div>
                {emailError && <p className="text-[11px] text-rose-600 font-semibold mt-1.5">{emailError}</p>}
              </div>

              {/* Identity Field (Adding custom Identity string) */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                  Identity (Category Tag) <span className="text-rose-500 font-bold">*</span>
                </label>
                <div className="relative">
                  <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-tech_orange" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. VIP, Client, Lead, Doctor, Vendor, Partner..."
                    value={formData.identity}
                    onChange={(e) => setFormData({ ...formData, identity: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 font-medium text-xs placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 shadow-2xs transition-all"
                  />
                </div>

                {/* Identity Quick Click Suggestions */}
                <div className="flex items-center gap-1.5 flex-wrap pt-2">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">Quick Fill:</span>
                  {['Client', 'SAP Fico', 'VIP', 'Lead', 'Vendor', 'Doctor', 'Partner'].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setFormData({ ...formData, identity: tag })}
                      className={`px-2.5 py-0.5 rounded-lg text-[10px] font-semibold border transition-colors cursor-pointer ${
                        formData.identity === tag
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-900 hover:text-white'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

            </form>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-300 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                form="contact-form"
                disabled={submitting || !!phoneError || !!emailError}
                className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-black text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {submitting ? <RotateCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>{submitting ? 'Storing in Database...' : 'Save Contact Profile'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: UPLOAD EXCEL SHEET                                               */}
      {/* ========================================================================= */}
      {showUploadExcelModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden my-auto p-6 sm:p-8 space-y-6">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Upload Excel Contact Sheet</h3>
                  <p className="text-xs text-slate-500">Upload CSV file to import multiple WhatsApp contacts.</p>
                </div>
              </div>
              <button onClick={() => setShowUploadExcelModal(false)} className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Download Template Notice Banner */}
            <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <div className="font-extrabold text-emerald-950 flex items-center gap-1.5">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>Required Excel / CSV Column Format</span>
                </div>
                <p className="text-[11px] text-emerald-800 mt-0.5 font-medium">
                  Columns: <strong className="font-mono text-emerald-950">First name, Phone, Email, Identity</strong>
                </p>
              </div>

              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="px-4 py-2 rounded-xl bg-white hover:bg-emerald-100 text-emerald-900 font-extrabold text-xs flex items-center gap-1.5 border border-emerald-300 shadow-2xs cursor-pointer shrink-0"
              >
                <Download className="w-4 h-4 text-emerald-600" />
                <span>Download Template</span>
              </button>
            </div>

            <div className="space-y-4">
              <input
                type="file"
                ref={fileInputRef}
                accept=".csv,.xlsx,.xls"
                onChange={handleExcelFileUploaded}
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-8 rounded-2xl border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50/50 hover:bg-emerald-50/30 text-center space-y-3 cursor-pointer transition-colors"
              >
                <Upload className="w-8 h-8 text-emerald-600 mx-auto" />
                <div>
                  <span className="text-xs font-extrabold text-slate-800">
                    {excelFileName ? excelFileName : 'Click to select CSV or Excel contact sheet file'}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-0.5">Supports CSV files with columns: Name, Phone, Email, Identity</p>
                </div>
              </div>

              {excelPreviewData.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-slate-800">Preview ({excelPreviewData.length} Contacts Found)</span>
                  </div>
                  <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl text-xs">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0">
                        <tr>
                          <th className="p-2.5">Name</th>
                          <th className="p-2.5">Phone</th>
                          <th className="p-2.5">Email</th>
                          <th className="p-2.5">Identity</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
                        {excelPreviewData.slice(0, 10).map((row, idx) => (
                          <tr key={idx}>
                            <td className="p-2.5 font-sans font-bold text-slate-900">{row.name}</td>
                            <td className="p-2.5 text-emerald-700 font-bold">{row.phone}</td>
                            <td className="p-2.5">{row.email}</td>
                            <td className="p-2.5">{row.identity || 'Client'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowUploadExcelModal(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkImportSubmit}
                disabled={importingExcel || excelPreviewData.length === 0}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-2 shadow-sm disabled:opacity-50"
              >
                {importingExcel ? <RotateCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>{importingExcel ? 'Importing...' : 'Confirm Bulk Import'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* In-App Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        confirmText={confirmModal.confirmText}
        cancelText={confirmModal.cancelText}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />

    </div>
  );
}
