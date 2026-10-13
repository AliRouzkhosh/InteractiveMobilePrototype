import test from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import ts from "typescript"
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { vehicleCatalog } from "../src/vehicleCatalog.ts"
import { mockFitment, badgePresentation, compatibility } from "../src/fitment.ts"
import { catalogProducts } from "../src/products.ts"
import { initialJourney, journeyReducer, searchProducts, searchStores, type JourneyAction } from "../src/demo.ts"
import { normalizedYear } from "../src/guided.ts"

// Render the actual TSX components using the project's installed compiler, without extra dependencies.
function componentURL(file: URL): string {
  const source = readFileSync(file, "utf8")
  const compiled = ts.transpileModule(source, { compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext } }).outputText
  const resolved = compiled.replace(/from "([^"]+)"/g, (_, specifier: string) => {
    if (!specifier.startsWith(".")) return `from "${import.meta.resolve(specifier)}"`
    const dependency = new URL(specifier + (specifier.endsWith(".ts") ? "" : specifier.includes("fitment") ? ".ts" : ".tsx"), file)
    return `from "${dependency.pathname.endsWith(".tsx") ? componentURL(dependency) : dependency.href}"`
  })
  return "data:text/javascript;base64," + Buffer.from(resolved).toString("base64")
}
const Badge = (await import(componentURL(new URL("../src/CompatibilityBadge.tsx", import.meta.url)))).default
const Disclosure = await import(componentURL(new URL("../src/DemoDisclosure.tsx", import.meta.url)))
const paths = [
  ["peugeot", "peugeot-206-type5", "۱۳۹۹", 100], ["saipa", "saipa-pride", "۱۴۰۰", 200],
  ["renault", "renault-l90", "۱۳۹۸", 300], ["kia", "kia-rio", "۱۳۹۵", 400], ["hyundai", "hyundai-accent", "۱۳۹۶", 500],
] as const
function journey(brand: string, model: string, year: string) {
  const actions: JourneyAction[] = [{ type: "query", query: "کلاچ" }, { type: "guidedField", field: "brandId", value: brand }, { type: "guidedField", field: "modelId", value: model }, { type: "guidedField", field: "year", value: year }, { type: "guidedField", field: "gearbox", value: "دستی" }, { type: "guidedField", field: "partType", value: "kit" }, { type: "applyGuided" }]
  return actions.reduce(journeyReducer, initialJourney)
}
for (const [brand, model, year, id] of paths) {
  test(`${brand}: illustrative year chips and explicit green/unknown demonstration`, () => {
    const catalog = vehicleCatalog.find(item => item.id === brand)!
    catalog.models.forEach(item => {
      assert.equal(item.illustrativeYears.length, 3)
      item.illustrativeYears.forEach(value => assert.match(value, /^[۰-۹]{4}$/))
      assert.deepEqual(item.years, []) // Authoritative production validity remains unspecified.
    })
    assert.ok(catalog.models.find(item => item.id === model)!.illustrativeYears.includes(year))
    const state = journey(brand, model, year)
    const products = searchProducts(state)
    assert.deepEqual(products.map(product => badgePresentation(product, state.vehicle, false).status), ["CONFIRMED", "UNKNOWN"])
    assert.equal(products[0].id, id)
    assert.ok(mockFitment.some(row => row.productId === id && row.vehicleId === model && row.year === year && row.gearbox === "دستی"))
    const back = journeyReducer(journeyReducer(state, { type: "product", productId: id }), { type: "back" })
    assert.deepEqual(back.vehicle, state.vehicle)
    assert.deepEqual(back.guided, state.guided)
    for (const store of searchStores(state)) for (const offer of store.offers) {
      const product = products.find(item => item.id === offer.productId)!
      assert.equal(badgePresentation(product, state.vehicle, false).status, product.id === id ? "CONFIRMED" : "UNKNOWN")
    }
  })
}
test("shared rendered badge supplies identical label and tone for every product context", () => {
  const state = journey("saipa", "saipa-pride", "۱۴۰۰")
  const products = searchProducts(state)
  for (const [product, vehicle, skipped, status, label, tone] of [
    [products[0], state.vehicle, false, "CONFIRMED", "مطابق داده نمونه", "ok"],
    [products[1], state.vehicle, false, "UNKNOWN", "نیازمند بررسی", "unknown"],
    [products[0], { ...state.vehicle, year: "" }, false, "INCOMPLETE", "مشخصات خودرو ناقص", "incomplete"],
    [products[0], state.vehicle, true, "UNKNOWN", "نیازمند بررسی", "unknown"],
  ] as const) {
    const html = renderToStaticMarkup(React.createElement(Badge, { product, vehicle, skipped }))
    assert.ok(html.includes(`data-fitment="${status}"`) && html.includes(`data-product-id="${product.id}"`))
    assert.ok(html.includes(label) && html.includes(`fitment-badge ${tone}`))
  }
})
test("new confirmations require exact record and never confirm Type 5 automatic", () => {
  for (const [brand, model, year] of paths) {
    const state = journey(brand, model, year)
    const product = searchProducts(state)[0]
    assert.equal(compatibility(product, { ...state.vehicle, gearbox: "اتوماتیک" }, false), "UNKNOWN")
    assert.equal(compatibility(product, { ...state.vehicle, year: "۱۴۰۲" }, false), "UNKNOWN")
    assert.equal(compatibility(product, { ...state.vehicle, id: "unlisted" }, false), "UNKNOWN")
  }
})
test("other year normalizes Persian/Arabic/Latin input and model changes reset dependent year", () => {
  assert.equal(normalizedYear("1400"), "۱۴۰۰")
  assert.equal(normalizedYear("١٤٠٠"), "۱۴۰۰")
  const state = journey("saipa", "saipa-pride", "1400")
  assert.equal(state.vehicle.year, "۱۴۰۰")
  const edit = journeyReducer(state, { type: "openGuided" })
  const model = journeyReducer(edit, { type: "guidedField", field: "modelId", value: "saipa-tiba" })
  assert.equal(model.guidedDraft.year, "")
  assert.equal(model.guidedDraft.gearbox, "")
  assert.equal(journeyReducer(model, { type: "dismissGuided" }).vehicle.year, "۱۴۰۰")
})
test("demo disclosure is a named dialog trigger and explains every illustrative data category", () => {
  const html = renderToStaticMarkup(React.createElement(Disclosure.default))
  assert.match(html, /aria-haspopup="dialog"/)
  assert.match(html, /aria-expanded="false"/)
  assert.match(html, /نسخه نمایشی/)
  const content = Disclosure.demoDisclosure.paragraphs.join(" ")
  for (const term of ["تطبیق", "قیمت", "امتیاز", "فاصله", "GPS", "شماتیک", "مرجع", "ترب"]) assert.ok(content.includes(term))
})
test("new illustrative product descriptors retain distinct identity and offer pricing", () => {
  catalogProducts.forEach(product => {
    assert.ok(!/نمونه [۱۲]|گزینه (اول|دوم)/.test(product.shortName))
    assert.ok(product.offers.every(offer => offer.productId === product.id))
    assert.ok(product.offers.every(offer => Number.isInteger(offer.price) && offer.price > 0))
  })
  const kits = catalogProducts.filter(product => product.vehicleIds?.includes("saipa-pride") && product.partType === "kit")
  assert.equal(new Set(kits.map(product => product.shortName)).size, 2)
  assert.notEqual(kits[0].illustrationTone, kits[1].illustrationTone)
})
