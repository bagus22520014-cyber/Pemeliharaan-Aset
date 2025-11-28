import React from "react";
import { formatRupiah, unformatRupiah } from "../utils/format";
import { Save } from "./Icons";

export default function CreateAsset({
  form,
  setForm,
  onSubmit,
  onCancel,
  isEditing = false,
  loading,
  error,
  groups = [],
  bebans = [],
  akun = [],
  disabledBeban = false,
  hideHeader = false,
}) {
  return (
    <div className="bg-white ring-1 ring-gray-200 p-4 rounded-xl shadow-sm w-full">
      {!hideHeader && (
        <h2 className="text-lg font-medium mb-4 text-gray-800 text-center">
          {isEditing ? "Edit Asset" : "Create Asset"}
        </h2>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        {/* INPUT GROUP */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              label: "Aset Id",
              placeholder: "Masukkan Aset Id",
              type: "text",
              value: form.asetId,
              onChange: (v) => setForm({ ...form, asetId: v }),
            },
            {
              label: "Accurate Id",
              placeholder: "Masukkan Accurate Id",
              type: "text",
              value: form.accurateId,
              onChange: (v) => setForm({ ...form, accurateId: v }),
            },
          ].map((field, i) => (
            <label key={i} className="block">
              <span className="text-base text-gray-700 font-semibold">
                {field.label}
              </span>
              <input
                type={field.type}
                placeholder={field.placeholder}
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                className="mt-1 w-full p-2 rounded-lg border border-gray-400 bg-white text-base
        placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </label>
          ))}
        </div>

        <label className="block">
          <span className="text-base text-gray-700 font-semibold">
            Nama Aset
          </span>
          <input
            type="text"
            placeholder="Masukkan Nama Aset"
            value={form.namaAset}
            onChange={(e) => setForm({ ...form, namaAset: e.target.value })}
            className="mt-1 w-full p-2 rounded-lg border border-gray-400 bg-white text-base
    placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </label>

        <label className="block">
          <span className="text-base text-gray-700 font-semibold">
            Spesifikasi
          </span>
          <textarea
            placeholder="Masukkan spesifikasi"
            value={form.spesifikasi}
            onChange={(e) => setForm({ ...form, spesifikasi: e.target.value })}
            className="mt-1 w-full p-2 rounded-lg border border-gray-400 bg-white text-base
    placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 transition-all resize-none h-32"
          />
        </label>

        {/* Grup, Beban, Akun Perkiraan in one row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className="block">
            <span className="text-base text-gray-700 font-semibold">Grup</span>
            <select
              value={form.grup}
              onChange={(e) => setForm({ ...form, grup: e.target.value })}
              className="mt-1 w-full p-2 rounded-lg border border-gray-400 bg-white text-base
                focus:ring-2 focus:ring-indigo-500"
            >
              <option value="" disabled>
                ➕ Tambah Grup
              </option>
              {groups.map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-base text-gray-700 font-semibold">Beban</span>
            <select
              value={form.beban}
              onChange={(e) => setForm({ ...form, beban: e.target.value })}
              disabled={disabledBeban}
              className="mt-1 w-full p-2 rounded-lg border border-gray-400 bg-white disabled:bg-gray-100 text-base
                focus:ring-2 focus:ring-indigo-500"
            >
              <option value="" disabled>
                Pilih Beban
              </option>
              {bebans.map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-base text-gray-700 font-semibold">
              Akun Perkiraan
            </span>
            <select
              value={form.akunPerkiraan}
              onChange={(e) =>
                setForm({ ...form, akunPerkiraan: e.target.value })
              }
              className="mt-1 w-full p-2 rounded-lg border border-gray-400 bg-white text-base
                focus:ring-2 focus:ring-indigo-500"
            >
              <option value="" disabled>
                Pilih Akun Perkiraan
              </option>
              {akun.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          </label>
        </div>

        {/* Nilai Aset */}
        <label className="block">
          <span className="text-base text-gray-700 font-semibold">
            Nilai Aset
          </span>
          <input
            type="text"
            placeholder="Masukkan nilai aset"
            value={formatRupiah(form.nilaiAset)}
            onChange={(e) =>
              setForm({ ...form, nilaiAset: unformatRupiah(e.target.value) })
            }
            className="mt-1 w-full p-2 rounded-lg border border-gray-400 text-base
              placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500"
          />
        </label>

        {/* 2 kolom */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tanggal */}
          <label className="block">
            <span className="text-base text-gray-700 font-semibold">
              Tgl Pembelian
            </span>
            <input
              type="date"
              value={form.tglPembelian}
              onChange={(e) =>
                setForm({ ...form, tglPembelian: e.target.value })
              }
              className="mt-1 w-full p-2 rounded-lg border border-gray-400 text-base
                focus:ring-2 focus:ring-indigo-500"
            />
          </label>

          {/* Masa Manfaat */}
          <label className="block">
            <span className="text-base text-gray-700 font-semibold">
              Masa Manfaat (bulan)
            </span>
            <input
              type="number"
              placeholder="Masukkan masa manfaat (bulan)"
              value={form.masaManfaat}
              onChange={(e) =>
                setForm({ ...form, masaManfaat: e.target.value })
              }
              className="mt-1 w-full p-2 rounded-lg border border-gray-400 text-base
                placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500"
            />
          </label>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 justify-end pt-4">
          {isEditing && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-full border border-gray-400
                text-gray-600 bg-white hover:bg-gray-100 transition"
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2 text-white rounded-full text-base font-semibold transition disabled:opacity-60"
          >
            <Save className="h-4 w-4 text-white" />
            {loading ? "Saving..." : isEditing ? "Update" : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
}
