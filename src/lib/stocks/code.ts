/** KRX 단축코드 → 6자리 숫자 (A001430 → 001430) */
export function normalizeStockCode(raw: string): string {
  const digits = String(raw).replace(/\D/g, "");
  if (!digits) return "";
  return digits.slice(-6).padStart(6, "0");
}
