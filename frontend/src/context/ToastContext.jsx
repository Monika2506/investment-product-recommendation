import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const success = useCallback((msg, duration) => addToast(msg, 'success', duration), [addToast]);
  const error = useCallback((msg, duration) => addToast(msg, 'error', duration || 5000), [addToast]);
  const warning = useCallback((msg, duration) => addToast(msg, 'warning', duration), [addToast]);
  const info = useCallback((msg, duration) => addToast(msg, 'info', duration), [addToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast, success, error, warning, info }}>
      {children}
      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2 max-w-md w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((toast) => {
          const typeConfig = {
            success: {
              icon: CheckCircle2,
              border: 'border-emerald-500/40',
              bg: 'bg-slate-900/95',
              text: 'text-emerald-400',
              glow: 'shadow-[0_0_20px_rgba(16,185,129,0.2)]',
            },
            error: {
              icon: AlertCircle,
              border: 'border-rose-500/40',
              bg: 'bg-slate-900/95',
              text: 'text-rose-400',
              glow: 'shadow-[0_0_20px_rgba(244,63,94,0.2)]',
            },
            warning: {
              icon: AlertTriangle,
              border: 'border-amber-500/40',
              bg: 'bg-slate-900/95',
              text: 'text-amber-400',
              glow: 'shadow-[0_0_20px_rgba(245,158,11,0.2)]',
            },
            info: {
              icon: Info,
              border: 'border-cyan-500/40',
              bg: 'bg-slate-900/95',
              text: 'text-cyan-400',
              glow: 'shadow-[0_0_20px_rgba(6,182,212,0.2)]',
            },
          }[toast.type] || {
            icon: Info,
            border: 'border-slate-700',
            bg: 'bg-slate-900',
            text: 'text-slate-300',
            glow: '',
          };

          const IconComponent = typeConfig.icon;

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border backdrop-blur-xl transition-all duration-300 transform translate-y-0 ${typeConfig.border} ${typeConfig.bg} ${typeConfig.glow}`}
            >
              <IconComponent className={`w-5 h-5 shrink-0 mt-0.5 ${typeConfig.text}`} />
              <div className="flex-1 text-sm text-slate-200 leading-snug">
                {toast.message}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-slate-200 transition-colors p-0.5 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
