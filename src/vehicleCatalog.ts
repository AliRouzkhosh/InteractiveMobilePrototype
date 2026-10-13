// Demonstration choices only. Empty year metadata means production validity is unknown.
export type CatalogModel = { id: string; name: string; years: string[]; illustrativeYears: string[] }
export type CatalogBrand = { id: string; name: string; models: CatalogModel[] }
// These hand-picked UI examples are NOT production-year validity metadata.
const yearExamples: Record<string, string[]> = {
  "peugeot-206-type5": ["۱۳۹۷", "۱۳۹۹", "۱۴۰۱"], "peugeot-207": ["۱۳۹۸", "۱۴۰۰", "۱۴۰۲"], "peugeot-405": ["۱۳۹۵", "۱۳۹۷", "۱۳۹۹"],
  "saipa-pride": ["۱۳۹۶", "۱۳۹۸", "۱۴۰۰"], "saipa-tiba": ["۱۳۹۷", "۱۳۹۹", "۱۴۰۱"], "saipa-saina": ["۱۳۹۸", "۱۴۰۰", "۱۴۰۲"],
  "renault-l90": ["۱۳۹۶", "۱۳۹۸", "۱۴۰۰"], "renault-sandero": ["۱۳۹۵", "۱۳۹۷", "۱۳۹۹"],
  "kia-rio": ["۱۳۹۳", "۱۳۹۵", "۱۳۹۷"], "kia-cerato": ["۱۳۹۵", "۱۳۹۷", "۱۳۹۹"],
  "hyundai-accent": ["۱۳۹۴", "۱۳۹۶", "۱۳۹۸"], "hyundai-elantra": ["۱۳۹۵", "۱۳۹۷", "۱۳۹۹"],
}
const models = (prefix: string, choices: [string, string][]): CatalogModel[] => choices.map(([id, name]) => ({ id: `${prefix}-${id}`, name, years: [], illustrativeYears: yearExamples[`${prefix}-${id}`] }))
export const vehicleCatalog: CatalogBrand[] = [
  { id: "peugeot", name: "پژو", models: models("peugeot", [["206-type5", "۲۰۶ تیپ ۵"], ["207", "۲۰۷"], ["405", "۴۰۵"]]) },
  { id: "saipa", name: "سایپا", models: models("saipa", [["pride", "پراید"], ["tiba", "تیبا"], ["saina", "ساینا"]]) },
  { id: "renault", name: "رنو", models: models("renault", [["l90", "ال۹۰"], ["sandero", "ساندرو"]]) },
  { id: "kia", name: "کیا", models: models("kia", [["rio", "ریو"], ["cerato", "سراتو"]]) },
  { id: "hyundai", name: "هیوندای", models: models("hyundai", [["accent", "اکسنت"], ["elantra", "النترا"]]) },
]
