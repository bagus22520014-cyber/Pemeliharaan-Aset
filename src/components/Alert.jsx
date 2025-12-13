import React, { useEffect } from "react";
import {
  FiCheckCircle,
  FiXCircle,
  FiAlertTriangle,
  FiInfo,
  FiX,
} from "react-icons/fi";

export default function ({
  type = "info",
  message = "",
  onClose,
  duration = 4000,
}) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => onClose?.(), duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const base =
    "px-4 py-3 rounded-lg shadow-xl text-sm flex items-center justify-between w-full gap-4 border transition-all duration-200 backdrop-blur-md";

  const styleType = {
    success: {
      bg: "bg-green-100/90 border-green-300 text-green-900",
      icon: <FiCheckCircle className="text-xl text-green-600" />,
      label: "Berhasil",
    },
    error: {
      bg: "bg-red-100/90 border-red-300 text-red-900",
      icon: <FiXCircle className="text-xl text-red-600" />,
      label: "Error",
    },
    warning: {
      bg: "bg-amber-100/90 border-amber-300 text-amber-900",
      icon: <FiAlertTriangle className="text-xl text-amber-600" />,
      label: "Peringatan",
    },
    info: {
      bg: "bg-blue-100/90 border-blue-300 text-blue-900",
      icon: <FiInfo className="text-xl text-blue-600" />,
      label: "Info",
    },
  };

  const { bg, icon, label } = styleType[type] || styleType.info;

  return (
    <div className="fixed bottom-6 right-6 z-999 animate-slide">
      <div className={`${base} ${bg}`} role="alert">
        <div className="flex items-center gap-3">
          {icon}
          <div>
            <div className="font-semibold">{label}</div>
            <div className="text-xs opacity-90 whitespace-pre-line">
              {message}
            </div>
          </div>
        </div>

        <button
          aria-label="close"
          onClick={() => onClose?.()}
          className="text-gray-500 hover:text-gray-800 transition text-lg"
        >
          <FiX />
        </button>
      </div>

      <style>{`
        @keyframes slide {
          from {
            transform: translateX(30px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide {
          animation: slide .25s ease-out;
        }
      `}</style>
    </div>
  );
}
