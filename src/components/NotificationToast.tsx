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
        let bg = 'bg-[#15151D] text-[#F3EBDD] border-[#30303A]';
        let Icon = Info;
        let iconColor = 'text-[#C8A96E]';

        if (toast.type === 'success') {
          bg = 'bg-[#15151D] text-[#F3EBDD] border-[#829879]/50';
          Icon = CheckCircle2;
          iconColor = 'text-[#829879]';
        } else if (toast.type === 'warning') {
          bg = 'bg-[#15151D] text-[#F3EBDD] border-[#E4B66A]/50';
          Icon = AlertTriangle;
          iconColor = 'text-[#E4B66A]';
        } else if (toast.type === 'error') {
          bg = 'bg-[#15151D] text-[#F3EBDD] border-[#E47777]/50';
          Icon = AlertCircle;
          iconColor = 'text-[#E47777]';
        } else if (toast.type === 'info') {
          bg = 'bg-[#15151D] text-[#F3EBDD] border-[#C8A96E]/50';
          Icon = Info;
          iconColor = 'text-[#C8A96E]';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-2xl transition-all duration-200 ${bg}`}
          >
            <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${iconColor}`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#F3EBDD]">{toast.title}</p>
              {toast.message && (
                <p className="text-xs text-[#A5A3AD] mt-0.5 leading-relaxed">{toast.message}</p>
              )}
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-[#A5A3AD] hover:text-[#F3EBDD] p-1 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96E]"
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
