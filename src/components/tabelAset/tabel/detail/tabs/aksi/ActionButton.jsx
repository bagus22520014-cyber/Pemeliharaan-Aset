import React from "react";

export default function ActionButton({ type, loading, onClick }) {
  const configs = {
    aktif: {
      color: "bg-green-500 hover:bg-green-600",
      label: "Tambah Data Aset",
    },
    rusak: {
      color: "bg-red-500 hover:bg-red-600",
      label: "Catat Kerusakan Aset",
    },
    diperbaiki: {
      color: "bg-yellow-500 hover:bg-yellow-600",
      label: "Tambah Perbaikan Aset",
    },
    dipinjam: {
      color: "bg-indigo-600 hover:bg-indigo-700",
      label: "Catat Peminjaman Aset",
    },
    dijual: {
      color: "bg-gray-500 hover:bg-gray-600",
      label: "Catat Penjualan Aset",
    },
    mutasi: {
      color: "bg-blue-500 hover:bg-blue-600",
      label: "Simpan Mutasi Aset",
    },
  };

  const config = configs[type] || configs.aktif;
  const raw =
    typeof window !== "undefined" ? localStorage.getItem("user") : null;
  let isAdmin = false;
  try {
    const u = raw ? JSON.parse(raw) : null;
    isAdmin = u?.role === "admin" || u?.role === "Admin";
  } catch (e) {
    isAdmin = false;
  }

  const displayLabel = (() => {
    if (loading) return "Menyimpan...";
    let lbl = String(config.label || "");
    if (!isAdmin) {
      // Replace leading 'Simpan' or 'Catat' with 'Ajukan'
      lbl = lbl.replace(/^Simpan\b/, "Ajukan");
      lbl = lbl.replace(/^Catat\b/, "Ajukan");
    }
    return lbl;
  })();

  return (
    <div className="absolute bottom-6 right-6 z-20">
      <button
        onClick={onClick}
        disabled={loading}
        className={`px-4 py-2 ${config.color} text-white rounded-xl 
        disabled:bg-gray-300 disabled:cursor-not-allowed font-bold transition-all 
        duration-300 shadow-lg hover:shadow-xl`}
      >
        {displayLabel}
      </button>
    </div>
  );
}
