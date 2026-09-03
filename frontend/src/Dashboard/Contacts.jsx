import React, { useState, useEffect, useRef } from 'react';
import { 
  BookUser, 
  Plus, 
  Search, 
  RotateCw, 
  Trash2, 
  Phone, 
  Mail, 
  MapPin, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Upload, 
  Download, 
  FileSpreadsheet, 
  Image as ImageIcon, 
  Send,
  User,
  Check,
  Activity
} from 'lucide-react';
import { IoLogoWhatsapp as WhatsApp } from 'react-icons/io5';

export default function Contacts({ onOpenBlast }) {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals & Toast State
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUploadExcelModal, setShowUploadExcelModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  // Normal Form Fill State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    image_url: '',
    status: 'Active',
    read_rate: '100%'
  });

  const [phoneError, setPhoneError] = useState('');
  const [emailError, setEmailError] = useState('');

  // Excel Upload Preview State
  const [excelPreviewData, setExcelPreviewData] = useState([]);
  const [excelFileName, setExcelFileName] = useState('');
  const [importingExcel, setImportingExcel] = useState(false);

  const fileInputRef = useRef(null);
  const metaImageInputRef = useRef(null);

  const getApiBase = () => {
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      return 'http://127.0.0.1:8000';
    }
    return import.meta.env.VITE_API_BASE_URL || 'https://crm-fee1.onrender.com';
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
        setContacts(data.contacts);
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

  // Meta Profile Picture Upload Handler
  const handleImageFileSelected = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToastMsg("Image size must be under 5MB.", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData(prev => ({ ...prev, image_url: event.target?.result || '' }));
    };
    reader.readAsDataURL(file);
  };

  // ---------------------------------------------------------------------------
  // EXCEL / CSV SHEET PARSER
  // ---------------------------------------------------------------------------
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
        parsed.push({
          name: parts[0] || `Contact ${i}`,
          phone: parts[1] || '',
          email: parts[2] || '',
          address: parts[3] || '',
          status: parts[4] || 'Active',
          read_rate: parts[5] || '100%'
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
      const res = await fetch(`${getApiBase()}/api/contacts/import-excel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contacts: excelPreviewData })
      });

      const result = await res.json();
      if (res.ok && result.success) {
        showToastMsg(result.message || `Imported ${result.imported_count} contacts successfully!`, "success");
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

  // Download Sample Template CSV
  const handleDownloadSampleTemplate = () => {
    window.open(`${getApiBase()}/api/contacts/download-sample-csv`, '_blank');
  };

  // ---------------------------------------------------------------------------
  // CREATE CONTACT SUBMIT
  // ---------------------------------------------------------------------------
  const handleSubmitContact = async (e) => {
    e.preventDefault();
    if (phoneError || emailError) {
      showToastMsg("Please fix validation errors before saving.", "error");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${getApiBase()}/api/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await res.json();
      if (res.ok && result.success) {
        showToastMsg(result.message || `Contact created successfully!`, "success");
        setShowAddModal(false);
        setFormData({
          name: '',
          phone: '',
          email: '',
          address: '',
          image_url: '',
          status: 'Active',
          read_rate: '100%'
        });
        await fetchContacts();
      } else {
        throw new Error(result.detail || "Failed to create contact.");
      }
    } catch (err) {
      showToastMsg(err.message || "Error creating contact.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteContact = async (contactId, contactName) => {
    if (!window.confirm(`Are you sure you want to delete contact '${contactName}'?`)) return;

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

  const filteredContacts = contacts.filter(c => {
    return (c.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
           (c.phone || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
           (c.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
           (c.address || '').toLowerCase().includes(searchQuery.toLowerCase());
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
                {contacts.length} Meta Accounts
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Normal form fill with Meta profile picture upload, Excel sheet bulk upload, sample template downloader, and direct WhatsApp Blast triggering.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Download Excel Sample Template */}
          <button
            type="button"
            onClick={handleDownloadSampleTemplate}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer border border-slate-200 shadow-2xs"
            title="Download ready-to-use CSV Excel sample contact template file"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Download Sample Excel Template</span>
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
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-black text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer hover:shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Add Contact</span>
          </button>
        </div>
      </div>

      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search contacts by name, 10-digit phone, email, address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 shadow-xs"
          />
        </div>

        <button
          type="button"
          onClick={fetchContacts}
          disabled={refreshing}
          className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200 shadow-xs"
        >
          <RotateCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-sky-600' : ''}`} />
          <span>Refresh List</span>
        </button>
      </div>

      {/* CONTACTS CARDS GRID (User Management Style) */}
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
            Add your first contact via normal form fill or upload a mass contact Excel sheet.
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

            return (
              <div
                key={contact.id}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] hover:shadow-xl hover:border-sky-300 transition-all duration-200 flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  {/* Avatar (Uploaded Meta Image or Initial) & Status */}
                  <div className="flex items-start justify-between">
                    <div className="relative w-12 h-12 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                      {contact.image_url ? (
                        <img src={contact.image_url} alt={contact.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-sky-100 text-sky-800 font-black text-lg flex items-center justify-center">
                          {(contact.name || 'C').charAt(0)}
                        </div>
                      )}
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white bg-emerald-500" />
                    </div>

                    <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] font-mono border bg-emerald-50 text-emerald-700 border-emerald-200">
                      {contact.status || 'Active'}
                    </span>
                  </div>

                  {/* Contact Name */}
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 group-hover:text-sky-600 transition-colors truncate">
                      {contact.name}
                    </h3>
                  </div>

                  {/* Phone, Email, Address */}
                  <div className="space-y-1.5 text-xs pt-1">
                    <div className="flex items-center gap-2 text-emerald-700 font-bold font-mono">
                      <Phone className="w-3.5 h-3.5 shrink-0" />
                      <span>{contact.phone}</span>
                    </div>

                    {contact.email && (
                      <div className="flex items-center gap-2 text-slate-600 font-medium truncate font-mono">
                        <Mail className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                        <span className="truncate">{contact.email}</span>
                      </div>
                    )}

                    {contact.address && (
                      <div className="flex items-start gap-2 text-slate-500 text-[11px] font-medium leading-tight pt-1">
                        <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{contact.address}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Read Rate Badge */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-400 font-bold uppercase font-mono">Read Rate</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-black font-mono flex items-center gap-1">
                    <Activity className="w-3 h-3 text-emerald-600" />
                    <span>{contact.read_rate || '100%'}</span>
                  </span>
                </div>

                {/* Action Buttons: WhatsApp Blast, Direct Chat, Call, Delete */}
                <div className="pt-2 flex items-center justify-between gap-1.5 border-t border-slate-100">
                  {/* WhatsApp Blast Trigger */}
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
                    href={`https://wa.me/${cleanPhone}`}
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
                    onClick={() => handleDeleteContact(contact.id, contact.name)}
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
      {/* MODAL 1: NORMAL FORM FILL WITH META ACCOUNT IMAGE UPLOAD                   */}
      {/* ========================================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-150">
            
            {/* Header */}
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-xs">
                  <BookUser className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Add Meta Contact (Normal Form Fill)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Upload Meta profile picture, enter 10-digit mobile number, email, and address.
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

            {/* Form */}
            <form onSubmit={handleSubmitContact} id="contact-form" className="p-6 space-y-4">
              
              {/* Meta Account Image Upload */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Meta Account Profile Picture Upload
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                    {formData.image_url ? (
                      <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-slate-400" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <input
                      type="file"
                      ref={metaImageInputRef}
                      accept="image/*"
                      onChange={handleImageFileSelected}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => metaImageInputRef.current?.click()}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs inline-flex items-center gap-2 border border-slate-200 transition-colors cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5 text-sky-600" />
                      <span>{formData.image_url ? 'Change Image' : 'Select Image File'}</span>
                    </button>
                    <p className="text-[10px] text-slate-400 mt-1 font-medium">Supports JPG, PNG, WEBP up to 5MB</p>
                  </div>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikramaditya Verma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* WhatsApp Mobile Number (10 Digits Only) */}
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
                      phoneError ? 'border-rose-500' : 'border-slate-200 focus:border-sky-500'
                    }`}
                  />
                </div>
                {phoneError ? (
                  <p className="text-[10px] text-rose-600 font-bold mt-1">{phoneError}</p>
                ) : (
                  <p className="text-[10px] text-emerald-600 font-semibold mt-1">✓ Formatted as +91 XXXXX XXXXX (10 digits only)</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    placeholder="vikram@enterprise.in"
                    value={formData.email}
                    onChange={handleEmailChange}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border text-xs font-mono text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none ${
                      emailError ? 'border-rose-500' : 'border-slate-200 focus:border-sky-500'
                    }`}
                  />
                </div>
                {emailError && <p className="text-[10px] text-rose-600 font-bold mt-1">{emailError}</p>}
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Address
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <textarea
                    rows={2}
                    placeholder="Residential or business address..."
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

            </form>

            {/* Footer */}
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
                form="contact-form"
                disabled={submitting || !!phoneError || !!emailError}
                className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-black text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                {submitting ? <RotateCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>{submitting ? 'Saving...' : 'Save Meta Contact'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: UPLOAD EXCEL SHEET MASS CONTACT IMPORT                           */}
      {/* ========================================================================= */}
      {showUploadExcelModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-150">
            
            {/* Header */}
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Upload Contact Excel Sheet
                  </h3>
                  <p className="text-xs text-slate-500">
                    Upload your mass contact CSV or Excel sheet file for instant database import.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowUploadExcelModal(false);
                  setExcelPreviewData([]);
                  setExcelFileName('');
                }}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer border border-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* File Upload Box */}
              <div className="p-6 rounded-2xl border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50/50 hover:bg-emerald-50/30 transition-all text-center space-y-3">
                <FileSpreadsheet className="w-10 h-10 text-emerald-600 mx-auto" />
                <div>
                  <div className="text-xs font-extrabold text-slate-800">
                    {excelFileName ? `Selected: ${excelFileName}` : 'Select or Drag & Drop Excel / CSV Sheet'}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Columns: Name, Phone (10 digits), Email, Address, Status</p>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".csv, .xlsx, .xls"
                  onChange={handleExcelFileUploaded}
                  className="hidden"
                />

                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center gap-2 shadow-xs transition-all cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Choose Excel File</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadSampleTemplate}
                    className="px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs inline-flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Demo Template</span>
                  </button>
                </div>
              </div>

              {/* Preview Table */}
              {excelPreviewData.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                    <span>Preview Contacts ({excelPreviewData.length} Found)</span>
                    <span className="text-emerald-700 font-mono text-[11px]">Ready to Import</span>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-700 font-mono text-[10px] uppercase">
                        <tr>
                          <th className="p-2 border-b">Name</th>
                          <th className="p-2 border-b">Phone</th>
                          <th className="p-2 border-b">Email</th>
                          <th className="p-2 border-b">Address</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-[11px]">
                        {excelPreviewData.map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="p-2 font-bold text-slate-900">{row.name}</td>
                            <td className="p-2 font-mono text-emerald-700 font-bold">{row.phone}</td>
                            <td className="p-2 text-slate-500">{row.email}</td>
                            <td className="p-2 text-slate-500 truncate max-w-[150px]">{row.address}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setShowUploadExcelModal(false);
                  setExcelPreviewData([]);
                  setExcelFileName('');
                }}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleBulkImportSubmit}
                disabled={importingExcel || excelPreviewData.length === 0}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                {importingExcel ? <RotateCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>{importingExcel ? 'Importing...' : `Import ${excelPreviewData.length} Contacts to Database`}</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
