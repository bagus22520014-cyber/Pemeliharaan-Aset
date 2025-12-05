import React from "react";
import { CiBarcode } from "react-icons/ci";

export default function ScanControl({ assets = [], onScanFound }) {
  const [visible, setVisible] = React.useState(false);
  const [value, setValue] = React.useState("");
  const [notFound, setNotFound] = React.useState(false);
  const inputRef = React.useRef(null);

  const lookup = (val) => {
    const v = String(val || "").trim();
    if (!v) return null;
    const norm = (s) => String(s ?? "").trim();
    const normLower = (s) => norm(s).toLowerCase();
    const vNorm = norm(v);
    // exact match by asetId/id or case-insensitive match
    let found = assets.find(
      (x) =>
        norm(x.asetId ?? x.id) === vNorm ||
        normLower(x.asetId ?? x.id) === vNorm.toLowerCase()
    );
    if (found) return found;
    // try candidate fields
    found = assets.find((x) => {
      if (!x || typeof x !== "object") return false;
      const cand = [x.asetId, x.id, x.AsetId, x.ID];
      for (const c of cand) {
        if (norm(c) === vNorm) return true;
        if (normLower(c) === vNorm.toLowerCase()) return true;
      }
      // try decoded asetId
      try {
        const decoded = decodeURIComponent(String(x.asetId ?? x.id ?? ""));
        if (norm(decoded) === vNorm) return true;
        if (normLower(decoded) === vNorm.toLowerCase()) return true;
      } catch (err) {}
      return false;
    });
    return found || null;
  };

  React.useEffect(() => {
    if (!visible) return;
    setTimeout(() => inputRef.current?.focus?.(), 10);
  }, [visible]);

  const submit = (val) => {
    const found = lookup(val);
    if (found) {
      setVisible(false);
      setValue("");
      setNotFound(false);
      onScanFound?.(found);
    } else {
      setNotFound(true);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => {
          setVisible((s) => !s);
          setValue("");
          setNotFound(false);
        }}
        className="h-12 w-12 rounded-xl bg-green-600 text-white hover:bg-green-500
                   flex items-center justify-center transition shadow"
        title="Scan Aset Id"
        aria-label="Open scan popup"
      >
        <CiBarcode className="h-10 w-10" />
      </button>

      {visible && (
        <div className="fixed inset-0 z-60 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => {
              setVisible(false);
              setValue("");
              setNotFound(false);
            }}
          />
          <div className="relative z-70 w-[min(560px,95%)] bg-white rounded-xl shadow-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold">
                Scan atau paste Aset Id
              </div>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => {
                  setVisible(false);
                  setValue("");
                  setNotFound(false);
                }}
                aria-label="Close scan popup"
                title="Tutup"
              >
                ✕
              </button>
            </div>
            <div className="flex gap-2">
              <input
                ref={inputRef}
                value={value}
                onChange={(e) => {
                  const val = e.target.value || "";
                  setValue(val);
                  if (notFound) setNotFound(false);
                  // Automatically submit if the entered/pasted ID exactly matches an asset
                  const found = lookup(val);
                  if (found) {
                    submit(val);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setVisible(false);
                    setValue("");
                    setNotFound(false);
                    return;
                  }
                  if (e.key === "Enter") {
                    submit(value);
                    return;
                  }
                }}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500"
                placeholder="Scan or paste Aset ID"
                aria-label="Scan or paste Aset ID"
              />
              <button
                onClick={() => submit(value)}
                className="px-4 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500"
              >
                Cari
              </button>
            </div>
            {notFound && (
              <div className="mt-2 text-sm text-red-600">
                Aset tidak ditemukan
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
