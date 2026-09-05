import React, { useState, useEffect, useRef } from 'react';
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
  User, 
  Building, 
  Printer, 
  Download, 
  Eye, 
  FileText, 
  Calendar, 
  DollarSign, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  Send 
} from 'lucide-react';

export default function PaySipGenerator({ onOpenBlast }) {
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState(null);

  // Modals & Preview State
  const [showFormModal, setShowFormModal] = useState(false);
  const [previewPayslip, setPreviewPayslip] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Print Ref
  const printRef = useRef(null);

  // Default Payslip Form State (Preset to Academy of Tech Masters March 2026 Payslip style)
  const defaultFormData = {
    companyName: 'Academy Of Tech Masters',
    companyAddress: '2nd Floor, Sri Pothuri Towers, MG Road, Near DV Manor, Vijayawada – 520010',
    monthYear: 'March 2026',

    employeeName: 'Ameenuddin Sayyed',
    employeeId: 'AOTMS-01',
    joiningDate: '05 Sept 2025',
    designation: 'Director',
    department: 'IT',
    location: 'Vijayawada',
    effectiveWorkDays: 31,
    lop: 0,

    bankName: 'ICICI Bank',
    bankAccountNo: '630601562564',
    panNumber: 'GSAPS2603R',
    pfNo: 'AP/HYD/1784665/000/0010050',
    pfUan: '101127077159',
    phone: '9876543210',

    // Earnings
    basic: 48120,
    hra: 14436,
    conveyance: 2500,
    medicalAllowance: 2500,
    specialAllowance: 10644,
    incentive: 0,
    foodAllowance: 2000,

    // Deductions
    profTax: 200,
    otherDeductions: 0
  };

  const [formData, setFormData] = useState(defaultFormData);

  const getApiBase = () => {
    if (import.meta.env.VITE_API_BASE_URL) {
      return import.meta.env.VITE_API_BASE_URL;
    }
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      return 'http://localhost:5000';
    }
    return 'https://crm-1-62pl.onrender.com';
  };

  const showToastMsg = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 5000);
  };

  // Convert Indian Rupee numbers to words
  const numberToWordsINR = (num) => {
    const n = Math.round(Number(num) || 0);
    if (n <= 0) return 'Rupees Zero Only';

    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const inWords = (val) => {
      if (val < 20) return a[val];
      const digit = val % 10;
      return b[Math.floor(val / 10)] + (digit ? ' ' + a[digit] : '');
    };

    let str = '';
    let temp = n;

    const crore = Math.floor(temp / 10000000);
    temp %= 10000000;
    const lakh = Math.floor(temp / 100000);
    temp %= 100000;
    const thousand = Math.floor(temp / 1000);
    temp %= 1000;
    const hundred = Math.floor(temp / 100);
    temp %= 100;

    if (crore) str += inWords(crore) + 'Crore ';
    if (lakh) str += inWords(lakh) + 'Lakh ';
    if (thousand) str += inWords(thousand) + 'Thousand ';
    if (hundred) str += inWords(hundred) + 'Hundred ';
    if (temp) {
      if (str !== '') str += 'and ';
      str += inWords(temp);
    }

    return `Rupees ${str.trim()} Only`;
  };

  // Auto-calculated totals
  const totalEarnings = (
    Number(formData.basic || 0) +
    Number(formData.hra || 0) +
    Number(formData.conveyance || 0) +
    Number(formData.medicalAllowance || 0) +
    Number(formData.specialAllowance || 0) +
    Number(formData.incentive || 0) +
    Number(formData.foodAllowance || 0)
  );

  const totalDeductions = (
    Number(formData.profTax || 0) +
    Number(formData.otherDeductions || 0)
  );

  const netPay = totalEarnings - totalDeductions;
  const netPayWords = numberToWordsINR(netPay);

  // Fetch payslips from MongoDB
  const fetchPayslips = async () => {
    setRefreshing(true);
    try {
      const res = await fetch(`${getApiBase()}/api/paysip`);
      const data = await res.json();
      if (res.ok && data && data.success && Array.isArray(data.paysips)) {
        setPayslips(data.paysips);
      } else {
        setPayslips([]);
      }
    } catch (err) {
      console.error("Failed to fetch payslips:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPayslips();
  }, []);

  // Save or Update Payslip
  const handleSubmitPayslip = async (e) => {
    e.preventDefault();
    if (!formData.employeeName.trim() || !formData.employeeId.trim()) {
      showToastMsg("Employee Name and Employee No are required.", "error");
      return;
    }

    setSubmitting(true);
    const payload = {
      ...formData,
      clientName: formData.employeeName,
      folioNumber: formData.employeeId,
      sipAmount: netPay,
      totalEarnings,
      totalDeductions,
      netPay,
      netPayWords
    };

    try {
      const endpoint = editingId ? `${getApiBase()}/api/paysip/${editingId}` : `${getApiBase()}/api/paysip`;
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToastMsg(data.message || `Payslip for ${formData.employeeName} saved successfully! 🎉`, "success");
        setShowFormModal(false);
        setEditingId(null);
        await fetchPayslips();
      } else {
        throw new Error(data.message || "Failed to save payslip.");
      }
    } catch (err) {
      showToastMsg(err.message || "Error saving payslip.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Payslip
  const handleDeletePayslip = async (id, empName) => {
    if (!window.confirm(`Are you sure you want to delete payslip for '${empName}'?`)) return;

    try {
      const res = await fetch(`${getApiBase()}/api/paysip/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        showToastMsg("Payslip record deleted successfully.", "success");
        await fetchPayslips();
      }
    } catch (err) {
      showToastMsg("Error deleting payslip.", "error");
    }
  };

  // Print Payslip
  const handlePrint = () => {
    if (!printRef.current) return;
    const printContent = printRef.current.innerHTML;
    const win = window.open('', '_blank');
    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Payslip - ${previewPayslip?.employeeName || formData.employeeName}</title>
          <style>
            @page { size: A4 portrait; margin: 15mm; }
            body { font-family: 'Times New Roman', Times, serif; font-size: 12px; color: #000; margin: 0; padding: 10px; }
            .payslip-box { border: 1.5px solid #000; padding: 0; background: #fff; width: 100%; box-sizing: border-box; }
            table { width: 100%; border-collapse: collapse; margin: 0; font-size: 11.5px; }
            td, th { border: 1px solid #000; padding: 4px 6px; vertical-align: middle; }
            .no-border td { border: none; }
            .header-table td { border: none; padding: 2px 4px; }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .font-bold { font-weight: bold; }
            .bg-light { background-color: #f9f9f9; }
            @media print {
              body { padding: 0; }
              .no-print { display: none !important; }
            }
          </style>
        </head>
        <body>
          <div class="payslip-box">${printContent}</div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    win.document.close();
  };

  // Filtered payslips
  const filteredPayslips = payslips.filter(p => {
    const q = searchQuery.toLowerCase();
    return (
      (p.employeeName || p.clientName || '').toLowerCase().includes(q) ||
      (p.employeeId || p.folioNumber || '').toLowerCase().includes(q) ||
      (p.designation || '').toLowerCase().includes(q) ||
      (p.department || '').toLowerCase().includes(q)
    );
  });

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.ceil(filteredPayslips.length / ITEMS_PER_PAGE) || 1;
  const paginatedPayslips = filteredPayslips.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const activeDoc = previewPayslip || formData;

  const displayBasic = activeDoc.basic ?? 0;
  const displayHra = activeDoc.hra ?? 0;
  const displayConveyance = activeDoc.conveyance ?? 0;
  const displayMedical = activeDoc.medicalAllowance ?? 0;
  const displaySpecial = activeDoc.specialAllowance ?? 0;
  const displayIncentive = activeDoc.incentive ?? 0;
  const displayFood = activeDoc.foodAllowance ?? 0;
  const displayProfTax = activeDoc.profTax ?? 0;
  const displayOtherDeductions = activeDoc.otherDeductions ?? 0;

  const activeTotalEarnings = activeDoc.totalEarnings ?? (displayBasic + displayHra + displayConveyance + displayMedical + displaySpecial + displayIncentive + displayFood);
  const activeTotalDeductions = activeDoc.totalDeductions ?? (displayProfTax + displayOtherDeductions);
  const activeNetPay = activeDoc.netPay ?? (activeTotalEarnings - activeTotalDeductions);
  const activeNetPayWords = activeDoc.netPayWords || numberToWordsINR(activeNetPay);

  return (
    <div className="space-y-6 animate-in fade-in duration-150 text-slate-800">
      
      {/* Toast Banner */}
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

      {/* Top Header Bar */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-inner">
            <FileText className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-tight">Official Employee Payslip Generator</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                Academy of Tech Masters Style
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5 max-w-xl">
              Create, customize, and print official employee payslips matching the exact AOTMS Vijayawada corporate format.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={fetchPayslips}
            disabled={refreshing}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-emerald-400' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setFormData(defaultFormData);
              setShowFormModal(true);
            }}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer hover:shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Payslip</span>
          </button>
        </div>
      </div>

      {/* Main Container: Split View (Left List/Form, Right Exact PDF Preview) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: PAYSLIP HISTORY TABLE & QUICK CONTROLS (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider">
                Saved Payslips ({filteredPayslips.length})
              </h3>
              <div className="relative w-48">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search payslips..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {loading ? (
              <div className="p-8 text-center text-xs text-slate-500">
                <RotateCw className="w-5 h-5 animate-spin mx-auto mb-2 text-emerald-600" />
                Loading payslips...
              </div>
            ) : filteredPayslips.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No payslips found. Create your first employee payslip above!
              </div>
            ) : (
              <div className="divide-y divide-slate-100 max-h-[580px] overflow-y-auto pr-1">
                {paginatedPayslips.map((item) => {
                  const empName = item.employeeName || item.clientName || 'Employee';
                  const empId = item.employeeId || item.folioNumber || 'AOTMS-01';
                  const isPreview = previewPayslip?._id === item._id;

                  return (
                    <div
                      key={item._id || item.id}
                      onClick={() => setPreviewPayslip(item)}
                      className={`p-3.5 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isPreview ? 'bg-emerald-50 border border-emerald-300 shadow-2xs' : 'hover:bg-slate-50 border border-transparent'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 uppercase">
                            {item.monthYear || 'March 2026'}
                          </span>
                          <span className="text-xs font-black text-slate-900 truncate">{empName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono mt-1">
                          <span>ID: {empId}</span>
                          <span>•</span>
                          <span>{item.designation || 'Director'}</span>
                        </div>
                        <div className="text-xs font-extrabold text-emerald-700 mt-0.5">
                          Net Pay: ₹{Number(item.netPay ?? item.sipAmount ?? 80000).toLocaleString('en-IN')}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingId(item._id);
                            setFormData({
                              ...defaultFormData,
                              ...item,
                              employeeName: item.employeeName || item.clientName || '',
                              employeeId: item.employeeId || item.folioNumber || ''
                            });
                            setShowFormModal(true);
                          }}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-sky-100 text-slate-600 hover:text-sky-700 transition-colors"
                          title="Edit Details"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePayslip(item._id || item.id, empName);
                          }}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 transition-colors"
                          title="Delete Payslip"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination Controls */}
            {filteredPayslips.length > 0 && (
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                <span className="text-slate-500 font-bold">Page {currentPage} of {totalPages}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-1 rounded-lg border text-slate-700 disabled:opacity-30"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                    disabled={currentPage >= totalPages}
                    className="p-1 rounded-lg border text-slate-700 disabled:opacity-30"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: EXACT PAYSLIP DOCUMENT PREVIEW (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-md space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">
                  Live AOTMS Payslip Document Preview
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Print / Save PDF</span>
                </button>
              </div>
            </div>

            {/* EXACT MATCHING PAYSLIP TEMPLATE CONTAINER (Times New Roman, Black Box Borders) */}
            <div className="p-3 bg-slate-100 rounded-xl overflow-x-auto">
              <div
                ref={printRef}
                className="bg-white p-6 rounded-none text-black font-serif text-xs border border-black max-w-2xl mx-auto shadow-sm"
                style={{ fontFamily: "'Times New Roman', Times, serif" }}
              >
                {/* 1. Company Logo & Title Header */}
                <div className="text-center space-y-1 mb-4 border-b border-black pb-3">
                  <div className="flex items-center justify-center gap-3">
                    <img src="/logo.png" alt="Academy Of Tech Masters" className="h-10 w-auto object-contain mx-auto" />
                  </div>

                  <h1 className="text-sm font-bold text-black mt-2">
                    {activeDoc.companyName || 'Academy Of Tech Masters'}
                  </h1>
                  <p className="text-[11px] text-black">
                    {activeDoc.companyAddress || '2nd Floor, Sri Pothuri Towers, MG Road, Near DV Manor, Vijayawada – 520010'}
                  </p>

                  <h3 className="text-xs font-bold text-black pt-1">
                    Payslip for the month of {activeDoc.monthYear || 'March 2026'}
                  </h3>
                </div>

                {/* 2. Employee Info Grid (Boxed 2 Columns) */}
                <table className="w-full border-collapse border border-black text-[11px] mb-4">
                  <tbody>
                    <tr>
                      <td className="border border-black p-1.5 w-1/2">
                        <span className="font-normal">Name:</span> <span className="font-bold">{activeDoc.employeeName || activeDoc.clientName || 'Ameenuddin Sayyed'}</span>
                      </td>
                      <td className="border border-black p-1.5 w-1/2">
                        <span className="font-normal">Employee No:</span> <span className="font-bold">{activeDoc.employeeId || activeDoc.folioNumber || 'AOTMS-01'}</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-black p-1.5">
                        <span className="font-normal">Joining Date:</span> <span className="font-bold">{activeDoc.joiningDate || '05 Sept 2025'}</span>
                      </td>
                      <td className="border border-black p-1.5">
                        <span className="font-normal">Bank Name:</span> <span className="font-bold">{activeDoc.bankName || 'ICICI Bank'}</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-black p-1.5">
                        <span className="font-normal">Designation:</span> <span className="font-bold">{activeDoc.designation || 'Director'}</span>
                      </td>
                      <td className="border border-black p-1.5">
                        <span className="font-normal">Bank Account No:</span> <span className="font-bold">{activeDoc.bankAccountNo || '630601562564'}</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-black p-1.5">
                        <span className="font-normal">Department:</span> <span className="font-bold">{activeDoc.department || 'IT'}</span>
                      </td>
                      <td className="border border-black p-1.5">
                        <span className="font-normal">PAN Number:</span> <span className="font-bold">{activeDoc.panNumber || 'GSAPS2603R'}</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-black p-1.5">
                        <span className="font-normal">Location:</span> <span className="font-bold">{activeDoc.location || 'Vijayawada'}</span>
                      </td>
                      <td className="border border-black p-1.5">
                        <span className="font-normal">PF No:</span> <span className="font-bold">{activeDoc.pfNo || 'AP/HYD/1784665/000/0010050'}</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-black p-1.5">
                        <span className="font-normal">Effective Work Days:</span> <span className="font-bold">{activeDoc.effectiveWorkDays ?? 31}</span>
                      </td>
                      <td className="border border-black p-1.5">
                        <span className="font-normal">PF UAN:</span> <span className="font-bold">{activeDoc.pfUan || '101127077159'}</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-black p-1.5" colSpan={2}>
                        <span className="font-normal">LOP:</span> <span className="font-bold">{activeDoc.lop ?? 0}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* 3. Earnings & Deductions Table */}
                <table className="w-full border-collapse border border-black text-[11px] mb-4">
                  <thead>
                    <tr className="font-bold bg-gray-50">
                      <th className="border border-black p-1.5 text-left w-2/5">Earnings</th>
                      <th className="border border-black p-1.5 text-right w-1/5">Full</th>
                      <th className="border border-black p-1.5 text-right w-1/5">Actual</th>
                      <th className="border border-black p-1.5 text-left w-1/4">Deductions</th>
                      <th className="border border-black p-1.5 text-right w-1/5">Actual</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-black p-1.5">BASIC</td>
                      <td className="border border-black p-1.5 text-right">{displayBasic}</td>
                      <td className="border border-black p-1.5 text-right">{displayBasic}</td>
                      <td className="border border-black p-1.5">PROF TAX</td>
                      <td className="border border-black p-1.5 text-right">{displayProfTax}</td>
                    </tr>
                    <tr>
                      <td className="border border-black p-1.5">HRA</td>
                      <td className="border border-black p-1.5 text-right">{displayHra}</td>
                      <td className="border border-black p-1.5 text-right">{displayHra}</td>
                      <td className="border border-black p-1.5"></td>
                      <td className="border border-black p-1.5 text-right"></td>
                    </tr>
                    <tr>
                      <td className="border border-black p-1.5">CONVEYANCE</td>
                      <td className="border border-black p-1.5 text-right">{displayConveyance}</td>
                      <td className="border border-black p-1.5 text-right">{displayConveyance}</td>
                      <td className="border border-black p-1.5"></td>
                      <td className="border border-black p-1.5 text-right"></td>
                    </tr>
                    <tr>
                      <td className="border border-black p-1.5">MEDICAL ALLOWANCE</td>
                      <td className="border border-black p-1.5 text-right">{displayMedical}</td>
                      <td className="border border-black p-1.5 text-right">{displayMedical}</td>
                      <td className="border border-black p-1.5"></td>
                      <td className="border border-black p-1.5 text-right"></td>
                    </tr>
                    <tr>
                      <td className="border border-black p-1.5">SPECIAL ALLOWANCE</td>
                      <td className="border border-black p-1.5 text-right">{displaySpecial}</td>
                      <td className="border border-black p-1.5 text-right">{displaySpecial}</td>
                      <td className="border border-black p-1.5"></td>
                      <td className="border border-black p-1.5 text-right"></td>
                    </tr>
                    <tr>
                      <td className="border border-black p-1.5">INCENTIVE</td>
                      <td className="border border-black p-1.5 text-right">{displayIncentive}</td>
                      <td className="border border-black p-1.5 text-right">{displayIncentive}</td>
                      <td className="border border-black p-1.5"></td>
                      <td className="border border-black p-1.5 text-right"></td>
                    </tr>
                    <tr>
                      <td className="border border-black p-1.5">FOOD ALLOWANCE</td>
                      <td className="border border-black p-1.5 text-right">{displayFood}</td>
                      <td className="border border-black p-1.5 text-right">{displayFood}</td>
                      <td className="border border-black p-1.5"></td>
                      <td className="border border-black p-1.5 text-right"></td>
                    </tr>

                    {/* Totals Row */}
                    <tr className="font-bold border-t-2 border-black">
                      <td className="border border-black p-1.5">Total Earnings:INR.</td>
                      <td className="border border-black p-1.5 text-right">{activeTotalEarnings}</td>
                      <td className="border border-black p-1.5 text-right">{activeTotalEarnings}</td>
                      <td className="border border-black p-1.5">Total Deductions:INR.</td>
                      <td className="border border-black p-1.5 text-right">{activeTotalDeductions}</td>
                    </tr>
                  </tbody>
                </table>

                {/* 4. Net Pay Section */}
                <div className="border border-black p-2 mb-4 space-y-1">
                  <div className="flex items-center justify-between font-bold">
                    <span>Net Pay for the month ( Total Earnings - Total Deductions):</span>
                    <span className="text-sm font-bold">{activeNetPay}</span>
                  </div>
                  <div className="font-bold italic">
                    ({activeNetPayWords})
                  </div>
                </div>

                {/* 5. System Footer */}
                <div className="text-center text-[10px] text-gray-700 italic pt-4">
                  This is a system generated payslip and does not require signature.
                </div>

              </div>
            </div>

          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* MODAL: CREATE / EDIT PAYSLIP FORM WITH ALL MANUAL INPUT FIELDS             */}
      {/* ========================================================================= */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col text-slate-900">
            
            {/* Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    {editingId ? 'Edit Official Employee Payslip' : 'Create Official Employee Payslip'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Enter all employee, bank, statutory, earnings, and deduction details manually.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowFormModal(false)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmitPayslip} id="payslip-form" className="p-6 space-y-6 overflow-y-auto text-xs font-medium">
              
              {/* SECTION 1: Company & Payslip Period */}
              <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <h4 className="text-xs font-black uppercase text-emerald-700 tracking-wider flex items-center gap-1.5">
                  <Building className="w-4 h-4" /> 1. Company & Salary Month
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Company Name</label>
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-bold focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Payslip Month & Year</label>
                    <input
                      type="text"
                      placeholder="March 2026"
                      value={formData.monthYear}
                      onChange={(e) => setFormData({ ...formData, monthYear: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-bold focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Company Location</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Company Address</label>
                  <input
                    type="text"
                    value={formData.companyAddress}
                    onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* SECTION 2: Employee Profile */}
              <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <h4 className="text-xs font-black uppercase text-emerald-700 tracking-wider flex items-center gap-1.5">
                  <User className="w-4 h-4" /> 2. Employee Identity & Attendance
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Employee Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ameenuddin Sayyed"
                      value={formData.employeeName}
                      onChange={(e) => setFormData({ ...formData, employeeName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-bold focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Employee No <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="AOTMS-01"
                      value={formData.employeeId}
                      onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono text-xs font-bold focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Designation</label>
                    <input
                      type="text"
                      placeholder="Director"
                      value={formData.designation}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                    <input
                      type="text"
                      placeholder="IT"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Joining Date</label>
                    <input
                      type="text"
                      placeholder="05 Sept 2025"
                      value={formData.joiningDate}
                      onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Effective Work Days</label>
                    <input
                      type="number"
                      value={formData.effectiveWorkDays}
                      onChange={(e) => setFormData({ ...formData, effectiveWorkDays: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-bold focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">LOP (Loss of Pay Days)</label>
                    <input
                      type="number"
                      value={formData.lop}
                      onChange={(e) => setFormData({ ...formData, lop: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-bold focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: Bank & PF Statutory Details */}
              <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <h4 className="text-xs font-black uppercase text-emerald-700 tracking-wider flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4" /> 3. Bank & PF Statutory Information
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Bank Name</label>
                    <input
                      type="text"
                      placeholder="ICICI Bank"
                      value={formData.bankName}
                      onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Bank Account No</label>
                    <input
                      type="text"
                      placeholder="630601562564"
                      value={formData.bankAccountNo}
                      onChange={(e) => setFormData({ ...formData, bankAccountNo: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono text-xs focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">PAN Number</label>
                    <input
                      type="text"
                      placeholder="GSAPS2603R"
                      value={formData.panNumber}
                      onChange={(e) => setFormData({ ...formData, panNumber: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono text-xs uppercase focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">PF Number</label>
                    <input
                      type="text"
                      placeholder="AP/HYD/1784665/000/0010050"
                      value={formData.pfNo}
                      onChange={(e) => setFormData({ ...formData, pfNo: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono text-xs focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">PF UAN</label>
                    <input
                      type="text"
                      placeholder="101127077159"
                      value={formData.pfUan}
                      onChange={(e) => setFormData({ ...formData, pfUan: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono text-xs focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 4: Earnings & Deductions Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Earnings Column */}
                <div className="space-y-3 p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200">
                  <h4 className="text-xs font-black uppercase text-emerald-800 tracking-wider">
                    Earnings Breakdown (INR)
                  </h4>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <label className="text-xs text-slate-700 font-bold">BASIC</label>
                      <input
                        type="number"
                        value={formData.basic}
                        onChange={(e) => setFormData({ ...formData, basic: Number(e.target.value) })}
                        className="w-32 px-3 py-1.5 rounded-lg bg-white border border-emerald-300 font-mono font-bold text-right text-xs"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <label className="text-xs text-slate-700 font-bold">HRA</label>
                      <input
                        type="number"
                        value={formData.hra}
                        onChange={(e) => setFormData({ ...formData, hra: Number(e.target.value) })}
                        className="w-32 px-3 py-1.5 rounded-lg bg-white border border-emerald-300 font-mono font-bold text-right text-xs"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <label className="text-xs text-slate-700 font-bold">CONVEYANCE</label>
                      <input
                        type="number"
                        value={formData.conveyance}
                        onChange={(e) => setFormData({ ...formData, conveyance: Number(e.target.value) })}
                        className="w-32 px-3 py-1.5 rounded-lg bg-white border border-emerald-300 font-mono font-bold text-right text-xs"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <label className="text-xs text-slate-700 font-bold">MEDICAL ALLOWANCE</label>
                      <input
                        type="number"
                        value={formData.medicalAllowance}
                        onChange={(e) => setFormData({ ...formData, medicalAllowance: Number(e.target.value) })}
                        className="w-32 px-3 py-1.5 rounded-lg bg-white border border-emerald-300 font-mono font-bold text-right text-xs"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <label className="text-xs text-slate-700 font-bold">SPECIAL ALLOWANCE</label>
                      <input
                        type="number"
                        value={formData.specialAllowance}
                        onChange={(e) => setFormData({ ...formData, specialAllowance: Number(e.target.value) })}
                        className="w-32 px-3 py-1.5 rounded-lg bg-white border border-emerald-300 font-mono font-bold text-right text-xs"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <label className="text-xs text-slate-700 font-bold">INCENTIVE</label>
                      <input
                        type="number"
                        value={formData.incentive}
                        onChange={(e) => setFormData({ ...formData, incentive: Number(e.target.value) })}
                        className="w-32 px-3 py-1.5 rounded-lg bg-white border border-emerald-300 font-mono font-bold text-right text-xs"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <label className="text-xs text-slate-700 font-bold">FOOD ALLOWANCE</label>
                      <input
                        type="number"
                        value={formData.foodAllowance}
                        onChange={(e) => setFormData({ ...formData, foodAllowance: Number(e.target.value) })}
                        className="w-32 px-3 py-1.5 rounded-lg bg-white border border-emerald-300 font-mono font-bold text-right text-xs"
                      />
                    </div>

                    <div className="pt-2 border-t border-emerald-300 flex items-center justify-between text-xs font-black text-emerald-900">
                      <span>Total Earnings:</span>
                      <span className="font-mono text-sm">₹{totalEarnings.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                {/* Deductions Column */}
                <div className="space-y-3 p-4 rounded-2xl bg-rose-50/60 border border-rose-200">
                  <h4 className="text-xs font-black uppercase text-rose-800 tracking-wider">
                    Deductions Breakdown (INR)
                  </h4>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <label className="text-xs text-slate-700 font-bold">PROF TAX</label>
                      <input
                        type="number"
                        value={formData.profTax}
                        onChange={(e) => setFormData({ ...formData, profTax: Number(e.target.value) })}
                        className="w-32 px-3 py-1.5 rounded-lg bg-white border border-rose-300 font-mono font-bold text-right text-xs"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <label className="text-xs text-slate-700 font-bold">OTHER DEDUCTIONS</label>
                      <input
                        type="number"
                        value={formData.otherDeductions}
                        onChange={(e) => setFormData({ ...formData, otherDeductions: Number(e.target.value) })}
                        className="w-32 px-3 py-1.5 rounded-lg bg-white border border-rose-300 font-mono font-bold text-right text-xs"
                      />
                    </div>

                    <div className="pt-2 border-t border-rose-300 flex items-center justify-between text-xs font-black text-rose-900">
                      <span>Total Deductions:</span>
                      <span className="font-mono text-sm">₹{totalDeductions.toLocaleString('en-IN')}</span>
                    </div>

                    {/* Calculated Net Salary Summary */}
                    <div className="mt-4 p-3 rounded-xl bg-white border border-slate-300 space-y-1">
                      <div className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">Calculated Net Take-Home Salary:</div>
                      <div className="text-lg font-black text-emerald-700 font-mono">₹{netPay.toLocaleString('en-IN')}</div>
                      <div className="text-[11px] font-bold text-slate-700 italic font-serif">({netPayWords})</div>
                    </div>
                  </div>
                </div>

              </div>

            </form>

            {/* Footer Buttons */}
            <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
              <button
                type="button"
                onClick={() => setFormData(defaultFormData)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs"
              >
                Reset Default Values
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="payslip-form"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? <RotateCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>{submitting ? 'Saving to Database...' : 'Save & Update Payslip'}</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
