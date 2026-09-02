import React, { useState, useEffect, useRef } from 'react';
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
  Smartphone,
  UserCheck,
  Link2,
  FileUp,
  FolderOpen
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

  // Image Upload Type: 'file' (Local upload) or 'url' (Web URL)
  const [imageUploadMode, setImageUploadMode] = useState('file');
  const [dragActive, setDragActive] = useState(false);
  const [localImageName, setLocalImageName] = useState('');
  const [localImageSize, setLocalImageSize] = useState('');
  const fileInputRef = useRef(null);
  const previewChatRef = useRef(null);
  const previewModalChatRef = useRef(null);

  // Create Template Form State (Declared BEFORE useEffect)
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
      { type: 'WHATSAPP_CALL', text: 'Call on WhatsApp', phone_number: '+919876543210', url: '', contact_name: '' },
      { type: 'PHONE_NUMBER', text: 'Call Support', phone_number: '+919876543210', url: '', contact_name: '' },
      { type: 'CONTACT', text: 'Share Contact Info', phone_number: '+919876543210', url: '', contact_name: 'AOTMS Official' }
    ],
    sample_values: ['John', 'AOTMS2026']
  });

  // Automatic smooth scroll behavior when content or buttons change
  useEffect(() => {
    if (previewChatRef.current) {
      const el = previewChatRef.current;
      setTimeout(() => {
        el.scrollTo({
          top: el.scrollHeight,
          behavior: 'smooth'
        });
      }, 50);
    }
  }, [
    formData.buttons.length, 
    formData.body_text, 
    formData.header_image_url, 
    formData.header_text, 
    formData.header_type
  ]);

  // Scroll to top upon opening standalone preview
  useEffect(() => {
    if (previewTemplate && previewModalChatRef.current) {
      setTimeout(() => {
        previewModalChatRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      }, 80);
    }
  }, [previewTemplate]);

  const getApiBase = () => {
    return import.meta.env.VITE_API_BASE_URL || 'https://crm-fee1.onrender.com';
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

  // Handle local image file upload & reading into base64 DataURL
  const handleLocalImageFile = (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast("Please upload a valid image file (PNG, JPG, JPEG, WEBP).", "error");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast("Image size exceeds 5MB limit. Please upload a smaller image.", "error");
      return;
    }

    setLocalImageName(file.name);
    setLocalImageSize((file.size / (1024 * 1024)).toFixed(2) + ' MB');

    const reader = new FileReader();
    reader.onload = (e) => {
      setFormData(prev => ({
        ...prev,
        header_image_url: e.target.result
      }));
      showToast(`Local image "${file.name}" loaded for template header!`, "success");
    };
    reader.readAsDataURL(file);
  };

  // Drag & drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleLocalImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleCreateTemplate = async (e) => {
    e.preventDefault();
    setSubmitting(true);

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
    setLocalImageName(tmpl.header_type === 'IMAGE' ? 'Existing Image' : '');
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

  // Button types configuration
  const buttonTypeOptions = [
    { type: 'PHONE_NUMBER', label: 'Call Phone Number', icon: Phone, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    { type: 'WHATSAPP_CALL', label: 'Call on WhatsApp', icon: WhatsApp, color: 'text-emerald-700 bg-emerald-100/70 border-emerald-300' },
    { type: 'CONTACT', label: 'Share Contact Info', icon: UserCheck, color: 'text-amber-700 bg-amber-50 border-amber-200' },
    { type: 'CUSTOM', label: 'Custom', icon: Send, color: 'text-purple-700 bg-purple-50 border-purple-200' },
    { type: 'URL', label: 'Website Link', icon: ExternalLink, color: 'text-sky-700 bg-sky-50 border-sky-200' }
  ];

  const addButton = (type) => {
    if (formData.buttons.length >= 3) {
      showToast("Meta allows maximum 3 interactive buttons per message template.", "info");
      return;
    }

    let defaultText = 'Custom Reply';
    let defaultUrl = '';
    let defaultPhone = '+919876543210';
    let defaultContact = 'AOTMS Official';

    if (type === 'PHONE_NUMBER') defaultText = 'Call Phone Number';
    if (type === 'WHATSAPP_CALL') defaultText = 'Call on WhatsApp';
    if (type === 'CONTACT') defaultText = 'Share Contact Info';
    if (type === 'URL') { defaultText = 'Visit Website'; defaultUrl = 'https://aotms.com'; }
    if (type === 'CUSTOM') defaultText = 'Yes, I am Interested';

    setFormData(prev => ({
      ...prev,
      buttons: [...prev.buttons, {
        type: type,
        text: defaultText,
        url: defaultUrl,
        phone_number: defaultPhone,
        contact_name: defaultContact
      }]
    }));
  };

  const removeButton = (index) => {
    setFormData(prev => ({
      ...prev,
      buttons: prev.buttons.filter((_, i) => i !== index)
    }));
  };

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
                Upload local images, configure interactive buttons (Call Phone Number, Call on WhatsApp, Share Contact Info), and create official Meta templates.
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
                  { type: 'WHATSAPP_CALL', text: 'Call on WhatsApp', phone_number: '+919876543210', url: '', contact_name: '' },
                  { type: 'PHONE_NUMBER', text: 'Call Support', phone_number: '+919876543210', url: '', contact_name: '' },
                  { type: 'CONTACT', text: 'Share Contact Info', phone_number: '+919876543210', url: '', contact_name: 'AOTMS Official' }
                ],
                sample_values: ['John', 'AOTMS2026']
              });
              setLocalImageName('');
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
                          {btn.type === 'WHATSAPP_CALL' ? <WhatsApp className="w-3 h-3 text-emerald-600" /> :
                           btn.type === 'PHONE_NUMBER' ? <Phone className="w-2.5 h-2.5 text-emerald-600" /> :
                           btn.type === 'CONTACT' ? <UserCheck className="w-2.5 h-2.5 text-amber-600" /> :
                           btn.type === 'URL' ? <ExternalLink className="w-2.5 h-2.5 text-sky-600" /> :
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
                    Create Message Template & Actions Studio
                  </h3>
                  <p className="text-xs text-slate-500">
                    Upload local images, configure action buttons (Call Phone Number, Call on WhatsApp, Share Contact Info, Custom), and preview live.
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
                      <div className="text-[11px] text-slate-500 mt-0.5">Offers, welcome deals, product launches</div>
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
                      <div className="text-[11px] text-slate-500 mt-0.5">Order receipts, transactional alerts, OTP</div>
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
                      placeholder="e.g. customer_welcome_offer"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_') })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Lowercase letters, numbers, and underscores only.</p>
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

                {/* 3. Header Media Type & Local Image Upload */}
                <div className="space-y-3 p-4 rounded-2xl bg-slate-50/70 border border-slate-200">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-800">
                      3. Header Media (Image Upload / Text)
                    </label>
                    <div className="flex items-center gap-3">
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
                          <span className="font-semibold">{type === 'IMAGE' ? 'Image' : type}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {formData.header_type === 'TEXT' && (
                    <input
                      type="text"
                      placeholder="Enter bold header title text..."
                      value={formData.header_text}
                      onChange={(e) => setFormData({ ...formData, header_text: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                    />
                  )}

                  {formData.header_type === 'IMAGE' && (
                    <div className="space-y-2.5">
                      {/* Upload Mode Selector: Local Upload vs URL */}
                      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                        <button
                          type="button"
                          onClick={() => setImageUploadMode('file')}
                          className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                            imageUploadMode === 'file' 
                              ? 'bg-emerald-600 text-white' 
                              : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                          }`}
                        >
                          <FolderOpen className="w-3.5 h-3.5" />
                          <span>Local Image Upload</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setImageUploadMode('url')}
                          className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                            imageUploadMode === 'url' 
                              ? 'bg-emerald-600 text-white' 
                              : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                          }`}
                        >
                          <Link2 className="w-3.5 h-3.5" />
                          <span>Web Image URL</span>
                        </button>
                      </div>

                      {/* Local File Upload Drag & Drop Zone */}
                      {imageUploadMode === 'file' ? (
                        <div>
                          <input 
                            ref={fileInputRef}
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handleLocalImageFile(e.target.files[0]);
                              }
                            }}
                          />

                          <div
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`p-5 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-2 bg-white ${
                              dragActive 
                                ? 'border-emerald-500 bg-emerald-50/50' 
                                : 'border-slate-300 hover:border-emerald-400 hover:bg-slate-50/50'
                            }`}
                          >
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs">
                              <FileUp className="w-5 h-5" />
                            </div>

                            {localImageName ? (
                              <div className="space-y-0.5">
                                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5 justify-center">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>{localImageName}</span>
                                </div>
                                <div className="text-[10px] text-slate-400 font-mono">{localImageSize} • Click to change file</div>
                              </div>
                            ) : (
                              <div className="space-y-0.5">
                                <div className="text-xs font-bold text-slate-800">
                                  Click to browse or drag & drop local image
                                </div>
                                <div className="text-[10px] text-slate-400">
                                  Supports PNG, JPG, JPEG, WEBP (Max 5MB)
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <input
                            type="url"
                            placeholder="Paste image URL (e.g. https://images.unsplash.com/...)"
                            value={formData.header_image_url}
                            onChange={(e) => setFormData({ ...formData, header_image_url: e.target.value })}
                            className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                      )}

                      {formData.header_image_url && (
                        <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white border border-slate-200">
                          <img 
                            src={formData.header_image_url} 
                            alt="Header thumbnail" 
                            className="w-12 h-10 object-cover rounded-lg border border-slate-200" 
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-[11px] font-bold text-slate-800 truncate">
                              {localImageName || 'Header Image Loaded'}
                            </div>
                            <div className="text-[10px] text-emerald-600 font-semibold">Active in Live Preview</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({ ...prev, header_image_url: '' }));
                              setLocalImageName('');
                            }}
                            className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                            title="Remove Image"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
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
                      className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 cursor-pointer flex items-center gap-1"
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
                    Use <code className="font-bold text-slate-700 font-mono">{'{{1}}'}</code>, <code className="font-bold text-slate-700 font-mono">{'{{2}}'}</code> for client variables (Name, Amount, Promo Code).
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

                {/* 6. Interactive Action Buttons (Complete Flow) */}
                <div className="space-y-3 p-4 rounded-2xl bg-slate-50/70 border border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-xs font-bold text-slate-800">
                        6. Interactive Action Buttons ({formData.buttons.length}/3)
                      </label>
                      <span className="text-[10px] text-slate-500">
                        Select an action button to attach to the WhatsApp message:
                      </span>
                    </div>
                  </div>

                  {/* Button Type Selector Strip */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {buttonTypeOptions.map((opt) => {
                      const Icon = opt.icon;
                      return (
                        <button
                          key={opt.type}
                          type="button"
                          onClick={() => addButton(opt.type)}
                          disabled={formData.buttons.length >= 3}
                          className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${opt.color} hover:shadow-xs`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span>+ {opt.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Buttons List Editor */}
                  <div className="space-y-2.5 pt-1">
                    {formData.buttons.map((btn, index) => {
                      const opt = buttonTypeOptions.find(o => o.type === btn.type) || buttonTypeOptions[0];
                      const Icon = opt.icon;

                      return (
                        <div key={index} className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-mono text-[10px] font-bold flex items-center justify-center">
                                {index + 1}
                              </span>
                              <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border flex items-center gap-1 ${opt.color}`}>
                                <Icon className="w-3 h-3" />
                                <span>{opt.label}</span>
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => removeButton(index)}
                              className="text-slate-400 hover:text-rose-600 cursor-pointer p-1 rounded hover:bg-rose-50"
                              title="Delete Button"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Dynamic Button Inputs based on type */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Button Display Text</label>
                              <input
                                type="text"
                                required
                                value={btn.text}
                                onChange={(e) => {
                                  const newBtns = [...formData.buttons];
                                  newBtns[index].text = e.target.value;
                                  setFormData({ ...formData, buttons: newBtns });
                                }}
                                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-500"
                              />
                            </div>

                            {(btn.type === 'PHONE_NUMBER' || btn.type === 'WHATSAPP_CALL') && (
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                                  {btn.type === 'WHATSAPP_CALL' ? 'WhatsApp Phone Number' : 'Telephone Number'}
                                </label>
                                <input
                                  type="tel"
                                  placeholder="+919876543210"
                                  value={btn.phone_number || ''}
                                  onChange={(e) => {
                                    const newBtns = [...formData.buttons];
                                    newBtns[index].phone_number = e.target.value;
                                    setFormData({ ...formData, buttons: newBtns });
                                  }}
                                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-500"
                                />
                              </div>
                            )}

                            {btn.type === 'CONTACT' && (
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Business Contact Name</label>
                                <input
                                  type="text"
                                  placeholder="e.g. AOTMS Support Desk"
                                  value={btn.contact_name || ''}
                                  onChange={(e) => {
                                    const newBtns = [...formData.buttons];
                                    newBtns[index].contact_name = e.target.value;
                                    setFormData({ ...formData, buttons: newBtns });
                                  }}
                                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-500"
                                />
                              </div>
                            )}

                            {btn.type === 'URL' && (
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Website Link URL</label>
                                <input
                                  type="url"
                                  placeholder="https://aotms.com"
                                  value={btn.url || ''}
                                  onChange={(e) => {
                                    const newBtns = [...formData.buttons];
                                    newBtns[index].url = e.target.value;
                                    setFormData({ ...formData, buttons: newBtns });
                                  }}
                                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-500"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </form>

              {/* RIGHT COLUMN: REALISTIC WHATSAPP PHONE PREVIEW (5 Cols) */}
              <div className="lg:col-span-5 p-6 bg-slate-100/70 flex flex-col items-center justify-start overflow-y-auto lg:sticky lg:top-0">
                <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden flex flex-col relative max-h-[580px]">
                  
                  {/* WhatsApp Phone Mock Header */}
                  <div className="bg-[#075e54] text-white p-3.5 flex items-center justify-between shrink-0 z-10 shadow-xs">
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
                    <span className="text-[10px] font-mono bg-[#128c7e] px-2 py-0.5 rounded text-white font-bold">Live Preview</span>
                  </div>

                  {/* Chat Wallpaper Canvas with Smooth Automatic Scrolling */}
                  <div 
                    ref={previewChatRef}
                    className="p-4 bg-[#efeae2] flex-1 overflow-y-auto scroll-smooth space-y-3 scrollbar-thin scrollbar-thumb-slate-400/40 hover:scrollbar-thumb-slate-400"
                    style={{ maxHeight: '460px' }}
                  >
                    
                    {/* Message Bubble */}
                    <div className="bg-white rounded-2xl rounded-tl-none p-3 shadow-sm border border-slate-200/60 space-y-2 max-w-[95%]">
                      
                      {/* Image Header Preview (Supports Local Image File Preview) */}
                      {formData.header_type === 'IMAGE' && formData.header_image_url && (
                        <div className="rounded-xl overflow-hidden max-h-48 w-full bg-slate-100 relative group">
                          <img 
                            src={formData.header_image_url} 
                            alt="Header Preview" 
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80"; }}
                          />
                          {localImageName && (
                            <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded bg-black/60 text-white text-[9px] font-mono backdrop-blur-xs">
                              Local: {localImageName}
                            </span>
                          )}
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

                    {/* Interactive Action Buttons Preview (Realistic WhatsApp Native View) */}
                    {formData.buttons && formData.buttons.length > 0 && (
                      <div className="space-y-1.5 max-w-[95%]">
                        {formData.buttons.map((btn, i) => (
                          <div 
                            key={i}
                            className="p-2.5 rounded-xl bg-white/95 border border-slate-200/80 shadow-xs text-center text-xs font-bold text-sky-600 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                          >
                            {btn.type === 'WHATSAPP_CALL' && <WhatsApp className="w-3.5 h-3.5 text-emerald-600" />}
                            {btn.type === 'PHONE_NUMBER' && <Phone className="w-3.5 h-3.5 text-emerald-600" />}
                            {btn.type === 'CONTACT' && <UserCheck className="w-3.5 h-3.5 text-amber-600" />}
                            {btn.type === 'URL' && <ExternalLink className="w-3.5 h-3.5 text-sky-600" />}
                            {btn.type === 'CUSTOM' && <Send className="w-3 h-3 text-purple-600" />}
                            <span>{btn.text}</span>
                          </div>
                        ))}
                      </div>
                    )}

                  </div>

                  {/* Auto-scroll helper controls */}
                  <div className="p-2 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[10px] font-mono text-slate-500 px-3 shrink-0">
                    <span className="flex items-center gap-1.5 text-emerald-700 font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Auto-Scroll Active</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <button 
                        type="button" 
                        onClick={() => previewChatRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="hover:text-slate-900 font-bold cursor-pointer"
                      >
                        Top ↑
                      </button>
                      <span>•</span>
                      <button 
                        type="button" 
                        onClick={() => previewChatRef.current?.scrollTo({ top: previewChatRef.current.scrollHeight, behavior: 'smooth' })}
                        className="hover:text-slate-900 font-bold cursor-pointer"
                      >
                        Bottom ↓
                      </button>
                    </div>
                  </div>

                </div>
              </div>

            </div>

            {/* Modal Bottom Action Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3 shrink-0">
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
      {/* MODAL 2: STANDALONE CHAT PREVIEW POPUP (AUTOMATIC SCROLL SUPPORT)          */}
      {/* ========================================================================= */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[88vh] animate-in zoom-in-95 duration-150">
            
            <div className="bg-[#075e54] text-white p-4 flex items-center justify-between shrink-0 shadow-xs">
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

            {/* Scrollable chat canvas with smooth scrolling */}
            <div 
              ref={previewModalChatRef}
              className="p-4 bg-[#efeae2] flex-1 overflow-y-auto scroll-smooth space-y-3 scrollbar-thin scrollbar-thumb-slate-400/40"
              style={{ maxHeight: '460px' }}
            >
              <div className="bg-white rounded-2xl rounded-tl-none p-3.5 shadow-sm border border-slate-200/60 space-y-2">
                {previewTemplate.header_type === 'IMAGE' && previewTemplate.header_content && (
                  <div className="rounded-xl overflow-hidden max-h-48 w-full bg-slate-100">
                    <img src={previewTemplate.header_content} alt="Header" className="w-full h-full object-cover" />
                  </div>
                )}
                {previewTemplate.header_type === 'TEXT' && previewTemplate.header_content && (
                  <h4 className="text-xs font-black text-slate-900 pb-1 border-b border-slate-100">
                    {previewTemplate.header_content}
                  </h4>
                )}
                <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-line font-normal">
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

              {/* Render buttons in standalone preview too */}
              {(() => {
                let pButtons = [];
                try {
                  pButtons = typeof previewTemplate.buttons === 'string' ? JSON.parse(previewTemplate.buttons) : (previewTemplate.buttons || []);
                } catch(e) { pButtons = []; }

                return pButtons.length > 0 ? (
                  <div className="space-y-1.5 max-w-[95%]">
                    {pButtons.map((btn, i) => (
                      <div 
                        key={i}
                        className="p-2.5 rounded-xl bg-white/95 border border-slate-200/80 shadow-xs text-center text-xs font-bold text-sky-600 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {btn.type === 'WHATSAPP_CALL' && <WhatsApp className="w-3.5 h-3.5 text-emerald-600" />}
                        {btn.type === 'PHONE_NUMBER' && <Phone className="w-3.5 h-3.5 text-emerald-600" />}
                        {btn.type === 'CONTACT' && <UserCheck className="w-3.5 h-3.5 text-amber-600" />}
                        {btn.type === 'URL' && <ExternalLink className="w-3.5 h-3.5 text-sky-600" />}
                        {btn.type === 'CUSTOM' && <Send className="w-3 h-3 text-purple-600" />}
                        <span>{btn.text}</span>
                      </div>
                    ))}
                  </div>
                ) : null;
              })()}
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
              <span className="text-[10px] text-slate-400 font-mono">Smooth Scrolling Active</span>
              <button
                onClick={() => setPreviewTemplate(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs cursor-pointer transition-colors"
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
