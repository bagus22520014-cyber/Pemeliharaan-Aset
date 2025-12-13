import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { FaTimes } from "react-icons/fa";

/**
 * Modal for rejecting approval with reason
 */
export default function RejectModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Tolak Persetujuan",
  resourceType = "Item",
  loading = false,
}) {
  const [alasan, setAlasan] = useState("");
  const [error, setError] = useState("");
  const textareaRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setAlasan("");
      setError("");
      // Focus textarea when modal opens
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = alasan.trim();
    if (!trimmed) {
      setError("Alasan penolakan wajib diisi");
      return;
    }
    setError("");
    onConfirm(trimmed);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  if (!isOpen) return null;

  const modal = (
    <div
      className="fixed inset-0 z-70 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="reject-modal-title"
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3
            id="reject-modal-title"
            className="text-lg font-semibold text-gray-900"
          >
            {title}
          </h3>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1 text-gray-400 hover:text-gray-600 rounded transition disabled:opacity-50"
            aria-label="Tutup"
          >
            <FaTimes />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4">
            <p className="text-sm text-gray-600 mb-4">
              Anda yakin ingin menolak {resourceType.toLowerCase()} ini? Berikan
              alasan penolakan.
            </p>
            <div>
              <label
                htmlFor="alasan-penolakan"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Alasan Penolakan <span className="text-red-500">*</span>
              </label>
              <textarea
                ref={textareaRef}
                id="alasan-penolakan"
                value={alasan}
                onChange={(e) => {
                  setAlasan(e.target.value);
                  if (error) setError("");
                }}
                disabled={loading}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:opacity-50 disabled:bg-gray-50"
                placeholder="Masukkan alasan penolakan..."
                required
              />
              {error && (
                <p className="mt-1 text-sm text-red-600" role="alert">
                  {error}
                </p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading || !alasan.trim()}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? "Memproses..." : "Tolak"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
