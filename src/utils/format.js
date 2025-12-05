export function formatRupiah(value) {
  if (value == null) return "";
  // convert numbers to string
  let s = String(value);
  // remove non-digit characters
  s = s.replace(/\D/g, "");
  if (s === "") return "";
  // insert dots as thousands separators
  const parts = [];
  while (s.length > 3) {
    parts.unshift(s.slice(-3));
    s = s.slice(0, -3);
  }
  if (s) parts.unshift(s);
  return parts.join(".");
}

export function unformatRupiah(formatted) {
  // remove all non-digits to get the numeric string
  if (formatted == null) return "";
  const s = String(formatted).replace(/\D/g, "");
  return s;
}

export function generateAsetId(assets = [], beban = "", tglPembelian = "") {
  // Determine year from tglPembelian or default to current year
  let year = "";
  if (typeof tglPembelian === "string" && tglPembelian.length >= 4) {
    // support YYYY-MM-DD or ISO
    const m = tglPembelian.match(/^(\d{4})/);
    if (m) year = m[1];
    else {
      try {
        const d = new Date(tglPembelian);
        if (!Number.isNaN(d.getTime())) year = String(d.getFullYear());
      } catch {}
    }
  }
  if (!year) year = String(new Date().getFullYear());

  const bebanKey = (beban || "").toString().trim();
  const bebanEsc = bebanKey.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&");
  // We want the numeric sequence to be per-departemen (per-beban variable, not per-year).
  // So find the maximum sequence number used for this beban across all years, then add 1.
  const regexAnyYear = new RegExp(`^(\\d+)\/${bebanEsc}\/\\d{4}$`, "i");
  let maxNum = 0;
  for (const a of assets || []) {
    const id = a?.asetId ?? a?.AsetId ?? "";
    if (!id) continue;
    const m = String(id).match(regexAnyYear);
    if (!m) continue;
    const n = Number(m[1]) || 0;
    if (n > maxNum) maxNum = n;
  }
  const next = maxNum + 1;
  const pad = String(next).padStart(4, "0");
  // Format: "xxxx/beban/year"
  return `${pad}/${bebanKey}/${year}`;
}

export function parseBebans(rawBeban) {
  if (!rawBeban) return [];
  if (Array.isArray(rawBeban))
    return Array.from(
      new Set(rawBeban.map((b) => String(b).trim()).filter(Boolean))
    );
  let s = String(rawBeban || "").trim();
  try {
    const d = decodeURIComponent(s);
    if (d && typeof d === "string") s = d;
  } catch {}
  return Array.from(
    new Set(
      s
        .split(/[;,|]/)
        .map((x) => String(x || "").trim())
        .filter(Boolean)
    )
  );
}

export function simplifyBebansForDisplay(rawBeban) {
  const parsed = parseBebans(rawBeban).map((b) => String(b).trim());
  if (!parsed || parsed.length === 0) return [];
  // map base -> true
  const baseSet = new Set();
  for (const b of parsed) {
    if (!b) continue;
    const base = b.includes("-") ? b.split("-")[0] : b;
    baseSet.add(String(base).trim());
  }
  return Array.from(baseSet);
}

export function getStatusClass(status) {
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
}

// Constants for asset management
export const GROUPS = [
  "BANGUNAN",
  "DISTRIBUSI JARINGAN",
  "HEADEND",
  "KENDARAAN",
  "KOMPUTER",
  "PERALATAN & INVENTARIS KANTOR",
  "TANAH",
];

export const BEBANS = [
  "MLM",
  "BJR-NET",
  "BNT-NET",
  "BTM-NET",
  "GTO-NET",
  "KDR-NET",
  "LMP-NET",
  "MLG-NET",
  "PDG-NET",
  "PKB-NET",
  "PKP-NET",
  "PLB-NET",
  "SBY-NET",
  "SMD-NET",
  "SRG-NET",
  "MLMKOB",
  "MLMMET",
  "MLMSDKB",
  "MLMSL",
  "BJR-MEDIA",
  "BNT-MEDIA",
  "BTM-MEDIA",
  "GTO-MEDIA",
  "KDR-MEDIA",
  "LMP-MEDIA",
  "MLG-MEDIA",
  "PDG-MEDIA",
  "PKB-MEDIA",
  "PKP-MEDIA",
  "PLB-MEDIA",
  "SBY-MEDIA",
  "SMD-MEDIA",
  "SRG-MEDIA",
];

export const AKUN = [
  "1701-01 (Tanah)",
  "1701-02 (Bangunan)",
  "1701-03 (Kendaraan)",
  "1701-04 (Distribusi Jaringan / Headend)",
  "1701-05 (Peralatan & Inventaris Kantor)",
  "1701-06 (Renovasi & Instalasi Listrik)",
  "1701-07 (Perlengkapan & Inventaris IT)",
];

export const STATUSES = ["aktif", "rusak", "diperbaiki", "dipinjam", "dijual"];

export function getCurrentDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
