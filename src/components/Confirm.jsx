import React, { useEffect, useRef } from "react";
import { Close } from "./Icons";

export default function Confirm({
  open = false,
  title = "Confirm",
  message = "Are you sure?",
  confirmLabel = "Yes",
  cancelLabel = "Cancel",
  danger = false,
  onClose,
  onConfirm,
}) {
  const ref = useRef();

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
      if (e.key === "Enter") onConfirm?.();
    };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, onConfirm]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay Blur */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        ref={ref}
        className="
          z-10 max-w-md w-full rounded-2xl 
          bg-white/90 backdrop-blur-xl 
          shadow-2xl border border-white/30 
          animate-fadeInScale
        "
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-200/60 flex justify-between items-center">
          <h3 className="text-lg font-semibold tracking-wide">{title}</h3>

          {/* Close button */}
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 transition"
            aria-label="Close"
            title="Close"
          >
            <Close className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          <p className="text-gray-700 leading-relaxed">{message}</p>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-200/60 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="
              px-4 py-2 rounded-xl 
              bg-gray-100 hover:bg-gray-200 
              text-gray-700 transition font-medium
            "
          >
            {cancelLabel}
          </button>

          <button
            onClick={() => onConfirm?.()}
            className={`
              px-4 py-2 rounded-xl text-white font-medium transition
              ${
                danger
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-indigo-600 hover:bg-indigo-700"
              }
            `}
          >
            {confirmLabel}
          </button>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes fadeInScale {
          0% { opacity: 0; transform: scale(0.9); }
          100% { opacity: 1; transform: scale(1); }
        }
        .animate-fadeInScale {
          animation: fadeInScale 0.18s ease-out;
        }
      `}</style>
    </div>
  );
}
