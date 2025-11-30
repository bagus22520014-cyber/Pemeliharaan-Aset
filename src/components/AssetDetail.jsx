import React, { useState, useEffect, useRef } from "react";
import { FaUpload, FaImage, FaCopy, FaCheck } from "react-icons/fa";
import HistoryButton from "./HistoryButton";
import { uploadAsetImage, listAset } from "../api/aset";
import PerbaikanModal from "./PerbaikanModal";
import { formatRupiah } from "../utils/format";

export default function AssetDetail({ asset, onClose, onUpdated }) {
  if (!asset) return null;

  const idText = String(asset.asetId ?? asset.id ?? "");
  const code128Url = `https://barcode.tec-it.com/barcode.ashx?translate-esc=true&data=${encodeURIComponent(
    idText
  )}&code=Code128&dpi=96&unit=px&width=300&height=80`;
  const [zoomOpen, setZoomOpen] = useState(false);
  const [localAsset, setLocalAsset] = useState(asset);
  const [perbaikanOpen, setPerbaikanOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const inputRef = useRef(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [imgKey, setImgKey] = useState(() => Date.now());
  const backendOrigin =
    import.meta.env.VITE_BACKEND_URL ||
    (import.meta.env.DEV ? "http://localhost:4000" : window.location.origin);
  const resolveImageUrl = (url) => {
    if (!url) return url;
    const s = String(url);
    if (s.startsWith("http://") || s.startsWith("https://")) return s;
    if (s.startsWith("//")) return `${window.location.protocol}${s}`;
    if (s.startsWith("/")) return `${backendOrigin}${s}`;
    return s;
  };

  const getStatusClass = (status) => {
    switch ((status || "").toLowerCase()) {
      case "aktif":
        return "bg-green-500";
      case "rusak":
        return "bg-red-500";
      case "diperbaiki":
        return "bg-yellow-500";
      case "dipinjam":
        return "bg-indigo-600";
      case "dijual":
        return "bg-gray-500";
      default:
        return "bg-gray-300";
    }
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setZoomOpen(false);
    };
    if (zoomOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoomOpen]);

  useEffect(() => {
    setLocalAsset(asset);
  }, [asset]);

  useEffect(() => {
    const base = previewUrl || localAsset?.gambar || null;
    if (imageSrc && String(imageSrc).startsWith("blob:")) return;
    if (!base) {
      setImageSrc(null);
      setImgKey(Date.now());
      return;
    }
    const resolved = resolveImageUrl(base);
    const isBlob =
      String(resolved).startsWith("blob:") ||
      String(resolved).startsWith("data:");
    const final = isBlob
      ? resolved
      : `${resolved}${resolved.includes("?") ? "&" : "?"}t=${Date.now()}`;
    setImageSrc(final);
    setImgKey(final);
  }, [previewUrl, localAsset]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/40 p-6 mx-4 overflow-auto animate-scaleIn">
        <div className="flex items-center justify-center">
          <div className="flex items-center mr-4">
            <span
              title={localAsset.keterangan || ""}
              aria-label={localAsset.statusAset || "status"}
              className={`inline-block w-5 h-5 rounded-full shadow-sm ${getStatusClass(
                localAsset.statusAset
              )}`}
            />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold tracking-wide">
              {localAsset.namaAset || "Detail Aset"}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <HistoryButton
                onClick={() => setPerbaikanOpen(true)}
                title="Riwayat Perbaikan"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-800">
          <div className="md:col-span-1">
            <div className="relative rounded-xl bg-white shadow-sm border border-gray-100 p-4 flex flex-col items-center h-143">
              {/* IMAGE WRAPPER */}
              <div className="relative h-full aspect-square w-full group">
                {/* IMAGE */}
                {previewUrl || localAsset?.gambar ? (
                  <img
                    key={imgKey}
                    alt="aset-image-large"
                    src={
                      imageSrc ||
                      resolveImageUrl(previewUrl || localAsset.gambar)
                    }
                    className="h-full w-full rounded-md border border-gray-200 bg-white shadow-sm object-cover cursor-pointer"
                    onClick={() =>
                      window.open(
                        imageSrc ||
                          resolveImageUrl(previewUrl || localAsset.gambar),
                        "_blank"
                      )
                    }
                  />
                ) : (
                  <div className="h-full w-full rounded-md border border-gray-200 bg-gray-50 flex items-center justify-center text-gray-400">
                    <FaImage className="h-40 w-40" />
                  </div>
                )}

                {/* BARCODE (TOP Z-INDEX, ALWAYS CLICKABLE) */}
                <div
                  className="
      absolute bottom-2 left-1/2 -translate-x-1/2 
      bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg border shadow
      z-20 pointer-events-auto
      cursor-pointer
    "
                >
                  <img
                    alt="barcode"
                    src={code128Url}
                    onClick={() => setZoomOpen(true)}
                    title="Click to enlarge barcode"
                    className="h-16 w-auto object-contain hover:scale-105 transition-transform"
                  />
                </div>

                {/* ACTION BUTTONS OVERLAY */}
                <div
                  className="
      absolute inset-0 flex flex-col items-center justify-center gap-3 
      bg-black/30 rounded-md opacity-0 group-hover:opacity-100 
      transition-opacity z-10 pointer-events-none
    "
                >
                  <input
                    type="file"
                    accept="image/*"
                    ref={inputRef}
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const f = e.target.files?.[0] ?? null;
                      setFile(f);
                      setPreviewUrl(f ? URL.createObjectURL(f) : null);
                      setUploadError(null);
                    }}
                  />

                  {/* GANTI GAMBAR */}
                  <button
                    onClick={() => inputRef.current?.click?.()}
                    className="h-10 px-4 rounded-md bg-white text-gray-800 font-medium shadow hover:bg-gray-100
                   pointer-events-auto"
                  >
                    Ganti Gambar
                  </button>

                  {file && (
                    <div className="flex items-center gap-3">
                      {/* UPLOAD */}
                      <button
                        onClick={async () => {
                          setUploading(true);
                          setUploadError(null);
                          try {
                            const updated = await uploadAsetImage(
                              localAsset.asetId ?? localAsset.id,
                              file
                            );
                            const merged = {
                              ...(localAsset || {}),
                              ...(updated || {}),
                            };
                            setLocalAsset(merged);
                            setFile(null);
                            onUpdated?.(merged);

                            try {
                              const all = await listAset();
                              const arr = Array.isArray(all) ? all : [all];
                              const found = arr.find(
                                (a) =>
                                  String(a.asetId ?? a.id) ===
                                  String(merged.asetId ?? merged.id)
                              );
                              if (found) {
                                setLocalAsset(found);
                                onUpdated?.(found);
                              }
                            } catch {}

                            if (merged?.gambar) {
                              const resolvedOptimistic = resolveImageUrl(
                                merged.gambar
                              );
                              const optimisticTsUrl = `${resolvedOptimistic}${
                                resolvedOptimistic.includes("?") ? "&" : "?"
                              }t=${Date.now()}`;
                              setImageSrc(optimisticTsUrl);
                              setImgKey(optimisticTsUrl);
                            }
                          } catch (err) {
                            setUploadError(String(err?.message || err));
                          } finally {
                            setUploading(false);
                          }
                        }}
                        disabled={uploading}
                        className="h-10 px-4 rounded-md bg-indigo-600 text-white font-medium shadow hover:bg-indigo-500
                       pointer-events-auto"
                      >
                        {uploading ? "Uploading…" : "Upload"}
                      </button>

                      {/* BATAL */}
                      <button
                        onClick={() => {
                          setFile(null);
                          if (previewUrl) {
                            URL.revokeObjectURL(previewUrl);
                            setPreviewUrl(null);
                          }
                          inputRef.current.value = null;
                        }}
                        className="h-10 px-4 rounded-md bg-white text-gray-800 font-medium shadow hover:bg-gray-100
                       pointer-events-auto"
                      >
                        Batal
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {uploadError && (
                <div className="text-red-600 mt-2 text-center">
                  {uploadError}
                </div>
              )}
            </div>
          </div>

          {/* =========================== */}
          {/*   FIELD PANEL (DENGAN FIX)  */}
          {/* =========================== */}

          <div className="md:col-span-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                [
                  "Aset ID",
                  localAsset.asetId ?? localAsset.AsetId ?? localAsset.id,
                ],
                [
                  "Accurate ID",
                  localAsset.accurateId ?? localAsset.AccurateId ?? "",
                ],
                ["Grup", localAsset.grup],
                ["Akun Perkiraan", localAsset.AkunPerkiraan],
                ["Nilai", formatRupiah(localAsset.nilaiAset)],
                ["Tanggal Pembelian", localAsset.tglPembelian],
                ["Masa Manfaat", `${localAsset.masaManfaat} bulan`],
              ].map(([label, value], i) => {
                const isNilai = label === "Nilai";

                const val = value ?? "-";
                const isAsetId = label === "Aset ID";
                const isAccurate = label === "Accurate ID";

                return (
                  <div
                    key={i}
                    className={`p-4 rounded-xl bg-white shadow-sm border border-gray-100 ${
                      isNilai ? "md:col-span-2  " : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-gray-600">{label}</div>
                      {(isAsetId || isAccurate) && (
                        <button
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(String(val));
                              setCopiedKey(isAsetId ? "asetId" : "accurateId");
                              setTimeout(() => setCopiedKey(null), 1500);
                            } catch (err) {}
                          }}
                          className="ml-2 p-1 rounded text-gray-500 hover:bg-gray-100"
                          title={`Copy ${label}`}
                        >
                          {copiedKey ===
                          (isAsetId ? "asetId" : "accurateId") ? (
                            <FaCheck className="text-green-600" />
                          ) : (
                            <FaCopy />
                          )}
                        </button>
                      )}
                    </div>
                    <div
                      className={`text-base mt-1 ${isNilai ? "text-basa" : ""}`}
                    >
                      {val}
                    </div>
                  </div>
                );
              })}

              {/* Spesifikasi – full width */}
              <div className="md:col-span-2 h-45 p-4 rounded-xl bg-white shadow-sm border border-gray-100">
                <div className="font-medium text-gray-600">Spesifikasi</div>
                <div className="text-base mt-1 whitespace-pre-line">
                  {localAsset.spesifikasi || "-"}
                </div>
              </div>
            </div>
          </div>
        </div>

        <PerbaikanModal
          asetId={localAsset.asetId ?? localAsset.id}
          open={perbaikanOpen}
          onClose={() => setPerbaikanOpen(false)}
          onChange={(payload) => onUpdated?.({ perbaikanChange: payload })}
        />
      </div>

      {zoomOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setZoomOpen(false)}
          />
          <div className="z-70 bg-white rounded-2xl shadow-2xl p-4 max-w-[900px] w-[95%] mx-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600 font-semibold">Barcode</div>
              <button
                onClick={() => setZoomOpen(false)}
                className="p-1 rounded hover:bg-gray-100"
                aria-label="Close barcode preview"
                title="Close"
              >
                ✕
              </button>
            </div>
            <div className="p-4 bg-white flex items-center justify-center">
              <img
                alt="barcode-large"
                src={code128Url}
                className="w-full h-auto max-h-[80vh] object-contain"
              />
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes scaleIn { 
          0% { opacity: 0; transform: scale(.92) } 
          100% { opacity: 1; transform: scale(1) }
        }
        .animate-fadeIn { animation: fadeIn .15s ease-out }
        .animate-scaleIn { animation: scaleIn .2s ease-out }
      `}</style>
    </div>
  );
}
