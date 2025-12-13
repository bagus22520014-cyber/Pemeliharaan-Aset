import React, { useEffect, useRef } from "react";
import { getStatusClass } from "@/utils/format";
import { Save } from "@/components/Icons";
import { FaEdit } from "react-icons/fa";

export default function FormHeader({
  mode,
  form,
  setForm,
  asset,
  statusValue,
  titleValue,
  isEditing,
  loading,
  submitDisabled,
  additionalButtons,
  onCancel,
  showEditButton = false,
  onEdit,
}) {
  const isViewMode = mode === "view";
  const isCreateMode = mode === "create";
  const isEditMode = mode === "edit";
  const nameFilled = Boolean(form?.namaAset?.toString().trim());
  const inputRef = useRef(null);
  const sizerRef = useRef(null);

  // min ~ w-55 (220px), max ~ w-90 (360px)
  const MIN_W = 220;
  const MAX_W = 360;

  useEffect(() => {
    const inp = inputRef.current;
    const sizer = sizerRef.current;
    if (!inp || !sizer) return;
    const text = (form?.namaAset || inp.placeholder || "").toString();
    // set sizer content to measured text
    sizer.textContent = text || inp.placeholder || "";
    // measure and set width (add some padding)
    const measured = Math.ceil(sizer.offsetWidth) + 24; // padding buffer
    const w = Math.min(Math.max(measured, MIN_W), MAX_W);
    inp.style.width = w + "px";
  }, [form?.namaAset, inputRef, sizerRef]);

  return (
    <div className="flex items-center justify-center">
      <div className="flex items-center mr-4">
        <span
          title={isViewMode ? asset?.keterangan ?? "" : "Status: Aktif"}
          aria-label={statusValue ?? "status"}
          className={`inline-block w-5 h-5 rounded-full shadow-sm ${getStatusClass(
            statusValue
          )}`}
        />
      </div>
      <div className="flex-1 flex items-center gap-3">
        {isCreateMode || isEditMode ? (
          <>
            <div className="flex items-center">
              <input
                ref={inputRef}
                type="text"
                value={form?.namaAset || ""}
                onChange={(e) => setForm({ ...form, namaAset: e.target.value })}
                placeholder={isEditing ? "Edit Aset" : "Masukan nama aset"}
                className={`text-xl tracking-wide bg-transparent border-none p-0 focus:outline-none focus:ring-0 placeholder:text-gray-400 ${
                  nameFilled
                    ? "text-black font-semibold"
                    : "text-gray-500 font-normal"
                }`}
              />
              <span aria-hidden className="ml-1 text-red-500 text-base">
                *
              </span>
              {/* hidden sizer for measuring text width */}
              <span
                ref={sizerRef}
                className="invisible absolute whitespace-pre"
              />
            </div>
          </>
        ) : (
          <>
            <h2 className="text-xl font-semibold tracking-wide max-w-md truncate">
              {titleValue}
            </h2>
          </>
        )}
      </div>

      <div className="flex items-center gap-2">
        {additionalButtons}
        <div className="flex items-center gap-3">
          {showEditButton && onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="px-6 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold transition flex items-center gap-2"
            >
              <FaEdit className="h-4 w-4" />
              Edit
            </button>
          )}
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold transition"
          >
            {isViewMode ? "Tutup" : "Batal"}
          </button>
          {(isCreateMode || isEditMode) && (
            <button
              type="submit"
              form="asset-form"
              disabled={loading || submitDisabled}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2 text-white rounded-xl font-semibold transition disabled:opacity-60"
            >
              <Save className="h-4 w-4 text-white" />
              {(() => {
                const raw =
                  typeof window !== "undefined"
                    ? localStorage.getItem("user")
                    : null;
                let isAdmin = false;
                try {
                  const u = raw ? JSON.parse(raw) : null;
                  isAdmin = u?.role === "admin" || u?.role === "Admin";
                } catch (e) {
                  isAdmin = false;
                }
                if (loading) return "Menyimpan...";
                if (isEditing) return "Update";
                return isAdmin ? "Simpan" : "Ajukan";
              })()}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
