import test from "node:test"
import assert from "node:assert/strict"
import { allProducts, compatibility, initialJourney, journeyReducer, searchProducts, searchStores, offersFor, cheapestOffer, sortOffers, vehicleConflict, type Journey, type JourneyAction } from "../src/demo.ts"
import { interpretQuery, exampleQuery, manufacturerQuery } from "../src/query.ts"
import { vehicleCatalog } from "../src/vehicleCatalog.ts"
import { emptyGuided, updateGuided, guidedValid, normalizedYear } from "../src/guided.ts"
import { manufacturerProduct, catalogProducts } from "../src/products.ts"
import { assetMetadata } from "../src/assets.ts"

const reduce = (state: Journey, ...actions: JourneyAction[]) => actions.reduce(journeyReducer, state)
const broad = () => journeyReducer(initialJourney, { type: "query", query: "کلاچ" })
function configured(brandId: string, modelId: string, gearbox = "دستی") {
  return reduce(broad(), { type: "guidedField", field: "brandId", value: brandId }, { type: "guidedField", field: "modelId", value: modelId }, { type: "guidedField", field: "year", value: "1397" }, { type: "guidedField", field: "gearbox", value: gearbox }, { type: "guidedField", field: "partType", value: "kit" }, { type: "applyGuided" })
}

test("three search scenarios route by complete grammar, never arbitrary substring", () => {
  assert.equal(interpretQuery(exampleQuery).kind, "VEHICLE_PART")
  for (const query of [manufacturerQuery, "VALEO 826211", "والئو ۸۲۶۲۱۱", "826211", "3276428262116"]) assert.equal(interpretQuery(query).productId, 5)
  assert.equal(interpretQuery("کلاچ").kind, "AMBIGUOUS")
  for (const query of ["والئو 8262110", "والئو 1826211", "LUK 826211", "کلاچ 826211", "2060 تیپ 5", "دیسک و صفحه 206 تیپ 50", "قطعه والئو 826211 دیگر"]) assert.equal(interpretQuery(query).kind, "AMBIGUOUS")
})
test("manufacturer identifier bypasses both clarification sheets and groups four offers", () => {
  const state = journeyReducer(broad(), { type: "query", query: manufacturerQuery })
  assert.equal(state.guidedOpen, false)
  assert.equal(state.showCompatibility, false)
  assert.deepEqual(searchProducts(state).map(product => product.id), [5])
  assert.equal(manufacturerProduct.offers.length, 4)
  assert.equal(new Set(manufacturerProduct.offers.map(offer => offer.storeId)).size, 4)
  assert.equal(offersFor(manufacturerProduct, "physical").length, 2)
  assert.equal(offersFor(manufacturerProduct, "online").length, 2)
  assert.equal(manufacturerProduct.partNumber, "826211")
  assert.equal(manufacturerProduct.ean, "3276428262116")
  assert.equal(allProducts.filter(product => product.partNumber === "826211").length, 1)
})
test("exact product, stores and map use the same offers and channel minima", () => {
  const state = journeyReducer(initialJourney, { type: "query", query: manufacturerQuery })
  assert.equal(searchStores(state).length, 4)
  assert.equal(searchStores(state, true).length, 2)
  assert.equal(cheapestOffer(manufacturerProduct.offers)?.price, 10800000)
  assert.equal(cheapestOffer(offersFor(manufacturerProduct, "physical"))?.price, 11800000)
  for (const store of searchStores(state)) for (const offer of store.offers) assert.equal(offer.productId, 5)
})
test("five catalog brands contain precisely the requested models without asserted year validity", () => {
  assert.deepEqual(vehicleCatalog.map(brand => brand.id), ["peugeot", "saipa", "renault", "kia", "hyundai"])
  assert.deepEqual(vehicleCatalog.map(brand => brand.models.length), [3, 3, 2, 2, 2])
  vehicleCatalog.forEach(brand => brand.models.forEach(model => assert.deepEqual(model.years, [])))
})
for (const brand of vehicleCatalog) {
  test(`${brand.id}: complete demonstration journey with two kit candidates and matching sellers`, () => {
    const state = configured(brand.id, brand.models[0].id)
    const candidates = searchProducts(state)
    assert.equal(candidates.length, 2)
    assert.equal(state.guidedOpen, false)
    assert.equal(state.vehicle.year, "۱۳۹۷")
    assert.equal(state.vehicle.gearbox, "دستی")
    assert.equal(state.vehicle.id, brand.models[0].id)
    candidates.forEach(product => {
      assert.deepEqual(product.vehicleIds, [state.vehicle.id])
      assert.equal(product.partType, "kit")
      assert.equal(compatibility(product, state.vehicle, false), "UNKNOWN")
    })
    assert.equal(searchStores(state).length, 6)
    assert.equal(searchStores(state, true).length, 3)
    searchStores(state).forEach(store => store.offers.forEach(offer => assert.ok(candidates.some(product => product.id === offer.productId))))
  })
}
test("changing brand resets dependent model and specifications; alien selections are ignored", () => {
  const selected = configured("kia", "kia-rio").guided
  const reset = updateGuided(selected, "brandId", "saipa")
  assert.equal(reset.modelId, "")
  assert.equal(reset.year, "")
  assert.equal(reset.gearbox, "")
  assert.equal(reset.partType, "unknown")
  assert.deepEqual(updateGuided(reset, "modelId", "kia-rio"), reset)
  assert.deepEqual(updateGuided(reset, "brandId", "unknown-brand"), reset)
  assert.deepEqual(updateGuided(reset, "gearbox", "invented"), reset)
})
test("wizard back/edit and dismissal preserve only committed values", () => {
  const original = configured("renault", "renault-l90")
  const edited = reduce(original, { type: "openGuided" }, { type: "guidedStep", step: 3 }, { type: "guidedField", field: "gearbox", value: "اتوماتیک" }, { type: "guidedStep", step: 2 })
  assert.equal(edited.guidedStep, 2)
  assert.equal(edited.vehicle.gearbox, "دستی")
  const cancelled = journeyReducer(edited, { type: "dismissGuided" })
  assert.deepEqual(cancelled.vehicle, original.vehicle)
  assert.deepEqual(cancelled.guidedDraft, original.guided)
  assert.equal(cancelled.guidedOpen, false)
})
test("unknown fields and dismissed wizard never block subsequent guided browsing", () => {
  const dismissed = journeyReducer(broad(), { type: "dismissGuided" })
  assert.equal(dismissed.guidedOpen, false)
  assert.equal(searchProducts(dismissed).length, 0)
  const unknown = reduce(dismissed, { type: "openGuided" }, { type: "applyGuided" })
  assert.deepEqual(unknown.guided, emptyGuided)
  assert.ok(searchProducts(unknown).length > 1)
  assert.equal(unknown.vehicle.year, "")
  assert.equal(unknown.vehicle.gearbox, "")
  searchProducts(unknown).forEach(product => assert.equal(compatibility(product, unknown.vehicle, false), "UNKNOWN"))
})
test("invalid year cannot submit; normalized year does not imply production validity", () => {
  assert.equal(normalizedYear("١٣٩٧"), "۱۳۹۷")
  assert.equal(guidedValid({ ...emptyGuided, year: "oops" }), false)
  const invalid = journeyReducer(broad(), { type: "guidedField", field: "year", value: "139" })
  assert.equal(journeyReducer(invalid, { type: "applyGuided" }).guidedApplied, false)
  assert.equal(guidedValid({ ...emptyGuided, year: "1234" }), true)
})
test("automatic configurations never confirm ordinary manual kits, including conflicting Type 5", () => {
  for (const brand of vehicleCatalog) {
    const state = configured(brand.id, brand.models[0].id, "اتوماتیک")
    searchProducts(state).forEach(product => assert.equal(compatibility(product, state.vehicle, false), "UNKNOWN"))
    assert.equal(vehicleConflict(state.vehicle), brand.id === "peugeot")
  }
})
test("part filtering and model changes produce coherent candidate groups for every catalog model", () => {
  for (const brand of vehicleCatalog) for (const model of brand.models) {
    const kits = configured(brand.id, model.id)
    for (const partType of ["bearing", "cable", "hydraulic"]) {
      const state = reduce(kits, { type: "openGuided" }, { type: "guidedField", field: "partType", value: partType }, { type: "applyGuided" })
      assert.equal(searchProducts(state).length, 1)
      assert.equal(searchProducts(state)[0].partType, partType)
    }
  }
})
test("broad search context persists through all views, area, product, seller tabs and back", () => {
  const original = configured("hyundai", "hyundai-accent")
  const product = searchProducts(original)[0]
  const offer = product.offers.find(offer => offer.storeId === "physical-3")!
  const state = reduce(original, { type: "area", area: "sadeghiyeh" }, { type: "nearby", enabled: true }, { type: "view", view: "map" }, { type: "marker", storeId: offer.storeId }, { type: "product", productId: product.id, offerId: offer.id }, { type: "sellerMode", mode: "online" }, { type: "sellerMode", mode: "physical" }, { type: "back" })
  assert.deepEqual(state.vehicle, original.vehicle)
  assert.deepEqual(state.guided, original.guided)
  assert.equal(state.query, "کلاچ")
  assert.equal(state.view, "map")
  assert.equal(state.area, "sadeghiyeh")
  assert.equal(state.productId, product.id)
  assert.equal(searchStores(state, true)[0].storeId, "physical-3")
  assert.equal(sortOffers(product, "physical", "نزدیک‌ترین فروشگاه", "yousefabad")[0].storeId, "physical-2")
  assert.equal(sortOffers(product, "physical", "نزدیک‌ترین فروشگاه", "sadeghiyeh")[0].storeId, "physical-3")
  const repeated = journeyReducer(state, { type: "query", query: "کلاچ" })
  assert.deepEqual(repeated.vehicle, state.vehicle)
  assert.equal(repeated.guidedOpen, false)
})
test("all registry identities, prices and offer ownership stay consistent and sorting is functional", () => {
  assert.equal(new Set(allProducts.map(product => product.id)).size, allProducts.length)
  allProducts.forEach(product => {
    assert.ok(product.image.startsWith("/assets/"))
    assert.ok(!product.name.includes("CATALOG-") && !product.name.includes("SKU-DEMO"))
    product.offers.forEach(offer => { assert.equal(offer.productId, product.id); assert.ok(offer.price > 0) })
    assert.equal(cheapestOffer(product.offers)?.price, Math.min(...product.offers.map(offer => offer.price)))
  })
  const state = configured("saipa", "saipa-pride")
  const sorted = searchProducts(journeyReducer(state, { type: "resultSort", sort: "بیشترین قیمت" }))
  assert.ok(cheapestOffer(sorted[0].offers)!.price > cheapestOffer(sorted[1].offers)!.price)
  const sortedStores = searchStores(journeyReducer(state, { type: "resultSort", sort: "کمترین قیمت" }))
  assert.deepEqual(sortedStores.map(store => store.offers[0].price), sortedStores.map(store => store.offers[0].price).sort((a, b) => a - b))
})
test("new assets use locally authored placeholders, not unlicensed external packaging", () => {
  assert.equal(manufacturerProduct.image, assetMetadata.neutral.path)
  catalogProducts.forEach(product => assert.equal(product.image, assetMetadata.neutral.path))
  assert.match(assetMetadata.valeo826211.reuse, /excluded/)
})
