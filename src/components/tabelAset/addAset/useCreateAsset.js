import { useState, useEffect, useRef } from "react";
import { listAset } from "@/api/aset";
import { generateAsetId } from "@/utils/format";
import { generateBarcode } from "@/utils/barcode";

/**
 * Custom hook for CreateAsset form logic
 * Handles manual/auto asetId toggling, master asset data fetching, and image upload
 */
export function useCreateAsset({
  form,
  setForm,
  readOnlyAsetId = false,
  useMaster = false,
  autoAsetId = null,
}) {
  const [manualMode, setManualMode] = useState(
    Boolean(form?.asetId) && Boolean(!readOnlyAsetId)
  );
  const [masterAssets, setMasterAssets] = useState([]);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [code128Url, setCode128Url] = useState("");
  const [zoomOpen, setZoomOpen] = useState(false);
  const inputRef = useRef(null);

  // Auto-calculate nilai_satuan when nilaiAset or jumlah changes
  useEffect(() => {
    const nilaiAset = parseFloat(form?.nilaiAset) || 0;
    const jumlah = parseInt(form?.jumlah) || 1;
    if (nilaiAset > 0 && jumlah > 0) {
      const nilaiSatuan = Math.floor(nilaiAset / jumlah);
      if (form?.nilai_satuan !== nilaiSatuan) {
        setForm((f) => ({ ...f, nilai_satuan: nilaiSatuan }));
      }
    }
  }, [form?.nilaiAset, form?.jumlah]);

  // Force manualMode off if parent disallows manual editing
  useEffect(() => {
    if (readOnlyAsetId) setManualMode(false);
  }, [readOnlyAsetId]);

  // Fetch asset data if needed for suggested asetId
  useEffect(() => {
    let mounted = true;
    async function loadMaster() {
      if (!useMaster) return;
      try {
        const data = await listAset({ includeBebanHeader: false });
        const list = Array.isArray(data) ? data : data?.items ?? [];
        if (mounted) setMasterAssets(list);
      } catch (err) {
        if (mounted) setMasterAssets([]);
      }
    }
    loadMaster();
    return () => (mounted = false);
  }, [useMaster]);

  // Generate barcode for asetId
  useEffect(() => {
    const asetId = form?.asetId || autoAsetId || "";
    if (!asetId) {
      setCode128Url("");
      return;
    }
    const barcodeUrl = generateBarcode(asetId, {
      scale: 3,
      height: 10,
      includetext: true,
      textxalign: "center",
    });
    setCode128Url(barcodeUrl);
  }, [form?.asetId, autoAsetId]);

  // Toggle between manual and auto-generated asetId
  const toggleManualMode = () => {
    const next = !manualMode;
    setManualMode(next);
    if (next && !(form?.asetId || "")) {
      setForm((f) => ({ ...f, asetId: autoAsetId || "" }));
    }
    if (!next) {
      // switching back to auto - clear manual value
      setForm((f) => ({ ...f, asetId: "" }));
    }
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(selectedFile);
    }
  };

  // Cancel file selection
  const handleCancelFile = () => {
    setFile(null);
    setPreviewUrl(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  // Compute suggested asetId when using master assets
  const suggestedAsetId = useMaster
    ? generateAsetId(masterAssets, form.beban, form.tglPembelian)
    : "";

  // Get unique bebans from master assets
  const masterBebans =
    masterAssets.length > 0
      ? Array.from(new Set(masterAssets.map((a) => a.beban)))
      : [];

  return {
    manualMode,
    masterAssets,
    masterBebans,
    suggestedAsetId,
    toggleManualMode,
    file,
    previewUrl,
    code128Url,
    zoomOpen,
    setZoomOpen,
    inputRef,
    handleFileChange,
    handleCancelFile,
  };
}
