import React from "react";
import {
  X,
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  InfoIcon,
} from "lucide-react";

const Toast = ({ toasts, onClose }) => {
  const getToastColor = (type) => {
    switch (type) {
      case "success":
        return "bg-green-500 border-green-600";
      case "error":
        return "bg-red-500 border-red-600";
      case "warning":
        return "bg-amber-500 border-amber-600";
      case "info":
      default:
        return "bg-blue-500 border-blue-600";
    }
  };

  const getToastIcon = (type) => {
    switch (type) {
      case "success":
        return <CheckCircle size={20} />;
      case "error":
        return <AlertCircle size={20} />;
      case "warning":
        return <AlertTriangle size={20} />;
      case "info":
      default:
        return <InfoIcon size={20} />;
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${getToastColor(toast.type)} border text-white px-4 py-3 rounded-lg shadow-lg flex items-center justify-between gap-4 min-w-max max-w-sm animate-slide-in`}
          role="alert"
          aria-live="polite"
        >
          <div className="flex items-center gap-3">
            {getToastIcon(toast.type)}
            <span>{toast.message}</span>
          </div>
          <button
            onClick={() => onClose(toast.id)}
            className="hover:bg-white hover:bg-opacity-20 rounded p-1 transition"
            aria-label="Dismiss notification"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default Toast;
