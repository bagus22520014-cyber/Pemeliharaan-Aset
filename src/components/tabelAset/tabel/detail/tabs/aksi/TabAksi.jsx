import React from "react";
import Confirm from "@/components/Confirm";
import PerbaikanTab from "./PerbaikanTab";
import RusakTab from "./RusakTab";
import DipinjamTab from "./DipinjamTab";
import DijualTab from "./DijualTab";
import { useTabAksi } from "./useTabAksi";

export default function TabAksi({ asetId, asset, onClose, onUpdated }) {
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
    confirmDelete,
    setConfirmDelete,
    confirmCreate,
    setConfirmCreate,
    handleCreateRequest,
    handleCreate,
    handleDelete,
  } = useTabAksi(asetId, asset, onUpdated);

  return (
    <div
      className="bg-gray-100 rounded-2xl shadow-2xl border border-gray-300 overflow-hidden"
      style={{ width: "1388px", height: "692px" }}
    >
      {/* Header - Sticky */}
      <div className="sticky top-0 z-10 bg-gray-100 px-6 pt-6 pb-4 border-b border-gray-300">
        <div className="flex items-center justify-between mb-4">
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

        {/* Sub Tabs */}
        <div className="flex gap-2">
          {[
            { key: "perbaikan", label: "Perbaikan" },
            { key: "rusak", label: "Kerusakan" },
            { key: "dipinjam", label: "Peminjaman" },
            { key: "dijual", label: "Penjualan" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveSubTab(tab.key)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                activeSubTab === tab.key
                  ? "bg-indigo-600 text-white shadow"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div
        className="p-6 overflow-auto"
        style={{ height: "calc(692px - 140px)" }}
      >
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
              : "Penjualan"
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
