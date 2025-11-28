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
