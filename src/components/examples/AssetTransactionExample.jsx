/**
 * Example integration of transaction modals in AssetDetail component
 * Shows how to use PerbaikanModal, RusakModal, DipinjamModal, and DijualModal
 */

import React, { useState } from "react";
import PerbaikanModal from "@/components/PerbaikanModal";
import RusakModal from "@/components/RusakModal";
import DipinjamModal from "@/components/DipinjamModal";
import DijualModal from "@/components/DijualModal";
import {
  FaTools,
  FaBan,
  FaHandHoldingUsd,
  FaMoneyBillWave,
} from "react-icons/fa";

export default function AssetDetailWithTransactions({ asset, onAssetUpdate }) {
  const [showPerbaikan, setShowPerbaikan] = useState(false);
  const [showRusak, setShowRusak] = useState(false);
  const [showDipinjam, setShowDipinjam] = useState(false);
  const [showDijual, setShowDijual] = useState(false);

  const handleTransactionSuccess = () => {
    // Refresh asset data after transaction
    onAssetUpdate?.();
  };

  return (
    <div className="space-y-4">
      {/* Asset Info Display */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-2">{asset.namaAset}</h2>
        <div className="text-sm text-gray-600">ID: {asset.asetId}</div>
        <div className="text-sm text-gray-600">Total Unit: {asset.jumlah}</div>
      </div>

      {/* Transaction Action Buttons */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Transaksi Aset</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Perbaikan Button */}
          <button
            onClick={() => setShowPerbaikan(true)}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaTools />
            <span>Perbaikan</span>
          </button>

          {/* Rusak Button */}
          <button
            onClick={() => setShowRusak(true)}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <FaBan />
            <span>Catat Rusak</span>
          </button>

          {/* Dipinjam Button */}
          <button
            onClick={() => setShowDipinjam(true)}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <FaHandHoldingUsd />
            <span>Pinjamkan</span>
          </button>

          {/* Dijual Button */}
          <button
            onClick={() => setShowDijual(true)}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <FaMoneyBillWave />
            <span>Jual Aset</span>
          </button>
        </div>
      </div>

      {/* Transaction Modals */}
      <PerbaikanModal
        asetId={asset.asetId}
        open={showPerbaikan}
        onClose={() => setShowPerbaikan(false)}
        onChange={handleTransactionSuccess}
      />

      <RusakModal
        asetId={asset.asetId}
        namaAset={asset.namaAset}
        open={showRusak}
        onClose={() => setShowRusak(false)}
        onSuccess={handleTransactionSuccess}
      />

      <DipinjamModal
        asetId={asset.asetId}
        namaAset={asset.namaAset}
        open={showDipinjam}
        onClose={() => setShowDipinjam(false)}
        onSuccess={handleTransactionSuccess}
      />

      <DijualModal
        asetId={asset.asetId}
        namaAset={asset.namaAset}
        open={showDijual}
        onClose={() => setShowDijual(false)}
        onSuccess={handleTransactionSuccess}
      />
    </div>
  );
}
