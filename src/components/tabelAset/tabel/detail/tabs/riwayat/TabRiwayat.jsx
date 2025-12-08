import React, { useState, useEffect } from "react";
import { listRiwayat } from "@/api/aset";
import { RecordDetail } from "./RecordDetail";
import { YearSection } from "./YearSection";
import { useRiwayatHelpers } from "./useRiwayatHelpers.jsx";
import { useFetchRecordDetail } from "./useFetchRecordDetail.jsx";

export default function TabRiwayat({ asetId, onClose }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recordDetails, setRecordDetails] = useState({});
  const [groupedHistory, setGroupedHistory] = useState({});

  const {
    getAksiLabel,
    getAksiColor,
    getIconColor,
    getMonthName,
    formatDate,
    renderPerubahan,
  } = useRiwayatHelpers();

  const fetchRecordDetail = useFetchRecordDetail();

  useEffect(() => {
    if (!asetId) return;

    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await listRiwayat(asetId);
        console.log("Riwayat data:", data);

        // Filter out edit_lokasi and duplicate mutasi records
        const filteredData = (data || []).filter((item) => {
          const jenisAksi = item.jenisAksi || item.jenis_aksi;
          const tabelRef = item.tabelRef || item.tabel_ref;

          // Skip edit_lokasi records
          if (tabelRef === "aset_lokasi" || jenisAksi === "edit_lokasi") {
            return false;
          }

          // Skip "edit" on aset table if it's related to mutasi
          // We only want to show the mutasi_input record, not the aset edit
          if (tabelRef === "aset" && jenisAksi === "edit") {
            // Check if there's a corresponding mutasi record at the same time
            const hasMutasiRecord = (data || []).some((other) => {
              const otherRef = other.tabelRef || other.tabel_ref;
              const otherAksi = other.jenisAksi || other.jenis_aksi;
              const timeDiff = Math.abs(
                new Date(item.waktu) - new Date(other.waktu)
              );

              // If there's a mutasi record within 2 seconds, skip this aset edit
              return (
                otherRef === "mutasi" &&
                otherAksi === "input" &&
                timeDiff < 2000
              );
            });

            if (hasMutasiRecord) {
              return false;
            }
          }

          return true;
        });

        setHistory(filteredData);

        // Group by year and month
        const grouped = {};
        filteredData.forEach((item) => {
          const date = new Date(item.waktu);
          const year = date.getFullYear();
          const month = date.getMonth(); // 0-11

          if (!grouped[year]) grouped[year] = {};
          if (!grouped[year][month]) grouped[year][month] = [];

          grouped[year][month].push(item);
        });

        setGroupedHistory(grouped);

        // Fetch details for each record
        const details = {};
        for (const item of filteredData) {
          const tabelRef = item.tabelRef || item.tabel_ref;
          const recordId = item.recordId || item.record_id;

          console.log(`Processing item:`, {
            id: item.id,
            tabelRef,
            recordId,
            jenisAksi: item.jenisAksi || item.jenis_aksi,
          });

          if (tabelRef && recordId && tabelRef !== "aset") {
            try {
              console.log(`Fetching detail for ${tabelRef}/${recordId}`);
              const detail = await fetchRecordDetail(tabelRef, recordId);

              if (detail) {
                console.log(`Got detail for ${tabelRef}/${recordId}:`, detail);
                details[`${tabelRef}-${recordId}`] = detail;
              } else {
                console.warn(`No detail returned for ${tabelRef}/${recordId}`);
              }
            } catch (err) {
              console.error(`Failed to fetch ${tabelRef} detail:`, err);
            }
          }
        }
        console.log("All record details:", details);
        setRecordDetails(details);
      } catch (err) {
        setError(err.message || "Gagal memuat riwayat");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [asetId]);

  const renderRecordDetail = (item) => {
    return <RecordDetail item={item} recordDetails={recordDetails} />;
  };

  return (
    <div
      className="bg-gray-100 rounded-2xl shadow-2xl border border-gray-300 overflow-hidden"
      style={{ width: "1388px", height: "692px" }}
    >
      {/* Header - Sticky */}
      <div className="sticky top-0 z-10 bg-gray-100 px-6 pt-6 pb-4 border-b border-gray-300 flex items-center justify-between">
        <h2 className="text-xl font-semibold tracking-wide">Riwayat Aset</h2>
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2.5 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold transition"
        >
          Tutup
        </button>
      </div>

      {/* Content */}
      <div
        className="p-6 overflow-auto"
        style={{ height: "calc(692px - 76px)" }}
      >
        <div className="space-y-4">
          {loading && (
            <div className="text-center py-12 text-gray-600">
              <p className="text-lg">Memuat riwayat...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
              <p className="font-semibold">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {!loading && !error && history.length === 0 && (
            <div className="text-center py-12 text-gray-600">
              <p className="text-lg">Belum ada riwayat untuk aset ini</p>
            </div>
          )}

          {!loading && !error && history.length > 0 && (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-linear-to-b from-indigo-300 via-purple-300 to-pink-300"></div>

              {/* Timeline items grouped by year and month */}
              <div className="space-y-6">
                {Object.keys(groupedHistory)
                  .sort((a, b) => b - a)
                  .map((year) => (
                    <YearSection
                      key={year}
                      year={year}
                      months={groupedHistory[year]}
                      getMonthName={getMonthName}
                      getIconColor={getIconColor}
                      getAksiColor={getAksiColor}
                      getAksiLabel={getAksiLabel}
                      formatDate={formatDate}
                      renderRecordDetail={renderRecordDetail}
                      renderPerubahan={renderPerubahan}
                    />
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
