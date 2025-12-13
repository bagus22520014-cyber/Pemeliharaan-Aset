import React, { useState, useEffect } from "react";
import { listRiwayat } from "@/api/aset";
import { RecordDetail } from "./RecordDetail";
import { YearSection } from "./YearSection";
import { useRiwayatHelpers } from "./useRiwayatHelpers.jsx";
import { useFetchRecordDetail } from "./useFetchRecordDetail.jsx";

export default function TabRiwayat({ asetId, onClose }) {
  const [history, setHistory] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recordDetails, setRecordDetails] = useState({});
  const [groupedHistory, setGroupedHistory] = useState({});
  const [activeYear, setActiveYear] = useState(null);
  const [activeMonth, setActiveMonth] = useState(null);

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
              const detail = await fetchRecordDetail(tabelRef, recordId, item);

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
        // For aset table entries, attempt to fetch by recordId or fallback using item
        for (const item of filteredData) {
          const tabelRef = item.tabelRef || item.tabel_ref;
          const recordId = item.recordId || item.record_id;
          if (tabelRef === "aset" && recordId) {
            try {
              console.log(`Fetching aset detail for ${recordId}`);

              // If the item contains a composite AsetId (asetIdString or AsetId),
              // prefer querying by AsetId to avoid numeric /aset/:id 404s.
              const asetKey =
                item.asetIdString || item.AsetId || item.asetId || null;

              let detail = null;
              if (asetKey) {
                const q = encodeURIComponent(asetKey);
                const headers = {};
                const raw = localStorage.getItem("user");
                const user = raw ? JSON.parse(raw) : {};
                if (user?.token) headers.Authorization = `Bearer ${user.token}`;
                if (user?.role) headers["x-role"] = String(user.role);
                if (user?.username)
                  headers["x-username"] = String(user.username);

                try {
                  const resp = await fetch(`/aset?AsetId=${q}`, {
                    credentials: "include",
                    headers,
                  });
                  if (resp.ok) {
                    let d = await resp.json();
                    // Normalize array responses
                    if (Array.isArray(d)) {
                      let match = d.find(
                        (x) =>
                          String(x.id) === String(recordId) ||
                          String(x.AsetId) === String(asetKey)
                      );
                      if (!match && d.length === 1) match = d[0];
                      d = match || null;
                    }
                    detail = d;
                    console.log(`Fetched aset by AsetId ${asetKey}:`, detail);
                  } else {
                    console.warn(
                      `/aset?AsetId=${asetKey} returned ${resp.status}`
                    );
                  }
                } catch (err) {
                  console.error(
                    `Error fetching aset by AsetId ${asetKey}:`,
                    err
                  );
                }
              }

              // Fallback to generic fetchRecordDetail (which includes its own fallback)
              if (!detail) {
                detail = await fetchRecordDetail(tabelRef, recordId, item);
              }

              if (detail) {
                // attach normalized detail
                details[`${tabelRef}-${recordId}`] = detail;
                // also enrich the timeline item so summary blocks can read NilaiAset directly
                try {
                  // Common name/id fields
                  item.namaAset =
                    item.namaAset ||
                    detail?.NamaAset ||
                    detail?.namaAset ||
                    detail?.nama ||
                    detail?.Nama;
                  item.AccurateId =
                    item.AccurateId ||
                    detail?.AccurateId ||
                    detail?.accurateId ||
                    detail?.AccurateID;
                  item.Spesifikasi =
                    item.Spesifikasi ||
                    detail?.Spesifikasi ||
                    detail?.spesifikasi ||
                    detail?.spec;

                  // Group / kategori / akun
                  item.Grup =
                    item.Grup ||
                    detail?.Grup ||
                    detail?.grup ||
                    detail?.kategori;
                  item.AkunPerkiraan =
                    item.AkunPerkiraan ||
                    detail?.AkunPerkiraan ||
                    detail?.akunPerkiraan ||
                    detail?.akun;

                  // Currency / nilai
                  item.nilaiAset =
                    item.nilaiAset ||
                    detail?.NilaiAset ||
                    detail?.nilaiAset ||
                    detail?.nilai_perolehan ||
                    detail?.harga_perolehan ||
                    detail?.aset_nilai ||
                    detail?.AsetNilai ||
                    detail?.nilai;

                  // Beban / departemen
                  item.beban =
                    item.beban ||
                    detail?.beban ||
                    detail?.Beban ||
                    (detail?.beban &&
                      (detail.beban.kode || detail.beban.nama)) ||
                    null;
                  item.bebanKode =
                    item.bebanKode ||
                    detail?.bebanKode ||
                    detail?.beban_kode ||
                    detail?.BebanKode ||
                    (detail?.beban && detail.beban.kode);
                  item.departemenNama =
                    item.departemenNama ||
                    detail?.departemenNama ||
                    detail?.departemen_nama ||
                    detail?.DepartemenNama ||
                    (detail?.departemen &&
                      (detail.departemen.nama || detail.departemen.kode)) ||
                    detail?.departemen;

                  // Dates, pengguna, lokasi, masa manfaat
                  item.TglPembelian =
                    item.TglPembelian ||
                    detail?.TglPembelian ||
                    detail?.tglPembelian ||
                    detail?.tanggal ||
                    detail?.TglPembelian;
                  item.MasaManfaat =
                    item.MasaManfaat ||
                    detail?.MasaManfaat ||
                    detail?.masaManfaat ||
                    detail?.masa;
                  item.Pengguna =
                    item.Pengguna ||
                    detail?.Pengguna ||
                    detail?.pengguna ||
                    detail?.user ||
                    detail?.pemakai;
                  item.Lokasi =
                    item.Lokasi ||
                    detail?.Lokasi ||
                    detail?.lokasi ||
                    detail?.ruangan ||
                    detail?.room;

                  // status
                  item.statusAset =
                    item.statusAset ||
                    detail?.StatusAset ||
                    detail?.statusAset ||
                    detail?.status;
                } catch (e) {
                  // ignore
                }
              }
            } catch (err) {
              console.error(`Failed to fetch aset detail:`, err);
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

  const scrollToSection = (year, month) => {
    const elementId =
      month !== null ? `month-${year}-${month}` : `year-${year}`;
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveYear(year);
      setActiveMonth(month);
    }
  };

  return (
    <div
      className="bg-gray-100 rounded-2xl shadow-2xl border border-gray-300 overflow-hidden flex"
      style={{ width: "1388px", height: "692px" }}
    >
      {/* Sidebar Navigation - Vertical */}
      {!loading && !error && history.length > 0 && (
        <div className="w-48 bg-white border-r border-gray-300 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-300 bg-gray-50">
            <h3 className="font-semibold text-gray-700 text-sm">Navigasi</h3>
          </div>

          {/* Navigation Items */}
          <div className="flex-1 overflow-y-auto p-2">
            <div className="space-y-1">
              {Object.keys(groupedHistory)
                .sort((a, b) => b - a)
                .map((year) => (
                  <div key={year} className="space-y-0.5">
                    {/* Year Button */}
                    <button
                      onClick={() => scrollToSection(year, null)}
                      className={`w-full text-left px-3 py-2 rounded-lg font-bold text-sm transition ${
                        activeYear === year && activeMonth === null
                          ? "bg-indigo-600 text-white shadow"
                          : "bg-gray-50 text-gray-800 hover:bg-gray-100"
                      }`}
                    >
                      {year}
                    </button>

                    {/* Month Buttons */}
                    <div className="ml-2 space-y-0.5">
                      {Object.keys(groupedHistory[year])
                        .sort((a, b) => b - a)
                        .map((month) => (
                          <button
                            key={month}
                            onClick={() => scrollToSection(year, month)}
                            className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition ${
                              activeYear === year && activeMonth === month
                                ? "bg-blue-100 text-blue-700 font-semibold"
                                : "text-gray-600 hover:bg-gray-100"
                            }`}
                          >
                            {getMonthName(parseInt(month))}
                          </button>
                        ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header - Sticky */}
        <div className="bg-gray-100 px-6 py-4 border-b border-gray-300 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold tracking-wide">
              Riwayat Aset
            </h2>
          </div>

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
                      <div key={year} id={`year-${year}`}>
                        <YearSection
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
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
