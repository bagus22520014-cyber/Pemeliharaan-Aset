import React, { useState, useEffect } from "react";
import { getAsetLokasiByAsetId } from "@/api/aset-lokasi";

/**
 * Component to select location for transaction
 * Shows available stock per location
 */
export default function LocationSelector({
  asetId,
  selectedLokasiId,
  onSelect,
  jumlahDiperlukan = 1,
  disabled = false,
  label = "Lokasi",
  required = true,
}) {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!asetId) {
      setLocations([]);
      return;
    }

    let mounted = true;
    async function loadLocations() {
      setLoading(true);
      setError(null);
      try {
        const data = await getAsetLokasiByAsetId(asetId);
        if (mounted) {
          // Filter locations with available stock
          const available = (data.locations || []).filter(
            (loc) => loc.jumlah > 0
          );
          setLocations(available);

          // Auto-select if only one location available
          if (available.length === 1 && !selectedLokasiId) {
            onSelect(available[0].id);
          }
        }
      } catch (err) {
        if (mounted) {
          setError(String(err.message || err));
          setLocations([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadLocations();
    return () => {
      mounted = false;
    };
  }, [asetId]);

  // Get selected location details
  const selectedLocation = locations.find((loc) => loc.id === selectedLokasiId);
  const isStockSufficient =
    selectedLocation && selectedLocation.jumlah >= jumlahDiperlukan;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {loading && (
        <div className="text-sm text-gray-500 italic">Loading lokasi...</div>
      )}

      {error && (
        <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          ⚠️ {error}
        </div>
      )}

      {!loading && !error && locations.length === 0 && (
        <div className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded px-3 py-2">
          ⚠️ Tidak ada lokasi dengan stok tersedia
        </div>
      )}

      {!loading && locations.length > 0 && (
        <>
          <select
            value={selectedLokasiId || ""}
            onChange={(e) =>
              onSelect(e.target.value ? parseInt(e.target.value) : null)
            }
            disabled={disabled || loading}
            required={required}
            className="w-full border border-gray-200 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
          >
            <option value="">Pilih ruangan</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.lokasi} - Stok: {loc.jumlah} unit
              </option>
            ))}
          </select>

          {/* Stock warning */}
          {selectedLocation && !isStockSufficient && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
              ⚠️ Stok tidak mencukupi. Tersedia: {selectedLocation.jumlah} unit,
              Diperlukan: {jumlahDiperlukan} unit
            </div>
          )}

          {/* Stock info */}
          {selectedLocation && isStockSufficient && (
            <div className="text-xs text-green-600 bg-green-50 border border-green-200 rounded px-3 py-2">
              ✓ Stok tersedia: {selectedLocation.jumlah} unit di{" "}
              {selectedLocation.lokasi}
            </div>
          )}

          {/* Location details */}
          {selectedLocation && selectedLocation.keterangan && (
            <div className="text-xs text-gray-600 italic">
              Keterangan: {selectedLocation.keterangan}
            </div>
          )}
        </>
      )}
    </div>
  );
}
