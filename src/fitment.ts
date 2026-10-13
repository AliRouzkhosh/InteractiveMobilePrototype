import type { Product, Vehicle, Compatibility } from "./domain.ts"

// Demo-only fitment evidence: exact tuples. No real automotive validation is implied.
export const mockFitment = [
  // Fictional, explicit broad-search demonstration tuples; never inferred.
  { productId: 100, vehicleId: "peugeot-206-type5", year: "۱۳۹۹", gearbox: "دستی" },
  { productId: 200, vehicleId: "saipa-pride", year: "۱۴۰۰", gearbox: "دستی" },
  { productId: 300, vehicleId: "renault-l90", year: "۱۳۹۸", gearbox: "دستی" },
  { productId: 400, vehicleId: "kia-rio", year: "۱۳۹۵", gearbox: "دستی" },
  { productId: 500, vehicleId: "hyundai-accent", year: "۱۳۹۶", gearbox: "دستی" },
  {
    productId: 1,
    vehicleId: "peugeot-206-type5",
    year: "۱۳۹۷",
    gearbox: "دستی",
  },
  {
    productId: 4,
    vehicleId: "peugeot-206-type5",
    year: "۱۳۹۷",
    gearbox: "دستی",
  },
  {
    productId: 2,
    vehicleId: "peugeot-206-type5",
    year: "۱۳۹۹",
    gearbox: "دستی",
  },
]
export function compatibility(
  product: Product,
  vehicle: Vehicle,
  skipped: boolean,
): Compatibility {
  return !skipped &&
    mockFitment.some(
      (row) =>
        row.productId === product.id &&
        row.vehicleId === vehicle.id &&
        row.year === vehicle.year &&
        row.gearbox === vehicle.gearbox,
    )
    ? "CONFIRMED"
    : "UNKNOWN"
}
export const compatibilityLabel = (status: Compatibility) =>
  status === "CONFIRMED" ? "✓ تطبیق در دادهٔ نمونه" : "سازگاری نامشخص"
export function vehicleComplete(vehicle: Vehicle): boolean {
  return !!vehicle.id && !!vehicle.year && ["دستی", "اتوماتیک"].includes(vehicle.gearbox)
}
export function vehicleConflict(vehicle: Vehicle): boolean {
  return vehicle.id === "peugeot-206-type5" && vehicle.gearbox === "اتوماتیک"
}
export const vehicleConflictExplanation = "تیپ ۵ پژو ۲۰۶ معمولاً با گیربکس دستی شناخته می‌شود. تیپ یا گیربکس را بررسی کنید؛ انتخاب اتوماتیک در این نمونه سازگاری تأییدشده ندارد. تیپ خودرو خودکار تغییر نمی‌کند."
export function fitmentState(product: Product, vehicle: Vehicle, skipped: boolean): "INCOMPLETE" | Compatibility {
  return !vehicleComplete(vehicle) ? "INCOMPLETE" : compatibility(product, vehicle, skipped)
}
export function fitmentLabel(product: Product, vehicle: Vehicle, skipped: boolean): string {
  return fitmentState(product, vehicle, skipped) === "INCOMPLETE" ? "مشخصات خودرو ناقص" : compatibilityLabel(compatibility(product, vehicle, skipped))
}
// Shared presentation for every UI context. Legacy labels above remain for fixture API compatibility.
export function badgePresentation(product: Product, vehicle: Vehicle, skipped: boolean) {
  const status = fitmentState(product, vehicle, skipped)
  return { status, label: status === "CONFIRMED" ? "مطابق داده نمونه" : status === "UNKNOWN" ? "نیازمند بررسی" : "مشخصات خودرو ناقص", tone: status === "CONFIRMED" ? "ok" : status === "UNKNOWN" ? "unknown" : "incomplete" }
}
