import React from 'react';
import { Send, AlertTriangle, Trash2, CheckCircle2, X } from 'lucide-react';
import { Button } from './button';

export default function ConfirmModal({
  isOpen,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "OK",
  cancelText = "Cancel",
  type = "primary", // "primary", "danger", "warning"
  loading = false,
  onConfirm,
  onCancel
}) {
  if (!isOpen) return null;

  const icons = {
    primary: <Send className="w-6 h-6 text-emerald-600" />,
    danger: <Trash2 className="w-6 h-6 text-rose-600" />,
    warning: <AlertTriangle className="w-6 h-6 text-amber-600" />
  };

  const bgGradients = {
    primary: "from-emerald-50 to-teal-50 border-emerald-200",
    danger: "from-rose-50 to-red-50 border-rose-200",
    warning: "from-amber-50 to-yellow-50 border-amber-200"
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col">
        
        {/* Top Header Card */}
        <div className={`p-6 bg-gradient-to-br ${bgGradients[type]} border-b flex items-start justify-between`}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center border border-slate-200/80 shrink-0">
              {icons[type]}
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 tracking-tight">{title}</h3>
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">Inside Website Action</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="p-1 rounded-xl bg-white/80 hover:bg-white text-slate-400 hover:text-slate-700 transition-colors cursor-pointer border border-slate-200/60"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message Content */}
        <div className="p-6 space-y-3">
          <p className="text-xs text-slate-700 leading-relaxed font-semibold">
            {message}
          </p>
        </div>

        {/* OK / Cancel Action Buttons */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
          <Button
            variant="outline"
            size="default"
            onClick={onCancel}
            disabled={loading}
            className="px-5 py-2 rounded-xl text-slate-700 font-extrabold text-xs cursor-pointer hover:bg-slate-100"
          >
            {cancelText}
          </Button>

          <Button
            variant={type === 'danger' ? 'destructive' : 'default'}
            size="default"
            onClick={onConfirm}
            disabled={loading}
            className={`px-6 py-2 rounded-xl font-black text-xs cursor-pointer shadow-sm ${
              type === 'danger'
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {loading ? "Processing..." : confirmText}
          </Button>
        </div>

      </div>
    </div>
  );
}
