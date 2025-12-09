import React from "react";
import Confirm from "@/components/Confirm";
import PerbaikanTab from "./PerbaikanTab";
import RusakTab from "./RusakTab";
import DipinjamTab from "./DipinjamTab";
import DijualTab from "./DijualTab";
import MutasiTab from "./MutasiTab";
import { useTabAksi } from "./useTabAksi";

export default function TabAksi({
  asetId,
  asset,
  onClose,
  onUpdated,
  onSwitchToRiwayat,
}) {
  const {
    activeSubTab,
    setActiveSubTab,
    loading,
    error,
    success,
    repairs,
    repairForm,
    setRepairForm,
    damages,
    damageForm,
    setDamageForm,
    borrows,
    borrowForm,
    setBorrowForm,
    sales,
    saleForm,
    setSaleForm,
    mutations,
    mutationForm,
    setMutationForm,
    confirmDelete,
    setConfirmDelete,
    confirmCreate,
    setConfirmCreate,
    handleCreateRequest,
    handleCreate,
    handleDelete,
  } = useTabAksi(asetId, asset, onUpdated, onSwitchToRiwayat);

  const tabColors = {
    mutasi: "bg-blue-500",
    perbaikan: "bg-yellow-500",
    rusak: "bg-red-500",
    dipinjam: "bg-indigo-600",
    dijual: "bg-gray-500",
  };

  return (
    <div
      className="bg-gray-100 rounded-2xl shadow-2xl border border-gray-300 overflow-hidden relative flex"
      style={{ width: "1388px", height: "692px" }}
    >
      {/* Sidebar Tabs - Vertical */}
      <div className="w-48 bg-white border-r border-gray-300 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-300">
          <h3 className="font-semibold text-gray-700 text-sm">Tab Aksi</h3>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-col p-2 space-y-1">
          {[
            { key: "mutasi", label: "Mutasi" },
            { key: "perbaikan", label: "Perbaikan" },
            { key: "rusak", label: "Kerusakan" },
            { key: "dipinjam", label: "Peminjaman" },
            { key: "dijual", label: "Penjualan" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveSubTab(tab.key)}
              className={`px-4 py-2.5 rounded-lg font-medium transition text-left ${
                activeSubTab === tab.key
                  ? `${tabColors[tab.key]} text-white shadow`
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-gray-100 px-6 py-4 border-b border-gray-300 flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-wide">
            Aksi Aset: {asetId}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold transition"
          >
            Tutup
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-auto flex-1">
          {/* Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-300 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-300 text-green-700 rounded-lg">
              {success}
            </div>
          )}

          {/* Perbaikan Tab */}
          {activeSubTab === "perbaikan" && (
            <PerbaikanTab
              asetId={asetId}
              form={repairForm}
              setForm={setRepairForm}
              repairs={repairs}
              loading={loading}
              onCreateRequest={() => handleCreateRequest("perbaikan")}
              onDelete={(id) =>
                setConfirmDelete({ open: true, id, type: "perbaikan" })
              }
            />
          )}

          {/* Rusak Tab */}
          {activeSubTab === "rusak" && (
            <RusakTab
              asetId={asetId}
              form={damageForm}
              setForm={setDamageForm}
              damages={damages}
              loading={loading}
              onCreateRequest={() => handleCreateRequest("rusak")}
              onDelete={(id) =>
                setConfirmDelete({ open: true, id, type: "rusak" })
              }
            />
          )}

          {/* Dipinjam Tab */}
          {activeSubTab === "dipinjam" && (
            <DipinjamTab
              asetId={asetId}
              form={borrowForm}
              setForm={setBorrowForm}
              borrows={borrows}
              loading={loading}
              onCreateRequest={() => handleCreateRequest("dipinjam")}
              onDelete={(id) =>
                setConfirmDelete({ open: true, id, type: "dipinjam" })
              }
            />
          )}

          {/* Dijual Tab */}
          {activeSubTab === "dijual" && (
            <DijualTab
              asetId={asetId}
              form={saleForm}
              setForm={setSaleForm}
              sales={sales}
              loading={loading}
              onCreateRequest={() => handleCreateRequest("dijual")}
              onDelete={(id) =>
                setConfirmDelete({ open: true, id, type: "dijual" })
              }
            />
          )}

          {/* Mutasi Tab */}
          {activeSubTab === "mutasi" && (
            <MutasiTab
              asetId={asetId}
              asset={asset}
              form={mutationForm}
              setForm={setMutationForm}
              mutations={mutations}
              loading={loading}
              onCreateRequest={() => handleCreateRequest("mutasi")}
              onDelete={(id) =>
                setConfirmDelete({ open: true, id, type: "mutasi" })
              }
            />
          )}
        </div>
      </div>

      {/* Confirm Create Dialog */}
      {confirmCreate.open && (
        <Confirm
          open={confirmCreate.open}
          title={`Konfirmasi ${
            confirmCreate.type === "perbaikan"
              ? "Perbaikan"
              : confirmCreate.type === "rusak"
              ? "Kerusakan"
              : confirmCreate.type === "dipinjam"
              ? "Peminjaman"
              : confirmCreate.type === "dijual"
              ? "Penjualan"
              : "Mutasi"
          }`}
          message={`Tambah data ${confirmCreate.type} untuk aset ${asetId}?`}
          onClose={() => setConfirmCreate({ open: false, type: null })}
          onConfirm={handleCreate}
          confirmLabel="Tambah"
        />
      )}

      {/* Confirm Delete Dialog */}
      {confirmDelete.open && (
        <Confirm
          open={confirmDelete.open}
          title="Hapus Data"
          message="Yakin ingin menghapus data ini?"
          danger={true}
          onClose={() =>
            setConfirmDelete({ open: false, id: null, type: null })
          }
          onConfirm={() => handleDelete(confirmDelete.id, confirmDelete.type)}
          confirmLabel="Hapus"
        />
      )}
    </div>
  );
}
