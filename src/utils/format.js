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

export function getApprovalStatusClass(approvalStatus) {
  switch ((approvalStatus || "").toLowerCase()) {
    case "disetujui":
      return "bg-green-100 text-green-800 border-green-200";
    case "diajukan":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "ditolak":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

export function getApprovalStatusLabel(approvalStatus) {
  switch ((approvalStatus || "").toLowerCase()) {
    case "disetujui":
      return "Disetujui";
    case "diajukan":
      return "Menunggu";
    case "ditolak":
      return "Ditolak";
    default:
      return "Unknown";
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

/**
 * Helper to map beban kode to beban_id for API payload
 * This is a temporary solution until we fully migrate to beban_id in UI
 */
export async function mapBebanKodeToId(bebanKode, bebanList) {
  if (!bebanKode) return null;
  const beban = bebanList.find((b) => b.kode === bebanKode);
  return beban?.id || null;
}

/**
 * Helper to prepare asset payload for API
 * Converts beban (kode string) to beban_id (integer)
 */
export async function prepareAssetPayload(formData, bebanList) {
  const payload = { ...formData };

  // If beban is a string (kode), convert to beban_id
  if (payload.beban && typeof payload.beban === "string") {
    const bebanId = await mapBebanKodeToId(payload.beban, bebanList);
    if (bebanId) {
      payload.beban_id = bebanId;
      delete payload.beban; // Remove old field
    }
  }

  return payload;
}
