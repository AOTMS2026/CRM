import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Plus, 
  Search, 
  RotateCw, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Edit3, 
  ExternalLink, 
  Phone, 
  Image as ImageIcon, 
  FileText, 
  X, 
  Sparkles, 
  Check, 
  Eye, 
  ChevronRight,
  Send,
  UploadCloud,
  HelpCircle,
  Smartphone
} from 'lucide-react';
import { IoLogoWhatsapp as WhatsApp } from 'react-icons/io5';

export default function WhatsappMessage() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal & Preview state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('success');

  // Create Template Form State
  const [formData, setFormData] = useState({
    name: '',
    category: 'MARKETING',
    language: 'en_US',
    header_type: 'IMAGE', // 'NONE', 'TEXT', 'IMAGE'
    header_text: '',
    header_image_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80',
    body_text: 'Hello {{1}}! Welcome to AOTMS Enterprise Solutions. Claim your exclusive discount code {{2}} on all WhatsApp automation tools.',
    footer_text: 'Reply STOP to unsubscribe • AOTMS',
    buttons: [
      { type: 'QUICK_REPLY', text: 'Claim Offer 🚀', url: '', phone_number: '' },
      { type: 'URL', text: 'Visit Website', url: 'https://aotms.com', phone_number: '' }
    ],
    sample_values: ['John', 'AOTMS2026']
  });

  const getApiBase = () => {
    return (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
      ? 'http://127.0.0.1:8000'
      : (import.meta.env.VITE_API_BASE_URL || 'https://crm-fee1.onrender.com');
  };

  const showToast = (msg, type = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 5000);
  };

  const fetchTemplates = async () => {
    setRefreshing(true);
    try {
      const res = await fetch(`${getApiBase()}/api/integrations/whatsapp/templates`);
      const data = await res.json();
      if (data && data.success && Array.isArray(data.templates)) {
        setTemplates(data.templates);
      }
    } catch (err) {
      console.error("Failed to load templates:", err);
      showToast("Notice: Loaded local template cache", "info");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleCreateTemplate = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    // Format template name to strictly lowercase + underscores
    const formattedName = formData.name.toLowerCase().trim().replace(/[^a-z0-9_]/g, '_');
    if (!formattedName) {
      showToast("Please enter a valid template name (lowercase + underscores).", "error");
      setSubmitting(false);
      return;
    }

    const payload = {
      ...formData,
      name: formattedName
    };

    try {
      const res = await fetch(`${getApiBase()}/api/integrations/whatsapp/templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.detail || "Failed to create template on Meta Cloud API.");
      }

      showToast(result.message || `Template '${formattedName}' created successfully!`, "success");
      setShowCreateModal(false);
      fetchTemplates();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTemplate = async (templateName) => {
    if (!window.confirm(`Are you sure you want to delete template '${templateName}' from Meta and CRM?`)) return;

    try {
      const res = await fetch(`${getApiBase()}/api/integrations/whatsapp/templates/${templateName}`, {
        method: 'DELETE'
      });
      const result = await res.json();
      if (res.ok) {
        showToast(`Template '${templateName}' deleted successfully.`, "success");
        fetchTemplates();
      } else {
        throw new Error(result.detail || "Error deleting template.");
      }
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleEditTemplate = (tmpl) => {
    let parsedButtons = [];
    try {
      parsedButtons = typeof tmpl.buttons === 'string' ? JSON.parse(tmpl.buttons) : (tmpl.buttons || []);
    } catch (e) {
      parsedButtons = [];
    }

    setFormData({
      name: tmpl.name,
      category: tmpl.category || 'MARKETING',
      language: tmpl.language || 'en_US',
      header_type: tmpl.header_type || 'NONE',
      header_text: tmpl.header_type === 'TEXT' ? tmpl.header_content : '',
      header_image_url: tmpl.header_type === 'IMAGE' ? tmpl.header_content : '',
      body_text: tmpl.body_text || '',
      footer_text: tmpl.footer_text || '',
      buttons: parsedButtons,
      sample_values: ['Customer', 'AOTMS2026']
    });
    setShowCreateModal(true);
  };

  const addVariableToBody = () => {
    const matches = formData.body_text.match(/\{\{(\d+)\}\}/g) || [];
    const nextIndex = matches.length + 1;
    setFormData(prev => ({
      ...prev,
      body_text: prev.body_text + ` {{${nextIndex}}}`,
      sample_values: [...(prev.sample_values || []), `Value${nextIndex}`]
    }));
  };

  const addButton = (type) => {
    if (formData.buttons.length >= 3) {
      showToast("Maximum 3 buttons allowed per template by Meta.", "info");
      return;
    }
    setFormData(prev => ({
      ...prev,
      buttons: [...prev.buttons, {
        type: type,
        text: type === 'URL' ? 'Visit Website' : (type === 'PHONE_NUMBER' ? 'Call Support' : 'Quick Reply'),
        url: type === 'URL' ? 'https://aotms.com' : '',
        phone_number: type === 'PHONE_NUMBER' ? '+919876543210' : ''
      }]
    }));
  };

  const removeButton = (index) => {
    setFormData(prev => ({
      ...prev,
      buttons: prev.buttons.filter((_, i) => i !== index)
    }));
  };

  // Render live sample text replacing {{1}}, {{2}} with preview sample values
  const renderPreviewBody = (text, samples = []) => {
    let output = text;
    (samples || []).forEach((val, idx) => {
      output = output.replace(new RegExp(`\\{\\{${idx + 1}\\}\\}`, 'g'), val || `[Param ${idx + 1}]`);
    });
    return output;
  };

  const filteredTemplates = templates.filter(t => {
    const matchesCategory = filterCategory === 'ALL' || t.category.toUpperCase() === filterCategory;
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.body_text.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      
      {/* Toast Banner */}
      {toastMessage && (
        <div className={`p-4 rounded-xl border text-xs font-bold flex items-center justify-between shadow-md transition-all animate-in fade-in ${
          toastType === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800' :
          toastType === 'info' ? 'bg-sky-50 border-sky-200 text-sky-800' :
          'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}>
          <div className="flex items-center gap-2.5">
            {toastType === 'error' ? <X className="w-4 h-4 text-rose-600" /> : <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs">
              <WhatsApp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                Whatsapp_Messages & Meta Templates Studio
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Design official Meta WhatsApp message templates (Utility & Marketing), upload image headers, configure quick replies, and preview live messages.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchTemplates}
            disabled={refreshing}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
          >
            <RotateCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-emerald-600' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setFormData({
                name: '',
                category: 'MARKETING',
                language: 'en_US',
                header_type: 'IMAGE',
                header_text: '',
                header_image_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80',
                body_text: 'Hello {{1}}! Welcome to AOTMS Enterprise Solutions. Claim your exclusive discount code {{2}} on all WhatsApp automation tools.',
                footer_text: 'Reply STOP to unsubscribe • AOTMS',
                buttons: [
                  { type: 'QUICK_REPLY', text: 'Claim Offer 🚀', url: '', phone_number: '' },
                  { type: 'URL', text: 'Visit Website', url: 'https://aotms.com', phone_number: '' }
                ],
                sample_values: ['John', 'AOTMS2026']
              });
              setShowCreateModal(true);
            }}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer hover:shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Create Template</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {['ALL', 'MARKETING', 'UTILITY', 'AUTHENTICATION'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 border ${
                filterCategory === cat
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat === 'ALL' ? 'All Templates' : cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 shadow-xs"
          />
        </div>
      </div>

      {/* Templates Grid */}
      {loading ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
          <RotateCw className="w-6 h-6 animate-spin text-emerald-600 mx-auto mb-2" />
          <p className="text-xs text-slate-500 font-semibold">Loading Meta templates...</p>
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No message templates found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Create your first official Meta WhatsApp template for Marketing broadcasts or Utility notifications.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Template</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTemplates.map((tmpl) => {
            let parsedButtons = [];
            try {
              parsedButtons = typeof tmpl.buttons === 'string' ? JSON.parse(tmpl.buttons) : (tmpl.buttons || []);
            } catch (e) {
              parsedButtons = [];
            }

            return (
              <div 
                key={tmpl.id || tmpl.name}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 hover:border-emerald-300 group"
              >
                {/* Top Badge Row */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black border ${
                      tmpl.category === 'MARKETING' 
                        ? 'bg-purple-50 text-purple-700 border-purple-200' 
                        : 'bg-teal-50 text-teal-700 border-teal-200'
                    }`}>
                      {tmpl.category}
                    </span>

                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>{tmpl.status || 'APPROVED'}</span>
                    </span>
                  </div>

                  <h3 className="text-sm font-extrabold text-slate-900 font-mono tracking-tight group-hover:text-emerald-700 transition-colors">
                    {tmpl.name}
                  </h3>

                  {/* Header preview tag */}
                  {tmpl.header_type !== 'NONE' && (
                    <div className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                      {tmpl.header_type === 'IMAGE' ? <ImageIcon className="w-3.5 h-3.5 text-sky-600" /> : <FileText className="w-3.5 h-3.5 text-amber-600" />}
                      <span>Header: {tmpl.header_type}</span>
                    </div>
                  )}

                  {/* Body Text snippet */}
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100 font-normal">
                    {tmpl.body_text}
                  </p>

                  {/* Buttons count badge */}
                  {parsedButtons.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {parsedButtons.map((btn, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[10px] font-semibold flex items-center gap-1 border border-slate-200">
                          {btn.type === 'URL' ? <ExternalLink className="w-2.5 h-2.5 text-sky-600" /> :
                           btn.type === 'PHONE_NUMBER' ? <Phone className="w-2.5 h-2.5 text-emerald-600" /> :
                           <Send className="w-2.5 h-2.5 text-purple-600" />}
                          <span>{btn.text}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] font-mono text-slate-400">
                    {tmpl.language || 'en_US'}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setPreviewTemplate(tmpl)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-emerald-100 text-slate-600 hover:text-emerald-700 border border-slate-200 transition-colors cursor-pointer"
                      title="Preview WhatsApp Chat"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEditTemplate(tmpl)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-sky-100 text-slate-600 hover:text-sky-700 border border-slate-200 transition-colors cursor-pointer"
                      title="Edit / Duplicate"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteTemplate(tmpl.name)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 border border-slate-200 transition-colors cursor-pointer"
                      title="Delete from Meta & DB"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: CREATE / EDIT TEMPLATE STUDIO WITH LIVE PHONE PREVIEW             */}
      {/* ========================================================================= */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="relative w-full max-w-5xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                  <WhatsApp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Create Message Template
                  </h3>
                  <p className="text-xs text-slate-500">
                    Configure your template and preview live in realistic WhatsApp mode.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer border border-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Split Content: Form Left, WhatsApp Phone Preview Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-y-auto">
              
              {/* LEFT COLUMN: FORM CONTROLS (7 Cols) */}
              <form onSubmit={handleCreateTemplate} id="template-create-form" className="lg:col-span-7 p-6 space-y-5 border-r border-slate-200 overflow-y-auto">
                
                {/* 1. Category Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    1. Template Category <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, category: 'MARKETING' })}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        formData.category === 'MARKETING'
                          ? 'bg-purple-50/60 border-purple-500 ring-2 ring-purple-500/20 text-purple-900'
                          : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <div className="text-xs font-extrabold">Marketing</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">Offers, welcome deals, product drops</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, category: 'UTILITY' })}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        formData.category === 'UTILITY'
                          ? 'bg-teal-50/60 border-teal-500 ring-2 ring-teal-500/20 text-teal-900'
                          : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <div className="text-xs font-extrabold">Utility</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">Order updates, receipts, billing alerts</div>
                    </button>
                  </div>
                </div>

                {/* 2. Template Name & Language */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      2. Template Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. welcome_offer_2026"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_') })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Lowercase letters and underscores only.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Language
                    </label>
                    <select
                      value={formData.language}
                      onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      <option value="en_US">English (US) - en_US</option>
                      <option value="en_GB">English (UK) - en_GB</option>
                      <option value="hi_IN">Hindi - hi_IN</option>
                      <option value="te_IN">Telugu - te_IN</option>
                    </select>
                  </div>
                </div>

                {/* 3. Header Media Type */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-800">
                    3. Header (Optional)
                  </label>
                  <div className="flex items-center gap-4">
                    {['NONE', 'IMAGE', 'TEXT'].map((type) => (
                      <label key={type} className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                        <input
                          type="radio"
                          name="header_type"
                          value={type}
                          checked={formData.header_type === type}
                          onChange={() => setFormData({ ...formData, header_type: type })}
                          className="accent-emerald-600"
                        />
                        <span className="font-semibold">{type === 'IMAGE' ? 'Image Upload' : type}</span>
                      </label>
                    ))}
                  </div>

                  {formData.header_type === 'TEXT' && (
                    <input
                      type="text"
                      placeholder="Enter header title text..."
                      value={formData.header_text}
                      onChange={(e) => setFormData({ ...formData, header_text: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                    />
                  )}

                  {formData.header_type === 'IMAGE' && (
                    <div className="space-y-2">
                      <input
                        type="url"
                        placeholder="Image URL (e.g. https://images.unsplash.com/...)"
                        value={formData.header_image_url}
                        onChange={(e) => setFormData({ ...formData, header_image_url: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                      />
                      <p className="text-[10px] text-slate-400">
                        Official Meta image format: 16:9 ratio, JPG/PNG under 5MB.
                      </p>
                    </div>
                  )}
                </div>

                {/* 4. Body Text with Variable Buttons */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-800">
                      4. Message Body <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={addVariableToBody}
                      className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200 cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Insert Variable</span>
                    </button>
                  </div>

                  <textarea
                    rows={4}
                    required
                    value={formData.body_text}
                    onChange={(e) => setFormData({ ...formData, body_text: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 font-normal leading-relaxed"
                  />
                  <p className="text-[10px] text-slate-400">
                    Use <code className="font-bold text-slate-700 font-mono">{'{{1}}'}</code>, <code className="font-bold text-slate-700 font-mono">{'{{2}}'}</code> for dynamic client parameters (Customer Name, Order ID).
                  </p>
                </div>

                {/* 5. Footer Text */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    5. Footer Text (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Reply STOP to unsubscribe • AOTMS"
                    value={formData.footer_text}
                    onChange={(e) => setFormData({ ...formData, footer_text: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* 6. Interactive Action Buttons */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-800">
                      6. Interactive Buttons (Max 3)
                    </label>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => addButton('QUICK_REPLY')}
                        className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                      >
                        + Quick Reply
                      </button>
                      <button
                        type="button"
                        onClick={() => addButton('URL')}
                        className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                      >
                        + Website URL
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {formData.buttons.map((btn, index) => (
                      <div key={index} className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                        <span className="font-mono text-[10px] font-bold text-slate-400 w-4">{index + 1}.</span>
                        <input
                          type="text"
                          placeholder="Button Text"
                          value={btn.text}
                          onChange={(e) => {
                            const newBtns = [...formData.buttons];
                            newBtns[index].text = e.target.value;
                            setFormData({ ...formData, buttons: newBtns });
                          }}
                          className="flex-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-800"
                        />
                        {btn.type === 'URL' && (
                          <input
                            type="url"
                            placeholder="https://aotms.com"
                            value={btn.url}
                            onChange={(e) => {
                              const newBtns = [...formData.buttons];
                              newBtns[index].url = e.target.value;
                              setFormData({ ...formData, buttons: newBtns });
                            }}
                            className="flex-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-mono text-slate-700"
                          />
                        )}
                        <button
                          type="button"
                          onClick={() => removeButton(index)}
                          className="text-slate-400 hover:text-rose-600 cursor-pointer p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

              </form>

              {/* RIGHT COLUMN: REALISTIC WHATSAPP PHONE PREVIEW (5 Cols) */}
              <div className="lg:col-span-5 p-6 bg-slate-100/70 flex flex-col items-center justify-center overflow-y-auto">
                <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden flex flex-col">
                  
                  {/* WhatsApp Phone Mock Header */}
                  <div className="bg-[#075e54] text-white p-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-emerald-400 text-emerald-950 font-black text-xs flex items-center justify-center shadow-xs">
                        A
                      </div>
                      <div>
                        <div className="text-xs font-bold flex items-center gap-1 leading-tight">
                          <span>AOTMS Official</span>
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-300 text-emerald-900 text-[8px] flex items-center justify-center font-bold">✓</span>
                        </div>
                        <div className="text-[10px] text-emerald-100/80">Business Account</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono bg-[#128c7e] px-2 py-0.5 rounded text-white">Live Preview</span>
                  </div>

                  {/* Chat Wallpaper Canvas */}
                  <div className="p-4 bg-[#efeae2] flex-1 min-h-[360px] space-y-3">
                    
                    {/* Message Bubble */}
                    <div className="bg-white rounded-2xl rounded-tl-none p-3 shadow-sm border border-slate-200/60 space-y-2 max-w-[95%]">
                      
                      {/* Image Header Preview */}
                      {formData.header_type === 'IMAGE' && formData.header_image_url && (
                        <div className="rounded-xl overflow-hidden max-h-40 w-full bg-slate-100">
                          <img 
                            src={formData.header_image_url} 
                            alt="Header Preview" 
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80"; }}
                          />
                        </div>
                      )}

                      {/* Text Header Preview */}
                      {formData.header_type === 'TEXT' && formData.header_text && (
                        <h4 className="text-xs font-black text-slate-900 pb-1 border-b border-slate-100">
                          {formData.header_text}
                        </h4>
                      )}

                      {/* Body Text with Live Variable Replacement */}
                      <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-line font-normal">
                        {renderPreviewBody(formData.body_text, formData.sample_values)}
                      </p>

                      {/* Footer */}
                      {formData.footer_text && (
                        <p className="text-[10px] text-slate-400 font-medium">
                          {formData.footer_text}
                        </p>
                      )}

                      {/* Time & Double Checkmarks */}
                      <div className="flex items-center justify-end gap-1 text-[9px] text-slate-400 font-mono">
                        <span>10:45 AM</span>
                        <span className="text-sky-500 font-bold">✓✓</span>
                      </div>
                    </div>

                    {/* Interactive Action Buttons Preview */}
                    {formData.buttons && formData.buttons.length > 0 && (
                      <div className="space-y-1.5 max-w-[95%]">
                        {formData.buttons.map((btn, i) => (
                          <div 
                            key={i}
                            className="p-2.5 rounded-xl bg-white/95 border border-slate-200 shadow-xs text-center text-xs font-bold text-sky-600 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            {btn.type === 'URL' ? <ExternalLink className="w-3.5 h-3.5" /> : 
                             btn.type === 'PHONE_NUMBER' ? <Phone className="w-3.5 h-3.5" /> : 
                             <Send className="w-3.5 h-3.5" />}
                            <span>{btn.text}</span>
                          </div>
                        ))}
                      </div>
                    )}

                  </div>

                </div>
              </div>

            </div>

            {/* Modal Bottom Action Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                form="template-create-form"
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                {submitting ? <RotateCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>{submitting ? 'Saving to Meta & Neon DB...' : 'Create Template on Meta'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: STANDALONE CHAT PREVIEW POPUP                                    */}
      {/* ========================================================================= */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col animate-in zoom-in-95 duration-150">
            
            <div className="bg-[#075e54] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <WhatsApp className="w-5 h-5 text-emerald-300" />
                <div>
                  <div className="text-xs font-bold font-mono">{previewTemplate.name}</div>
                  <div className="text-[10px] text-emerald-100">{previewTemplate.category} • {previewTemplate.language}</div>
                </div>
              </div>
              <button 
                onClick={() => setPreviewTemplate(null)}
                className="p-1 rounded-lg bg-emerald-800/80 hover:bg-emerald-900 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-[#efeae2] min-h-[320px] space-y-3">
              <div className="bg-white rounded-2xl rounded-tl-none p-3.5 shadow-sm border border-slate-200/60 space-y-2">
                {previewTemplate.header_type === 'IMAGE' && previewTemplate.header_content && (
                  <div className="rounded-xl overflow-hidden max-h-40 w-full bg-slate-100">
                    <img src={previewTemplate.header_content} alt="Header" className="w-full h-full object-cover" />
                  </div>
                )}
                {previewTemplate.header_type === 'TEXT' && previewTemplate.header_content && (
                  <h4 className="text-xs font-black text-slate-900 pb-1 border-b border-slate-100">
                    {previewTemplate.header_content}
                  </h4>
                )}
                <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-line">
                  {renderPreviewBody(previewTemplate.body_text, ['Customer', 'AOTMS2026'])}
                </p>
                {previewTemplate.footer_text && (
                  <p className="text-[10px] text-slate-400 font-medium">{previewTemplate.footer_text}</p>
                )}
                <div className="flex items-center justify-end gap-1 text-[9px] text-slate-400 font-mono">
                  <span>10:45 AM</span>
                  <span className="text-sky-500 font-bold">✓✓</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setPreviewTemplate(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-900 text-white font-bold text-xs cursor-pointer"
              >
                Close Preview
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
