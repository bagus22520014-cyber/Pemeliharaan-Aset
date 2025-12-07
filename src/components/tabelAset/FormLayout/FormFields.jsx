import React from "react";
import { formatRupiah, unformatRupiah } from "@/utils/format";
import { FaRegEdit, FaLock } from "react-icons/fa";
import FormField from "./FormField";
import DistribusiLokasiInput from "./DistribusiLokasiInput";

export default function FormFields({
  mode,
  form,
  setForm,
  displayData,
  groups,
  bebans,
  departemen,
  akun,
  masterBebans,
  readOnlyAsetId,
  autoAsetId,
  suggestedAsetId,
  manualMode,
  toggleManualMode,
  disabledBeban,
  copiedKey,
  handleCopyToClipboard,
  distribusiLokasi = null,
  onDistribusiChange = null,
}) {
  const isViewMode = mode === "view";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Aset ID */}
      <FormField
        label="Aset ID *"
        value={form?.asetId || autoAsetId || suggestedAsetId || ""}
        displayValue={displayData?.asetId ?? displayData?.id}
        isViewMode={isViewMode}
        placeholder="Masukkan Aset ID"
        onChange={(e) => setForm({ ...form, asetId: e.target.value })}
        readOnly={readOnlyAsetId || !manualMode}
        copyable
        copiedKey={copiedKey}
        fieldKey="asetId"
        onCopy={handleCopyToClipboard}
        editButton={
          !isViewMode &&
          !readOnlyAsetId &&
          toggleManualMode && (
            <button
              type="button"
              onClick={toggleManualMode}
              title={manualMode ? "Switch to auto-generated" : "Edit manually"}
              className="absolute right-0 top-1/2 -translate-y-1/2 p-1 rounded text-gray-500 hover:bg-gray-100"
            >
              {manualMode ? (
                <FaLock className="h-3 w-3" />
              ) : (
                <FaRegEdit className="h-3 w-3" />
              )}
            </button>
          )
        }
      />

      {/* Accurate ID */}
      <FormField
        label="Accurate ID"
        value={form?.accurateId}
        displayValue={displayData?.accurateId}
        isViewMode={isViewMode}
        placeholder="Masukkan Accurate ID"
        onChange={(e) => setForm({ ...form, accurateId: e.target.value })}
        copyable
        copiedKey={copiedKey}
        fieldKey="accurateId"
        onCopy={handleCopyToClipboard}
      />

      {/* Spesifikasi */}
      <FormField
        label="Spesifikasi"
        isViewMode={isViewMode}
        className="md:col-span-2 h-36"
      >
        {isViewMode ? (
          <div className="text-base mt-1 whitespace-pre-line">
            {displayData?.spesifikasi ?? "-"}
          </div>
        ) : (
          <textarea
            value={form?.spesifikasi || ""}
            onChange={(e) => setForm({ ...form, spesifikasi: e.target.value })}
            placeholder="Masukkan spesifikasi aset"
            className="w-full text-base mt-1 bg-transparent border-none p-0 focus:outline-none focus:ring-0 resize-none h-32"
          />
        )}
      </FormField>

      {
        /* Kategori */
        <FormField label="Kategori *" isViewMode={isViewMode}>
          {isViewMode ? (
            <div className="text-base mt-1">{displayData?.grup ?? "-"}</div>
          ) : (
            <select
              value={form?.grup || ""}
              onChange={(e) => setForm({ ...form, grup: e.target.value })}
              className="w-full text-base mt-1 bg-transparent border-none p-0 focus:outline-none focus:ring-0 text-gray-400"
              style={{ color: form?.grup ? "#1f2937" : "#9ca3af" }}
            >
              <option value="" className="text-gray-400">
                Pilih kategori
              </option>
              {groups.map((g) => (
                <option key={g} className="text-gray-900">
                  {g}
                </option>
              ))}
            </select>
          )}
        </FormField>
      }
      <FormField label="Akun Perkiraan *" isViewMode={isViewMode}>
        {isViewMode ? (
          <div className="text-base mt-1">
            {displayData?.akunPerkiraan ?? "-"}
          </div>
        ) : (
          <select
            value={form?.akunPerkiraan || ""}
            onChange={(e) =>
              setForm({ ...form, akunPerkiraan: e.target.value })
            }
            className="w-full text-base mt-1 bg-transparent border-none p-0 focus:outline-none focus:ring-0 text-gray-400"
            style={{
              color: form?.akunPerkiraan ? "#1f2937" : "#9ca3af",
            }}
          >
            <option value="" className="text-gray-400">
              Pilih akun perkiraan
            </option>
            {akun.map((a) => (
              <option key={a} className="text-gray-900">
                {a}
              </option>
            ))}
          </select>
        )}
      </FormField>

      {/* Harga Perolehan */}
      <FormField label="Harga Perolehan *" isViewMode={isViewMode}>
        {isViewMode ? (
          <div className="text-base mt-1 font-bold text-gray-900">
            {displayData?.nilaiAset != null
              ? formatRupiah(displayData.nilaiAset)
              : "-"}
          </div>
        ) : (
          <input
            type="text"
            value={formatRupiah(form?.nilaiAset)}
            onChange={(e) =>
              setForm({
                ...form,
                nilaiAset: unformatRupiah(e.target.value),
              })
            }
            placeholder="Masukkan total harga"
            className="w-full text-base mt-1 bg-transparent border-none p-0 focus:outline-none focus:ring-0"
          />
        )}
      </FormField>

      {/* Beban */}
      <FormField label="Beban *" isViewMode={isViewMode}>
        {isViewMode ? (
          <div className="text-base mt-1">
            {typeof displayData?.beban === "string"
              ? displayData.beban
              : displayData?.beban?.kode || displayData?.bebanKode || "-"}
          </div>
        ) : (
          <select
            value={form?.beban || ""}
            onChange={(e) => setForm({ ...form, beban: e.target.value })}
            disabled={disabledBeban}
            className="w-full text-base mt-1 bg-transparent border-none p-0 focus:outline-none focus:ring-0 disabled:opacity-50 text-gray-400"
            style={{ color: form?.beban ? "#1f2937" : "#9ca3af" }}
          >
            <option value="" className="text-gray-400">
              Pilih beban
            </option>
            {bebans && bebans.length > 0
              ? bebans.map((b) => {
                  const bebanValue =
                    typeof b === "string" ? b : b?.kode || String(b);
                  return (
                    <option
                      key={bebanValue}
                      value={bebanValue}
                      className="text-gray-900"
                    >
                      {bebanValue}
                    </option>
                  );
                })
              : masterBebans.map((b) => {
                  const bebanValue =
                    typeof b === "string" ? b : b?.kode || String(b);
                  return (
                    <option
                      key={bebanValue}
                      value={bebanValue}
                      className="text-gray-900"
                    >
                      {bebanValue}
                    </option>
                  );
                })}
          </select>
        )}
      </FormField>

      {/* Departemen */}
      <FormField label="Departemen" isViewMode={isViewMode}>
        {isViewMode ? (
          <div className="text-base mt-1">
            {displayData?.departemen?.nama ||
              displayData?.departemenNama ||
              displayData?.departemen?.kode ||
              displayData?.departemenKode ||
              "-"}
          </div>
        ) : (
          <select
            value={form?.departemen_id || ""}
            onChange={(e) =>
              setForm({ ...form, departemen_id: e.target.value })
            }
            className="w-full text-base mt-1 bg-transparent border-none p-0 focus:outline-none focus:ring-0 text-gray-400"
            style={{ color: form?.departemen_id ? "#1f2937" : "#9ca3af" }}
          >
            <option value="" className="text-gray-400">
              Pilih departemen
            </option>
            {departemen && departemen.length > 0 ? (
              departemen.map((d) => (
                <option key={d.id} value={d.id} className="text-gray-900">
                  {d.nama || d.kode}
                </option>
              ))
            ) : (
              <option disabled className="text-gray-400">
                Tidak ada departemen
              </option>
            )}
          </select>
        )}
      </FormField>

      {/* Tanggal Pembelian */}
      <FormField
        label="Tanggal Perolehan *"
        value={form?.tglPembelian}
        displayValue={displayData?.tglPembelian}
        isViewMode={isViewMode}
        type="date"
        onChange={(e) => setForm({ ...form, tglPembelian: e.target.value })}
      />

      {/* Masa Manfaat */}
      <FormField label="Masa Manfaat" isViewMode={isViewMode}>
        {isViewMode ? (
          <div className="text-base mt-1">
            {displayData?.masaManfaat != null
              ? `${displayData.masaManfaat} bulan`
              : "-"}
          </div>
        ) : (
          <div className="flex items-center gap-2 mt-1">
            <input
              type="number"
              value={form?.masaManfaat || ""}
              onChange={(e) =>
                setForm({ ...form, masaManfaat: e.target.value })
              }
              placeholder="Masukkan masa manfaat"
              className="w-full text-base bg-transparent border-none p-0 focus:outline-none focus:ring-0"
            />
            {form?.masaManfaat && <span className="text-base">bulan</span>}
          </div>
        )}
      </FormField>

      {/* Pengguna */}
      <FormField
        label="Pengguna"
        value={form?.pengguna}
        displayValue={displayData?.pengguna}
        isViewMode={isViewMode}
        placeholder="Masukkan pengguna"
        onChange={(e) => setForm({ ...form, pengguna: e.target.value })}
      />

      {/* Lokasi */}
      <FormField
        label="Lokasi"
        value={form?.lokasi}
        displayValue={displayData?.lokasi || displayData?.Lokasi}
        isViewMode={isViewMode}
        placeholder="Masukkan lokasi"
        onChange={(e) => setForm({ ...form, lokasi: e.target.value })}
        className="md:col-span-2"
      />

      {/* Distribusi Lokasi - Full width */}
      <div className="md:col-span-2">
        <FormField label="Ruangan" isViewMode={isViewMode}>
          <div className="mt-2">
            <DistribusiLokasiInput
              distribusiLokasi={
                distribusiLokasi?.locations ||
                form?.distribusi_lokasi ||
                displayData?.distribusi_lokasi?.locations ||
                []
              }
              onChange={(newDistribusi) => {
                if (isViewMode && onDistribusiChange) {
                  // In view mode, update the fetched distribusiLokasi state
                  onDistribusiChange({
                    ...distribusiLokasi,
                    locations: newDistribusi,
                    total_allocated: newDistribusi.reduce(
                      (sum, loc) => sum + (parseInt(loc.jumlah) || 0),
                      0
                    ),
                    available:
                      (displayData?.jumlah || 0) -
                      newDistribusi.reduce(
                        (sum, loc) => sum + (parseInt(loc.jumlah) || 0),
                        0
                      ),
                  });
                } else {
                  // In create/edit mode, update form
                  setForm({ ...form, distribusi_lokasi: newDistribusi });
                }
              }}
              totalJumlah={
                isViewMode
                  ? displayData?.jumlah || 0
                  : parseInt(form?.jumlah) || 0
              }
              isViewMode={isViewMode}
              asetId={displayData?.asetId || displayData?.id || null}
              beban={
                isViewMode
                  ? typeof displayData?.beban === "string"
                    ? displayData.beban
                    : displayData?.beban?.kode || displayData?.bebanKode
                  : form?.beban
              }
            />
          </div>
        </FormField>
      </div>
    </div>
  );
}
