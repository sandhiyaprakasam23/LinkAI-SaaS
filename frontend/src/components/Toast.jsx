import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 3500) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => {
          let border = 'border-neon-cyan/40 bg-slate-900/90 text-slate-100 shadow-[0_0_20px_rgba(0,245,255,0.2)]';
          let Icon = CheckCircle2;
          let iconColor = 'text-neon-cyan';

          if (toast.type === 'error') {
            border = 'border-red-500/40 bg-slate-900/90 text-slate-100 shadow-[0_0_20px_rgba(239,68,68,0.2)]';
            Icon = XCircle;
            iconColor = 'text-red-400';
          } else if (toast.type === 'warning') {
            border = 'border-amber-500/40 bg-slate-900/90 text-slate-100 shadow-[0_0_20px_rgba(245,158,11,0.2)]';
            Icon = AlertTriangle;
            iconColor = 'text-amber-400';
          } else if (toast.type === 'info') {
            border = 'border-purple-500/40 bg-slate-900/90 text-slate-100 shadow-[0_0_20px_rgba(168,85,247,0.2)]';
            Icon = Info;
            iconColor = 'text-purple-400';
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-center justify-between p-3.5 rounded-xl border backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 ${border}`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 shrink-0 ${iconColor}`} />
                <span className="text-sm font-medium">{toast.message}</span>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    return { addToast: (msg) => console.log('Toast:', msg) };
  }
  return context;
}
