import bwipjs from "bwip-js";

/**
 * Generate Code128 barcode as Data URL
 * @param {string} text - Text to encode in barcode
 * @param {Object} options - Barcode generation options
 * @returns {string} Data URL of the barcode image
 */
export function generateBarcode(text, options = {}) {
  if (!text) return "";

  try {
    const canvas = document.createElement("canvas");
    bwipjs.toCanvas(canvas, {
      bcid: "code128",
      text: String(text),
      scale: options.scale || 3,
      height: options.height || 10,
      includetext: options.includetext !== false,
      textxalign: options.textxalign || "center",
      ...options,
    });
    return canvas.toDataURL("image/png");
  } catch (err) {
    console.error("Barcode generation error:", err);
    return "";
  }
}

/**
 * Generate barcode URL using external service (fallback)
 * @param {string} text - Text to encode
 * @returns {string} URL to barcode image
 */
export function generateBarcodeUrl(text) {
  if (!text) return "";
  return `https://barcode.tec-it.com/barcode.ashx?translate-esc=true&data=${encodeURIComponent(
    String(text)
  )}&code=Code128&dpi=96&unit=px&width=300&height=80`;
}
