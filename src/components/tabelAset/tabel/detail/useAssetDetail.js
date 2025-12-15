import { useState, useEffect, useRef } from "react";
import {
  uploadAsetImage,
  listAset,
  updateAset,
  listAsetCopy,
} from "@/api/aset";
import { listBeban } from "@/api/beban";
import { getStatusClass, prepareAssetPayload } from "@/utils/format";
import { generateBarcodeUrl } from "@/utils/barcode";

export function useAssetDetail({ asset, onUpdated }) {
  const [zoomOpen, setZoomOpen] = useState(false);
  const [localAsset, setLocalAsset] = useState(asset);
  const [masterAsset, setMasterAsset] = useState(null);
  const [asetRecord, setAsetRecord] = useState(null);
  const [bebanList, setBebanList] = useState([]);
  const [asetNotFound, setAsetNotFound] = useState(false);
  const [perbaikanOpen, setPerbaikanOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const inputRef = useRef(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [imgKey, setImgKey] = useState(() => Date.now());
  const [confirmUpdate, setConfirmUpdate] = useState(false);
  const [dataSource, setDataSource] = useState("aset"); // 'aset' or 'aset_copy'

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

  const displayIdText = String(asetRecord?.asetId ?? asetRecord?.id ?? "");
  const code128Url = generateBarcodeUrl(displayIdText);

  const handleFileChange = (e) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setPreviewUrl(f ? URL.createObjectURL(f) : null);
    setUploadError(null);
  };

  const handleCancelFile = () => {
    setFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (inputRef.current) {
      inputRef.current.value = null;
    }
  };

  const handleUpload = async () => {
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
      onUpdated?.(merged, "image");

      try {
        const listFn = dataSource === "aset_copy" ? listAsetCopy : listAset;
        const all = await listFn({
          includeBebanHeader: false,
        });
        const arr = Array.isArray(all) ? all : [all];
        const found = arr.find(
          (a) => String(a.asetId ?? a.id) === String(merged.asetId ?? merged.id)
        );
        if (found) {
          setLocalAsset(found);
          onUpdated?.(found, "image");
        }
      } catch {}

      if (merged?.gambar) {
        const resolvedOptimistic = resolveImageUrl(merged.gambar);
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
  };

  const handleCopyToClipboard = async (value, key) => {
    try {
      await navigator.clipboard.writeText(String(value));
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1500);
    } catch (err) {}
  };

  const handleStartEdit = () => {
    if (!asetRecord) return;
    setEditForm({
      asetId: asetRecord.asetId || "",
      accurateId: asetRecord.accurateId || "",
      namaAset: asetRecord.namaAset || "",
      spesifikasi: asetRecord.spesifikasi || "",
      grup: asetRecord.grup || "",
      beban:
        asetRecord.bebanKode ||
        asetRecord.beban ||
        asetRecord.beban?.kode ||
        "",
      departemen_id: asetRecord.departemen_id || "",
      akunPerkiraan: asetRecord.akunPerkiraan || "",
      nilaiAset: asetRecord.nilaiAset || "",
      tglPembelian: asetRecord.tglPembelian || "",
      masaManfaat: asetRecord.masaManfaat || "",
      statusAset: asetRecord.statusAset || "aktif",
      keterangan: asetRecord.keterangan || "",
      pengguna: asetRecord.pengguna || "",
      lokasi: asetRecord.lokasi || "",
    });
    setIsEditMode(true);
    setUpdateError(null);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditForm(null);
    setUpdateError(null);
    setConfirmUpdate(false);
  };

  const handleUpdateRequest = (e) => {
    e?.preventDefault();
    if (!editForm || !asetRecord) return;

    // Validation
    const required = [
      { key: "asetId", label: "ID Aset" },
      { key: "namaAset", label: "Nama Aset" },
      { key: "grup", label: "Kategori" },
      { key: "departemen_id", label: "Departemen" },
      { key: "akunPerkiraan", label: "Akun Perkiraan" },
      { key: "beban", label: "Beban" },
      { key: "tglPembelian", label: "Tanggal Pembelian" },
      { key: "nilaiAset", label: "Nilai Aset" },
    ];
    const missing = required.filter(
      (r) => !editForm[r.key] || editForm[r.key].toString().trim() === ""
    );
    if (missing.length > 0) {
      const fields = missing.map((m) => m.label).join(", ");
      setUpdateError(`Harap lengkapi field berikut: ${fields}`);
      return;
    }

    // Show confirmation
    setConfirmUpdate(true);
  };

  const handleUpdateSubmit = async () => {
    setConfirmUpdate(false);
    setUpdateLoading(true);
    setUpdateError(null);
    try {
      const apiPayload = await prepareAssetPayload(editForm, bebanList);
      const updated = await updateAset(
        asetRecord.asetId || asetRecord.id,
        apiPayload
      );

      setAsetRecord(updated);
      setLocalAsset(updated);
      onUpdated?.(updated, "update");
      setIsEditMode(false);
      setEditForm(null);
    } catch (err) {
      setUpdateError(String(err?.message || err));
    } finally {
      setUpdateLoading(false);
    }
  };

  // Escape key to close zoom
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setZoomOpen(false);
    };
    if (zoomOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoomOpen]);

  // Sync local asset with prop
  useEffect(() => {
    setLocalAsset(asset);
  }, [asset, dataSource]);

  // Load master asset
  useEffect(() => {
    let cancelled = false;
    async function loadMaster() {
      setMasterAsset(null);
      if (!asset) return;
      try {
        const listFn = dataSource === "aset_copy" ? listAsetCopy : listAset;
        const all = await listFn({ includeBebanHeader: false });
        const arr = Array.isArray(all) ? all : [all];
        const findKey = String(asset.asetId ?? asset.id ?? "");
        const found = arr.find(
          (a) => String(a.asetId ?? a.id ?? "") === findKey
        );
        if (!cancelled) setMasterAsset(found ?? null);
      } catch (err) {
        // ignore master fetch errors
      }
    }
    loadMaster();
    return () => {
      cancelled = true;
    };
  }, [asset, dataSource]);

  // Load aset record
  useEffect(() => {
    let cancelled = false;
    async function loadAsetRecord() {
      setAsetRecord(null);
      setAsetNotFound(false);
      if (!asset) return;
      const findKey = String(asset.asetId ?? asset.id ?? "");
      if (!findKey) return;
      try {
        const listFn = dataSource === "aset_copy" ? listAsetCopy : listAset;
        const all = await listFn({ includeBebanHeader: false });
        const arr = Array.isArray(all) ? all : [all];
        const normalize = (v) => String(v ?? "").trim();
        const findKeyNormalized = normalize(findKey);
        const found = arr.find((a) => {
          if (!a || typeof a !== "object") return false;
          const cand = [a.asetId, a.id, a.AsetId, a.ID];
          for (const c of cand) {
            if (normalize(c) === findKeyNormalized) return true;
          }
          for (const c of cand) {
            if (normalize(c).toLowerCase() === findKeyNormalized.toLowerCase())
              return true;
          }
          try {
            const decoded = decodeURIComponent(String(a.asetId ?? a.id ?? ""));
            if (normalize(decoded) === findKeyNormalized) return true;
            if (
              normalize(decoded).toLowerCase() ===
              findKeyNormalized.toLowerCase()
            )
              return true;
          } catch (err) {}
          return false;
        });
        if (!cancelled) {
          if (found) {
            // Safeguard: avoid applying status changes coming from rejected transactions.
            // Only accept a server-side status change when the asset record includes
            // an explicit approval_status === 'disetujui' OR when current user is admin.
            const currentUser =
              typeof window !== "undefined"
                ? JSON.parse(window.localStorage.getItem("user") || "null")
                : null;
            const isAdmin = currentUser?.role === "admin";
            const approvalStatus =
              found?.approval_status ??
              found?.approvalStatus ??
              found?.ApprovalStatus ??
              null;

            let safeFound = { ...found };
            if (
              !isAdmin &&
              approvalStatus &&
              String(approvalStatus).toLowerCase() !== "disetujui"
            ) {
              // Preserve existing statusAset from localAsset or incoming prop 'asset'
              const preserveFrom = asetRecord || localAsset || asset || {};
              if (preserveFrom.statusAset)
                safeFound.statusAset = preserveFrom.statusAset;
            }

            setAsetRecord(safeFound);
            setAsetNotFound(false);
          } else {
            setAsetRecord(null);
            setAsetNotFound(true);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setAsetRecord(null);
          setAsetNotFound(true);
        }
      }
    }
    loadAsetRecord();
    return () => {
      cancelled = true;
    };
  }, [asset, dataSource]);

  // Load beban list for edit mode
  useEffect(() => {
    let cancelled = false;
    async function loadBebanList() {
      try {
        const list = await listBeban();
        if (!cancelled) setBebanList(list || []);
      } catch (err) {
        // ignore
      }
    }
    loadBebanList();
    return () => {
      cancelled = true;
    };
  }, []);

  // Update image src
  useEffect(() => {
    const base = previewUrl || asetRecord?.gambar || null;
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
  }, [previewUrl, asetRecord]);

  // Cleanup preview URL
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  return {
    // State
    zoomOpen,
    setZoomOpen,
    localAsset,
    masterAsset,
    asetRecord,
    asetNotFound,
    perbaikanOpen,
    setPerbaikanOpen,
    copiedKey,
    file,
    previewUrl,
    uploading,
    uploadError,
    inputRef,
    imageSrc,
    imgKey,
    code128Url,
    isEditMode,
    editForm,
    setEditForm,
    updateLoading,
    updateError,
    confirmUpdate,
    setConfirmUpdate,

    // Handlers
    handleFileChange,
    handleCancelFile,
    handleUpload,
    handleCopyToClipboard,
    getStatusClass,
    resolveImageUrl,
    handleStartEdit,
    handleCancelEdit,
    handleUpdateRequest,
    handleUpdateSubmit,
    dataSource,
    setDataSource,
  };
}
