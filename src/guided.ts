import { vehicleCatalog } from "./vehicleCatalog.ts"
import type { Vehicle } from "./domain.ts"
export const partTypes = [
  { id: "kit", label: "کیت کامل کلاچ" }, { id: "bearing", label: "بلبرینگ کلاچ" },
  { id: "cable", label: "سیم کلاچ" }, { id: "hydraulic", label: "قطعه هیدرولیکی" }, { id: "unknown", label: "هنوز نمی‌دانم" },
]
export type GuidedDraft = { brandId: string; modelId: string; year: string; gearbox: string; partType: string }
export type GuidedField = keyof GuidedDraft
export const emptyGuided: GuidedDraft = { brandId: "", modelId: "", year: "", gearbox: "", partType: "unknown" }
export function updateGuided(draft: GuidedDraft, field: GuidedField, value: string): GuidedDraft {
  if (field === "brandId") return vehicleCatalog.some(brand => brand.id === value) || !value ? { ...emptyGuided, brandId: value } : draft
  if (field === "modelId") return vehicleCatalog.find(brand => brand.id === draft.brandId)?.models.some(model => model.id === value) || !value ? { ...draft, modelId: value, year: "", gearbox: "" } : draft
  if (field === "gearbox" && !["", "دستی", "اتوماتیک"].includes(value)) return draft
  if (field === "partType" && !partTypes.some(part => part.id === value)) return draft
  return { ...draft, [field]: value }
}
export function normalizedYear(year: string): string {
  return year.trim().replace(/[٠-٩0-9]/g, digit => "۰۱۲۳۴۵۶۷۸۹"[digit >= "٠" ? "٠١٢٣٤٥٦٧٨٩".indexOf(digit) : Number(digit)])
}
export function guidedValid(draft: GuidedDraft): boolean {
  const brand = vehicleCatalog.find(brand => brand.id === draft.brandId)
  return (!draft.brandId || !!brand) && (!draft.modelId || !!brand?.models.some(model => model.id === draft.modelId)) &&
    (!draft.year || /^[۰-۹]{4}$/.test(normalizedYear(draft.year))) && ["", "دستی", "اتوماتیک"].includes(draft.gearbox) && partTypes.some(part => part.id === draft.partType)
}
export function guidedVehicle(draft: GuidedDraft): Vehicle {
  const brand = vehicleCatalog.find(brand => brand.id === draft.brandId)
  const model = brand?.models.find(model => model.id === draft.modelId)
  return { id: model?.id ?? "", name: model ? `${brand!.name} ${model.name}` : brand ? `${brand.name} · مدل نامشخص` : "خودرو نامشخص", year: normalizedYear(draft.year), gearbox: draft.gearbox }
}
