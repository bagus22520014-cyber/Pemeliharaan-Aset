import React, { useState, useEffect } from "react";
import { FaPlus, FaTrash, FaSave } from "react-icons/fa";
import {
  createAsetLokasi,
  updateAsetLokasi,
  deleteAsetLokasi,
  listAsetLokasi,
} from "@/api/aset-lokasi";

/**
 * Component for managing asset location distribution
 * Allows splitting asset quantity across multiple locations
 */
export default function DistribusiLokasiInput({
  distribusiLokasi = [],
  onChange,
  totalJumlah = 0,
  isViewMode = false,
  asetId = null,
  beban = null,
}) {
  const [showForm, setShowForm] = useState(false);
  const [newLocation, setNewLocation] = useState({
    lokasi: "",
    jumlah: 1,
    keterangan: "",
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [editedIndexes, setEditedIndexes] = useState(new Set());
  const [availableRooms, setAvailableRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [useManualInput, setUseManualInput] = useState(false);

  // Fetch available rooms filtered by beban
  useEffect(() => {
    if (!beban || isViewMode) return;

    let mounted = true;
    async function loadRooms() {
      setLoadingRooms(true);
      try {
        const data = await listAsetLokasi();
        if (mounted) {
          // Filter by beban and get unique room names
          const roomMap = new Map();
          data.forEach((item) => {
            if (
              item.lokasi &&
              item.beban === beban &&
              !roomMap.has(item.lokasi)
            ) {
              roomMap.set(item.lokasi, item.lokasi);
            }
          });
          const sorted = Array.from(roomMap.values()).sort((a, b) =>
            a.localeCompare(b)
          );
          setAvailableRooms(sorted);
        }
      } catch (err) {
        if (mounted) setAvailableRooms([]);
      } finally {
        if (mounted) setLoadingRooms(false);
      }
    }
    loadRooms();
    return () => {
      mounted = false;
    };
  }, [beban, isViewMode]);

  // Calculate total allocated
  const totalAllocated = distribusiLokasi.reduce(
    (sum, d) => sum + (parseInt(d.jumlah) || 0),
    0
  );
  const available = totalJumlah - totalAllocated;

  const handleAdd = () => {
    if (!newLocation.lokasi || !newLocation.jumlah) {
      return;
    }

    const jumlah = parseInt(newLocation.jumlah);
    if (jumlah <= 0) {
      return;
    }

    // Allow adding if totalJumlah is 0 (not set yet) or if within available
    if (totalJumlah > 0 && jumlah > available) {
      return;
    }

    // Just update local state - will be saved when form is submitted
    onChange([...distribusiLokasi, { ...newLocation, jumlah }]);
    setNewLocation({ lokasi: "", jumlah: 1, keterangan: "" });
    setShowForm(false);
  };

  const handleRemove = async (index) => {
    const item = distribusiLokasi[index];

    // If item has id (from backend), delete from backend immediately
    if (item.id) {
      setSaving(true);
      setSaveError(null);
      try {
        await deleteAsetLokasi(item.id);
        onChange(distribusiLokasi.filter((_, i) => i !== index));
      } catch (err) {
        setSaveError(String(err?.message || err));
      } finally {
        setSaving(false);
      }
    } else {
      // Local item (not yet saved), just remove from state
      onChange(distribusiLokasi.filter((_, i) => i !== index));
    }
  };
  const handleUpdate = (index, field, value) => {
    const updated = distribusiLokasi.map((item, i) => {
      if (i === index) {
        return {
          ...item,
          [field]: field === "jumlah" ? parseInt(value) || 0 : value,
        };
      }
      return item;
    });
    onChange(updated);

    // Mark this item as edited
    if (asetId && distribusiLokasi[index]?.id) {
      setEditedIndexes(new Set([...editedIndexes, index]));
    }
  };

  const handleSaveEdits = async () => {
    if (!asetId || editedIndexes.size === 0) return;

    setSaving(true);
    setSaveError(null);

    try {
      // Save all edited items
      for (const index of editedIndexes) {
        const item = distribusiLokasi[index];
        if (item.id) {
          await updateAsetLokasi(item.id, {
            lokasi: item.lokasi,
            jumlah: parseInt(item.jumlah) || 0,
            keterangan: item.keterangan || null,
          });
        }
      }
      setEditedIndexes(new Set());
    } catch (err) {
      setSaveError(String(err?.message || err));
    } finally {
      setSaving(false);
    }
  };

  if (isViewMode) {
    if (!distribusiLokasi || distribusiLokasi.length === 0) {
      return (
        <div className="text-sm text-gray-500 italic">Belum ada ruangan</div>
      );
    }

    return (
      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-700 mb-2">
          Ruangan (Total: {totalAllocated} dari {totalJumlah} unit)
        </div>
        {distribusiLokasi.map((item, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-lg p-3 bg-gray-50"
          >
            <div className="flex justify-between items-start mb-1">
              <div className="font-medium text-gray-900">{item.lokasi}</div>
              <div className="text-sm font-semibold text-indigo-600">
                {item.jumlah} unit
              </div>
            </div>
            {item.keterangan && (
              <div className="text-sm text-gray-600 mt-1">
                {item.keterangan}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header with status */}
      <div className="flex justify-between items-center">
        <div className="text-sm font-medium text-gray-700">Ruangan</div>
        <div className="text-sm">
          <span className="text-gray-600">Tersedia: </span>
          <span
            className={`font-semibold ${
              available > 0 ? "text-green-600" : "text-gray-400"
            }`}
          >
            {available} dari {totalJumlah} unit
          </span>
        </div>
      </div>

      {/* Error message */}
      {saveError && (
        <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          ⚠️ Error: {saveError}
        </div>
      )}

      {/* List of existing locations */}
      {distribusiLokasi.length > 0 && (
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {distribusiLokasi.map((item, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-3 bg-white"
            >
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={item.lokasi}
                  onChange={(e) =>
                    handleUpdate(index, "lokasi", e.target.value)
                  }
                  placeholder="Nama ruangan"
                  disabled={isViewMode}
                  className="flex-1 text-sm border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-300 disabled:bg-gray-50 disabled:text-gray-600 disabled:cursor-not-allowed"
                />
                <input
                  type="number"
                  min="1"
                  max={available + item.jumlah}
                  value={item.jumlah}
                  onChange={(e) =>
                    handleUpdate(index, "jumlah", e.target.value)
                  }
                  disabled={isViewMode}
                  className="w-20 text-sm border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-300 disabled:bg-gray-50 disabled:text-gray-600 disabled:cursor-not-allowed"
                />
                {!isViewMode && (
                  <button
                    type="button"
                    onClick={() => handleRemove(index)}
                    disabled={saving}
                    className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Hapus lokasi"
                  >
                    <FaTrash className="w-3 h-3" />
                  </button>
                )}
              </div>
              <input
                type="text"
                value={item.keterangan || ""}
                onChange={(e) =>
                  handleUpdate(index, "keterangan", e.target.value)
                }
                placeholder="Keterangan (opsional)"
                disabled={isViewMode}
                className="w-full text-sm border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-300 disabled:bg-gray-50 disabled:text-gray-600 disabled:cursor-not-allowed"
              />
            </div>
          ))}
        </div>
      )}

      {/* Add new location form */}
      {showForm ? (
        <div className="border-2 border-dashed border-indigo-300 rounded-lg p-3 bg-indigo-50/30">
          {availableRooms.length > 0 && !useManualInput && (
            <div className="flex justify-end mb-2">
              <button
                type="button"
                onClick={() => setUseManualInput(true)}
                className="text-xs text-indigo-600 hover:text-indigo-700 underline"
              >
                Input manual
              </button>
            </div>
          )}
          {availableRooms.length > 0 && useManualInput && (
            <div className="flex justify-end mb-2">
              <button
                type="button"
                onClick={() => setUseManualInput(false)}
                className="text-xs text-indigo-600 hover:text-indigo-700 underline"
              >
                Pilih dari daftar
              </button>
            </div>
          )}
          <div className="flex gap-2 mb-2">
            {availableRooms.length > 0 && !useManualInput ? (
              <select
                value={newLocation.lokasi}
                onChange={(e) =>
                  setNewLocation({ ...newLocation, lokasi: e.target.value })
                }
                className="flex-1 text-sm border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                disabled={loadingRooms}
                autoFocus
              >
                <option value="">
                  {loadingRooms ? "Loading..." : "Pilih ruangan"}
                </option>
                {availableRooms.map((room) => (
                  <option key={room} value={room}>
                    {room}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={newLocation.lokasi}
                onChange={(e) =>
                  setNewLocation({ ...newLocation, lokasi: e.target.value })
                }
                placeholder="Nama ruangan (misal: Ruang A - Lantai 2)"
                className="flex-1 text-sm border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                autoFocus
              />
            )}
            <input
              type="number"
              min="1"
              max={available}
              value={newLocation.jumlah}
              onChange={(e) =>
                setNewLocation({ ...newLocation, jumlah: e.target.value })
              }
              placeholder="Jumlah"
              className="w-20 text-sm border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-400"
            />
          </div>
          <input
            type="text"
            value={newLocation.keterangan}
            onChange={(e) =>
              setNewLocation({ ...newLocation, keterangan: e.target.value })
            }
            placeholder="Keterangan (opsional)"
            className="w-full text-sm border border-gray-200 rounded px-2 py-1.5 mb-2 focus:outline-none focus:ring-1 focus:ring-indigo-400"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleAdd}
              disabled={
                !newLocation.lokasi ||
                !newLocation.jumlah ||
                (totalJumlah > 0 && available < parseInt(newLocation.jumlah))
              }
              className="flex-1 px-3 py-1.5 bg-indigo-600 text-white rounded text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Tambah
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setUseManualInput(false);
                setNewLocation({ lokasi: "", jumlah: 1, keterangan: "" });
              }}
              className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              Batal
            </button>
          </div>
        </div>
      ) : (
        !isViewMode && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            disabled={totalJumlah > 0 && available <= 0}
            className="w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            <FaPlus className="w-3 h-3" />
            Tambah Ruangan
          </button>
        )
      )}

      {/* Warning when over-allocated */}
      {available < 0 && (
        <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          ⚠️ Total distribusi melebihi jumlah aset ({Math.abs(available)} unit
          lebih)
        </div>
      )}

      {/* Info text */}
      <div className="text-xs text-gray-500 italic">
        Anda dapat membagi {totalJumlah} unit aset ke beberapa lokasi berbeda.
        {available > 0 &&
          ` Masih tersisa ${available} unit yang belum didistribusikan.`}
      </div>
    </div>
  );
}
