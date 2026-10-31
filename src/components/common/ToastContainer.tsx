'use client';

import React from 'react';
import { useSociety } from '@/context/SocietyContext';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export function ToastContainer() {
  const { toasts, removeToast } = useSociety();

  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-3">
      <AnimatePresence>
        {toasts.map((toast) => {
          let icon = <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />;
          let borderColor = 'border-emerald-200';
          let bgColor = 'bg-white';

          if (toast.type === 'error') {
            icon = <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />;
            borderColor = 'border-rose-200';
          } else if (toast.type === 'warning') {
            icon = <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />;
            borderColor = 'border-amber-200';
          } else if (toast.type === 'info') {
            icon = <Info className="w-5 h-5 text-sky-600 flex-shrink-0" />;
            borderColor = 'border-sky-200';
          }

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`pointer-events-auto rounded-xl p-3.5 shadow-lg border ${borderColor} ${bgColor} flex items-start gap-3`}
            >
              <div className="mt-0.5">{icon}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 leading-tight">{toast.title}</p>
                {toast.message && (
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{toast.message}</p>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
                aria-label="Dismiss toast"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
