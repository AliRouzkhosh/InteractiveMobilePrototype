import type { QueryUnderstanding } from "./domain.ts"
// Small explicit grammar, not AI. Whole identifiers and complete supported phrases only.
export const exampleQuery = "دیسک و صفحه ۲۰۶ تیپ ۵"
export const manufacturerQuery = "والئو 826211"
export function normalizeQuery(query: string): string {
  return query.trim().toLowerCase().replace(/[۰-۹]/g, digit => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/[٠-٩]/g, digit => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit))).replace(/ي/g, "ی").replace(/ك/g, "ک").replace(/\s+/g, " ")
}
const legacyIdentifiers = ["sku-demo-valeo-206-01", "sku-demo-vasure-206-02", "sku-demo-golden-206-03", "sku-demo-valeo-206-04"]
export function interpretQuery(query: string): QueryUnderstanding {
  const normalized = normalizeQuery(query)
  const legacy = legacyIdentifiers.indexOf(normalized)
  if (/^(?:(?:والئو|valeo)\s+)?826211$/.test(normalized) || normalized === "3276428262116" || normalized === "valeo-826211")
    return { kind: "EXACT_SKU", part: null, vehicleId: null, productId: 5 }
  if (legacy >= 0) return { kind: "EXACT_SKU", part: null, vehicleId: null, productId: legacy + 1 }
  const partPhrase = "(?:دیسک و صفحه|کیت کلاچ)"
  const vehiclePhrase = "(?:پژو )?206 تیپ 5"
  const part = new RegExp(`^${partPhrase}(?: .*|)$`).test(normalized) ? "دیسک و صفحه" : null
  const vehicleId = new RegExp(`^(?:${partPhrase} (?:برای )?)?${vehiclePhrase}$`).test(normalized) ? "peugeot-206-type5" : null
  if (part && vehicleId) return { kind: "VEHICLE_PART", part, vehicleId, productId: null }
  return { kind: "AMBIGUOUS", part, vehicleId, productId: null }
}
