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
  // We want the numeric sequence to be per-beban (not per-year). So find the
  // maximum sequence number used for this beban across all years, then add 1.
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
