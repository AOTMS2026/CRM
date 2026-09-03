import React, { useState, useEffect } from 'react';
import { 
  Send, 
  CheckSquare, 
  Square, 
  RotateCw, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  BookUser, 
  Target, 
  X
} from 'lucide-react';
import { IoLogoWhatsapp as WhatsApp } from 'react-icons/io5';

export default function WhatsappBlast() {
  const [templates, setTemplates] = useState([]);
  const [leads, setLeads] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [recipientType, setRecipientType] = useState('contacts'); // 'contacts' or 'leads'
  
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  // Dispatch Progress & Results
  const [sending, setSending] = useState(false);
  const [blastResult, setBlastResult] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('success');

  // Live Test Message State
  const [testPhone, setTestPhone] = useState('7995232673');
  const [sendingTest, setSendingTest] = useState(false);

  const getApiBase = () => {
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      return 'http://localhost:5000';
    }
    return import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
  };

  const showToast = (msg, type = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 5000);
  };

  // Fetch templates, leads, and contacts from backend
  const fetchData = async () => {
    setLoading(true);
    try {
      const [tmplRes, leadsRes, contactsRes] = await Promise.all([
        fetch(`${getApiBase()}/api/integrations/whatsapp/templates`),
        fetch(`${getApiBase()}/api/leads`),
        fetch(`${getApiBase()}/api/contacts`)
      ]);

      const tmplData = await tmplRes.json();
      const leadsData = await leadsRes.json();
      const contactsData = await contactsRes.json();

      if (tmplData && tmplData.success && Array.isArray(tmplData.templates)) {
        setTemplates(tmplData.templates);
        if (tmplData.templates.length > 0) {
          setSelectedTemplate(tmplData.templates[0]);
        }
      }

      let loadedLeads = [];
      let loadedContacts = [];

      if (leadsData && leadsData.success && Array.isArray(leadsData.leads)) {
        loadedLeads = leadsData.leads;
        setLeads(loadedLeads);
      }

      if (contactsData && contactsData.success && Array.isArray(contactsData.contacts)) {
        loadedContacts = contactsData.contacts;
        setContacts(loadedContacts);
      }

      // Default select all contacts or leads
      if (loadedContacts.length > 0) {
        setSelectedIds(loadedContacts.map(c => c.id));
      } else if (loadedLeads.length > 0) {
        setRecipientType('leads');
        setSelectedIds(loadedLeads.map(l => l.id));
      }
    } catch (err) {
      console.error("Failed to load blast data:", err);
      showToast("Failed to load templates or recipients from server.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Switch Recipient Type
  const handleSwitchRecipientType = (type) => {
    setRecipientType(type);
    const targetList = type === 'contacts' ? contacts : leads;
    setSelectedIds(targetList.map(item => item.id));
  };

  // Active Recipient List
  const activeRawList = recipientType === 'contacts' ? contacts : leads;

  const filteredRecipients = activeRawList.filter(item => {
    const itemStatus = (item.status || item.pipeline_stage || 'Active').toUpperCase();
    const matchesStatus = statusFilter === 'ALL' || itemStatus === statusFilter.toUpperCase();
    const matchesSearch = (item.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (item.phone || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (item.address || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const isAllSelected = filteredRecipients.length > 0 && filteredRecipients.every(item => selectedIds.includes(item.id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      const remaining = selectedIds.filter(id => !filteredRecipients.some(fr => fr.id === id));
      setSelectedIds(remaining);
    } else {
      const combined = Array.from(new Set([...selectedIds, ...filteredRecipients.map(item => item.id)]));
      setSelectedIds(combined);
    }
  };

  const toggleSelectItem = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(i => i !== id));
    } else {
      setSelectedIds(prev => [...prev, id]);
    }
  };

  const firstSelectedRecipient = activeRawList.find(item => selectedIds.includes(item.id)) || activeRawList[0] || { name: 'Recipient' };

  const renderBodyWithVariables = (bodyText) => {
    if (!bodyText) return '';
    return bodyText
      .replace(/\{\{1\}\}/g, firstSelectedRecipient.name || 'Valued Client')
      .replace(/\{\{2\}\}/g, 'AOTMS WhatsApp Automation');
  };

  // 1-Click Single Test Message Sender
  const handleSendSingleTest = async () => {
    if (!testPhone || testPhone.trim().length < 10) {
      showToast("Please enter a valid 10-digit mobile number.", "error");
      return;
    }
    setSendingTest(true);
    try {
      const res = await fetch(`${getApiBase()}/api/leads/send-single-whatsapp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: testPhone,
          template_name: selectedTemplate?.name || 'hello_world'
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || `Test message sent to +91 ${testPhone}!`, "success");
      } else {
        throw new Error(data.error || data.detail || "Failed to send test message.");
      }
    } catch (err) {
      showToast(err.message || "Failed to send test message.", "error");
    } finally {
      setSendingTest(false);
    }
  };

  // Trigger Batch WhatsApp Blast Action
  const handleTriggerBlast = async () => {
    if (!selectedTemplate) {
      showToast("Please select a WhatsApp template first.", "error");
      return;
    }
    if (selectedIds.length === 0) {
      showToast(`Please select at least one ${recipientType === 'contacts' ? 'contact' : 'lead'} for the WhatsApp blast.`, "error");
      return;
    }

    if (!window.confirm(`Are you sure you want to trigger WhatsApp Blast using template '${selectedTemplate.name}' to ${selectedIds.length} ${recipientType}?`)) return;

    setSending(true);
    setBlastResult(null);

    try {
      const res = await fetch(`${getApiBase()}/api/leads/whatsapp-blast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template_name: selectedTemplate.name,
          language: selectedTemplate.language || 'en_US',
          lead_ids: selectedIds,
          sample_values: [firstSelectedRecipient.name || 'Client', 'AOTMS']
        })
      });

      const result = await res.json();
      if (res.ok && result.success) {
        setBlastResult(result);
        showToast(result.message || `Blast dispatched successfully to ${result.successful} recipients!`, "success");
      } else {
        throw new Error(result.detail || result.message || "WhatsApp Blast failed to send.");
      }
    } catch (err) {
      showToast(err.message || "Failed to dispatch WhatsApp blast.", "error");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      
      {/* Toast Alert Banner */}
      {toastMessage && (
        <div className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between shadow-md transition-all animate-in fade-in ${
          toastType === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}>
          <div className="flex items-center gap-2.5">
            {toastType === 'error' ? <AlertCircle className="w-4 h-4 text-rose-600" /> : <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {/* Header Bar */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md">
            <Send className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                WhatsApp Blast Studio (Contacts & Leads Engine)
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 font-mono">
                Meta Cloud API Ready
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Select Meta Approved Template &rarr; Toggle Contacts or Leads &rarr; Select Recipients (Select All or Individual) &rarr; Send Message Trigger.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleTriggerBlast}
          disabled={sending || selectedIds.length === 0 || !selectedTemplate}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50 hover:shadow-lg active:scale-98 shrink-0"
        >
          {sending ? <RotateCw className="w-4 h-4 animate-spin text-white" /> : <Send className="w-4 h-4" />}
          <span>{sending ? 'Dispatching...' : `Send Blast (${selectedIds.length} ${recipientType === 'contacts' ? 'Contacts' : 'Leads'})`}</span>
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
          <RotateCw className="w-6 h-6 animate-spin text-emerald-600 mx-auto mb-2" />
          <p className="text-xs text-slate-500 font-semibold">Loading templates, contacts, and leads...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* STEP 1: SELECT APPROVED TEMPLATE (4 Cols) */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xs font-black text-slate-900 uppercase font-mono tracking-wider flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center justify-center">1</span>
                <span>Select Approved Template</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-400">{templates.length} Templates</span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto max-h-[520px] scrollbar-thin">
              {templates.map((tmpl) => {
                const isSelected = selectedTemplate?.name === tmpl.name;
                return (
                  <div
                    key={tmpl.id || tmpl.name}
                    onClick={() => setSelectedTemplate(tmpl)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2 ${
                      isSelected
                        ? 'bg-emerald-50/60 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold font-mono text-slate-900 truncate">{tmpl.name}</span>
                      <span className="px-2 py-0.2 rounded-full text-[9px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {tmpl.status || 'APPROVED'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
                      <span className="uppercase text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded border border-purple-200 font-bold">{tmpl.category}</span>
                      <span>•</span>
                      <span>{tmpl.language}</span>
                    </div>

                    <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed bg-slate-50 p-2 rounded-lg border border-slate-100 font-normal">
                      {tmpl.body_text}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* STEP 2: SELECT RECIPIENTS (CONTACTS VS LEADS TOGGLE) (5 Cols) */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xs font-black text-slate-900 uppercase font-mono tracking-wider flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center justify-center">2</span>
                <span>Select Target Recipients</span>
              </h3>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-mono">
                {selectedIds.length} / {filteredRecipients.length} Selected
              </span>
            </div>

            {/* SOURCE SWITCHER: CONTACTS VS LEADS */}
            <div className="p-1 rounded-xl bg-slate-100 border border-slate-200 grid grid-cols-2 gap-1">
              <button
                type="button"
                onClick={() => handleSwitchRecipientType('contacts')}
                className={`py-2 px-3 rounded-lg text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  recipientType === 'contacts'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <BookUser className="w-4 h-4" />
                <span>Contacts ({contacts.length})</span>
              </button>

              <button
                type="button"
                onClick={() => handleSwitchRecipientType('leads')}
                className={`py-2 px-3 rounded-lg text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  recipientType === 'leads'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Target className="w-4 h-4" />
                <span>Leads ({leads.length})</span>
              </button>
            </div>

            {/* Select All & Search */}
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={toggleSelectAll}
                className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer hover:text-emerald-700"
              >
                {isAllSelected ? <CheckSquare className="w-4 h-4 text-emerald-600" /> : <Square className="w-4 h-4 text-slate-400" />}
                <span>Select All ({filteredRecipients.length})</span>
              </button>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800"
              >
                <option value="ALL">All Statuses</option>
                {recipientType === 'contacts' ? (
                  <>
                    <option value="Active">Active</option>
                    <option value="VIP">VIP</option>
                  </>
                ) : (
                  <>
                    <option value="Inquiries">Inquiries</option>
                    <option value="Demo">Demo</option>
                    <option value="Enrolled">Enrolled</option>
                  </>
                )}
              </select>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder={`Search ${recipientType} by name, phone...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Recipients List */}
            <div className="space-y-2 flex-1 overflow-y-auto max-h-[380px] scrollbar-thin">
              {filteredRecipients.map((item) => {
                const isSelected = selectedIds.includes(item.id);
                const itemStatus = item.status || item.pipeline_stage || 'Active';

                return (
                  <div
                    key={item.id}
                    onClick={() => toggleSelectItem(item.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-emerald-50/40 border-emerald-300 text-slate-900'
                        : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {isSelected ? <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" /> : <Square className="w-4 h-4 text-slate-300 shrink-0" />}
                      
                      {/* Avatar preview if image_url exists */}
                      {item.image_url && (
                        <img src={item.image_url} alt={item.name} className="w-7 h-7 rounded-lg object-cover shrink-0" />
                      )}

                      <div>
                        <div className="text-xs font-extrabold text-slate-900">{item.name}</div>
                        <div className="text-[10px] font-mono text-slate-500 flex items-center gap-2">
                          <span>{item.phone}</span>
                          {item.address && (
                            <>
                              <span>•</span>
                              <span className="text-slate-600 truncate max-w-[130px]">{item.address}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      {itemStatus}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* STEP 3: LIVE PREVIEW & TRIGGER RESULTS (3 Cols) */}
          <div className="lg:col-span-3 bg-slate-100/70 rounded-2xl border border-slate-200 p-4 flex flex-col items-center justify-start">
            <div className="w-full max-w-xs bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden flex flex-col relative max-h-[560px]">
              
              {/* WhatsApp Mock Header */}
              <div className="bg-[#075e54] text-white p-3.5 flex items-center justify-between shrink-0 shadow-xs">
                <div className="flex items-center gap-2">
                  <WhatsApp className="w-5 h-5 text-emerald-300" />
                  <div>
                    <div className="text-xs font-bold font-mono">AOTMS Official</div>
                    <div className="text-[9px] text-emerald-100">Live Personalization Preview</div>
                  </div>
                </div>
                <span className="text-[9px] font-mono bg-[#128c7e] px-1.5 py-0.5 rounded text-white font-bold">Meta Ready</span>
              </div>

              {/* Chat Canvas */}
              <div className="p-3 bg-[#efeae2] flex-1 overflow-y-auto space-y-3 text-xs" style={{ minHeight: '340px' }}>
                {selectedTemplate ? (
                  <div className="bg-white rounded-2xl rounded-tl-none p-3 shadow-sm border border-slate-200/60 space-y-2">
                    {selectedTemplate.header_type === 'IMAGE' && selectedTemplate.header_content && (
                      <div className="rounded-xl overflow-hidden max-h-36 w-full bg-slate-100">
                        <img src={selectedTemplate.header_content} alt="Header" className="w-full h-full object-cover" />
                      </div>
                    )}
                    {selectedTemplate.header_type === 'TEXT' && selectedTemplate.header_content && (
                      <h4 className="text-xs font-black text-slate-900 pb-1 border-b border-slate-100">
                        {selectedTemplate.header_content}
                      </h4>
                    )}

                    <p className="text-[11px] text-slate-800 leading-relaxed whitespace-pre-line font-normal">
                      {renderBodyWithVariables(selectedTemplate.body_text)}
                    </p>

                    {selectedTemplate.footer_text && (
                      <p className="text-[9px] text-slate-400 font-medium">{selectedTemplate.footer_text}</p>
                    )}

                    <div className="flex items-center justify-end gap-1 text-[9px] text-slate-400 font-mono">
                      <span>10:45 AM</span>
                      <span className="text-sky-500 font-bold">✓✓</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 text-center text-slate-400 text-xs">Select a template to view live preview</div>
                )}
              </div>

              {/* Live Selected Recipients Counter */}
              <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-col gap-2 shrink-0">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-medium">Selected ({recipientType}):</span>
                  <span className="font-bold font-mono text-emerald-700">{selectedIds.length} Selected</span>
                </div>

                <button
                  type="button"
                  onClick={handleTriggerBlast}
                  disabled={sending || selectedIds.length === 0 || !selectedTemplate}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  {sending ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>{sending ? 'Sending...' : `Send WhatsApp Blast to ${recipientType}`}</span>
                </button>
              </div>

            </div>

            {/* Blast Execution Summary Result Card */}
            {blastResult && (
              <div className="mt-4 w-full p-4 rounded-2xl bg-white border border-slate-200 shadow-md space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900">Blast Execution Report</span>
                  <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Done
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <div>Success</div>
                    <div className="text-base font-black">{blastResult.successful}</div>
                  </div>
                  <div className="p-2 rounded-xl bg-rose-50 text-rose-800 border border-rose-200">
                    <div>Failed</div>
                    <div className="text-base font-black">{blastResult.failed}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
