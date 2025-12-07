import React from "react";
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
            <input
              type="text"
              value={form?.namaAset || ""}
              onChange={(e) => setForm({ ...form, namaAset: e.target.value })}
              placeholder={isEditing ? "Edit Aset *" : "Nama Aset *"}
              className="w-80 text-xl font-semibold tracking-wide bg-transparent border-none p-0 focus:outline-none focus:ring-0 placeholder:text-gray-800"
            />
            <div className="flex items-center gap-2 border-l border-gray-300 pl-3">
              <span className="text-sm text-gray-600">Jumlah:</span>
              <input
                type="number"
                min="0"
                value={form?.jumlah ?? 0}
                onChange={(e) => setForm({ ...form, jumlah: e.target.value })}
                className="w-20 text-lg font-semibold text-indigo-600 bg-transparent border-none p-0 focus:outline-none focus:ring-0 text-center"
              />
            </div>
          </>
        ) : (
          <>
            <h2 className="text-xl font-semibold tracking-wide max-w-md truncate">
              {titleValue}
            </h2>
            <div className="flex items-center gap-2 border-l border-gray-300 pl-3">
              <span className="text-sm text-gray-600">Jumlah:</span>
              <span className="text-lg font-semibold text-indigo-600">
                {asset?.jumlah ?? 0}
              </span>
            </div>
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
              {loading ? "Menyimpan..." : isEditing ? "Update" : "Simpan"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
