import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message?: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      role="region"
      aria-live="polite"
      aria-label="Notifications"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full px-4 pointer-events-none no-print"
    >
      {toasts.map((toast) => {
        let border = 'border-[#EADCE1]';
        let Icon = Info;
        let iconColor = 'text-[#B85F80]';

        if (toast.type === 'success') {
          border = 'border-emerald-200 bg-[#F0F7F4]/40';
          Icon = CheckCircle2;
          iconColor = 'text-[#477D60]';
        } else if (toast.type === 'warning') {
          border = 'border-amber-200 bg-[#FFF8ED]/40';
          Icon = AlertTriangle;
          iconColor = 'text-[#A87531]';
        } else if (toast.type === 'error') {
          border = 'border-rose-200 bg-[#FFF0F3]/40';
          Icon = AlertCircle;
          iconColor = 'text-[#B94D5A]';
        } else if (toast.type === 'info') {
          border = 'border-[#E9B9C9] bg-[#FFF0F3]/40';
          Icon = Info;
          iconColor = 'text-[#B85F80]';
        }

        return (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl bg-white border shadow-xl transition-all duration-200 ${border}`}
          >
            <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${iconColor}`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#392832]">{toast.title}</p>
              {toast.message && (
                <p className="text-xs text-[#74616B] mt-0.5 leading-relaxed">{toast.message}</p>
              )}
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-[#998791] hover:text-[#392832] p-1 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B85F80]"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
