import React from 'react';
import { Send, AlertTriangle, Trash2, X } from 'lucide-react';
import { Button } from './button';

export default function ConfirmModal({
  isOpen,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "OK",
  cancelText = "Cancel",
  type = "primary",
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
      <div className="relative w-full max-w-[360px] min-h-[270px] bg-white border-2 border-black rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col justify-between">
        
        <div>
          {/* Top Header Card */}
          <div className={`p-5 bg-gradient-to-br ${bgGradients[type]} border-b border-slate-200 flex items-start justify-between`}>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white shadow-xs flex items-center justify-center border border-slate-900/20 shrink-0">
                {icons[type]}
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 tracking-tight leading-snug">{title}</h3>
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">AOTMS Action</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="p-1 rounded-xl bg-white/90 hover:bg-white text-slate-400 hover:text-slate-900 transition-colors cursor-pointer border border-black/10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Message Content with slightly increased height padding */}
          <div className="p-6 py-7 space-y-3">
            <p className="text-xs text-slate-800 leading-relaxed font-bold">
              {message}
            </p>
          </div>
        </div>

        {/* OK / Cancel Action Buttons */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5 shrink-0">
          <Button
            variant="outline"
            size="default"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 rounded-xl text-slate-700 font-extrabold text-xs cursor-pointer hover:bg-slate-200/70 border-slate-300"
          >
            {cancelText}
          </Button>

          <Button
            variant={type === 'danger' ? 'destructive' : 'default'}
            size="default"
            onClick={onConfirm}
            disabled={loading}
            className={`px-5 py-2 rounded-xl font-black text-xs cursor-pointer shadow-md ${
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
