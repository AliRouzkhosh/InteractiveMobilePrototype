import test from "node:test"
import assert from "node:assert/strict"
import { existsSync } from "node:fs"
import { products, areas, compatibility, offersFor, cheapestOffer, sortOffers, visibleProducts, distance, initialJourney, journeyReducer, type JourneyAction } from "../src/demo.ts"

const journey = (...actions: JourneyAction[]) => actions.reduce(journeyReducer, initialJourney)
const confirmedVehicle = { ...initialJourney.vehicle, year: "۱۳۹۷", gearbox: "دستی" }

test("1399 automatic survives product navigation, seller tabs and back", () => {
  const state = journey(
    { type: "editVehicle" },
    { type: "vehicle", field: "year", value: "۱۳۹۹" },
    { type: "vehicle", field: "gearbox", value: "اتوماتیک" },
    { type: "submitVehicle" }, { type: "product", productId: 2 },
    { type: "sellerMode", mode: "physical" }, { type: "back" },
  )
  assert.equal(state.vehicle.year, "۱۳۹۹")
  assert.equal(state.vehicle.gearbox, "اتوماتیک")
  assert.equal(state.productId, 2)
  assert.equal(state.screen, "results")
  assert.equal(state.showCompatibility, false)
  products.forEach(product => assert.equal(compatibility(product, state.vehicle, state.skipped), "UNKNOWN"))
})

test("fitment requires exact demo evidence; absent tuples and skipped input stay unknown", () => {
  assert.equal(compatibility(products[0], confirmedVehicle, false), "CONFIRMED")
  assert.equal(compatibility(products[3], confirmedVehicle, false), "CONFIRMED")
  for (const vehicle of [
    { ...confirmedVehicle, year: "۱۳۹۹" },
    { ...confirmedVehicle, gearbox: "اتوماتیک" },
    { ...confirmedVehicle, gearbox: "نمی‌دانم" },
    { ...confirmedVehicle, id: "another-car" },
  ]) assert.equal(compatibility(products[0], vehicle, false), "UNKNOWN")
  assert.equal(compatibility(products[0], initialJourney.vehicle, true), "UNKNOWN")
  assert.equal(compatibility(products[1], { ...confirmedVehicle, year: "۱۳۹۹" }, false), "CONFIRMED")
})

test("Near Me keeps area and mode through tabs, changing location and back", () => {
  let state = journey({ type: "nearby", enabled: true }, { type: "area", area: "yousefabad" }, { type: "product", productId: 1 })
  assert.equal(state.sellerMode, "physical")
  assert.equal(state.sellerSort, "نزدیک‌ترین فروشگاه")
  state = journeyReducer(state, { type: "sellerMode", mode: "online" })
  assert.equal(state.area, "yousefabad")
  state = journeyReducer(state, { type: "sellerMode", mode: "physical" })
  state = journeyReducer(state, { type: "area", area: "sadeghiyeh" })
  state = journeyReducer(state, { type: "back" })
  assert.equal(state.area, "sadeghiyeh")
  assert.equal(state.nearby, true)
  assert.equal(state.locationPrompt, false)
})

test("identity, images, offers, prices and counts are consistent for every product", () => {
  assert.equal(new Set(products.map(product => product.id)).size, products.length)
  const offerIds = products.flatMap(product => product.offers.map(offer => offer.id))
  assert.equal(new Set(offerIds).size, offerIds.length)
  for (const product of products) {
    assert.ok(product.name && product.brand && product.shortName)
    assert.ok(existsSync(new URL(`../public${product.image}`, import.meta.url)))
    for (const offer of product.offers) {
      assert.equal(offer.productId, product.id)
      assert.ok(Number.isInteger(offer.price) && offer.price > 0)
    }
    for (const mode of ["physical", "online"] as const) {
      const offers = offersFor(product, mode)
      assert.equal(offers.length, mode === "online" ? 3 : [3, 2, 2, 1][product.id - 1])
      assert.equal(cheapestOffer(offers)?.price, Math.min(...offers.map(offer => offer.price)))
      assert.deepEqual(sortOffers(product, mode, "کمترین قیمت", null).map(offer => offer.price), offers.map(offer => offer.price).sort((a, b) => a - b))
    }
  }
  assert.deepEqual(products.map(product => cheapestOffer(product.offers)?.price), [11500000, 19449000, 4607000, 12200000])
})

test("nearest seller uses selected area; absent area never fabricates distance", () => {
  for (const product of products) {
    for (const area of areas) {
      const sorted = sortOffers(product, "physical", "نزدیک‌ترین فروشگاه", area.id)
      const distances = sorted.map(offer => distance(offer, area.id))
      assert.deepEqual(distances, [...distances].sort((a, b) => a - b))
      assert.ok(distances.every(value => value > 0 && Number.isFinite(value)))
      const expected = area.id === "yousefabad"
        ? ["ثریاکو", "یدک غرب", "ثریاکو", "تنظیم موتور محسن"]
        : ["یدک غرب", "یدک غرب", "ثریاکو", "تنظیم موتور محسن"]
      assert.equal(sorted[0].name, expected[product.id - 1])
    }
    assert.equal(distance(product.offers[0], null), Infinity)
  }
  assert.deepEqual(visibleProducts("nearby", "نزدیک‌ترین", "yousefabad").map(product => product.id), [1, 3, 2, 4])
  assert.deepEqual(visibleProducts("nearby", "نزدیک‌ترین", "sadeghiyeh").map(product => product.id), [1, 2, 3, 4])
})

test("all result price sorts work without mutating fixtures", () => {
  const ids = products.map(product => product.id)
  const offerIds = products[0].offers.map(offer => offer.id)
  for (const mode of ["suggested", "online", "nearby"] as const) {
    assert.deepEqual(visibleProducts(mode, "کمترین قیمت", "yousefabad").map(product => product.id), [3, 1, 4, 2])
    assert.deepEqual(visibleProducts(mode, "بیشترین قیمت", "yousefabad").map(product => product.id), [2, 4, 1, 3])
  }
  sortOffers(products[0], "physical", "نزدیک‌ترین فروشگاه", "sadeghiyeh")
  assert.deepEqual(products.map(product => product.id), ids)
  assert.deepEqual(products[0].offers.map(offer => offer.id), offerIds)
})

test("skip and decline allow browsing and preserve entered vehicle without confirming", () => {
  const state = journey({ type: "skipVehicle" }, { type: "nearby", enabled: true }, { type: "declineLocation" }, { type: "product", productId: 4 }, { type: "back" })
  assert.equal(state.nearby, false)
  assert.equal(state.channel, "all")
  assert.equal(state.area, null)
  assert.equal(state.locationPrompt, false)
  assert.deepEqual(state.vehicle, initialJourney.vehicle)
  assert.equal(visibleProducts("suggested", state.resultSort, state.area).length, 4)
  products.forEach(product => assert.equal(compatibility(product, state.vehicle, state.skipped), "UNKNOWN"))
  const resubmitted = journeyReducer(state, { type: "submitVehicle" })
  assert.equal(compatibility(products[0], resubmitted.vehicle, resubmitted.skipped), "UNKNOWN")
})

test("cancel area change retains previous area and unavailable sorts preserve existing choice", () => {
  const state = journey({ type: "nearby", enabled: true }, { type: "area", area: "yousefabad" }, { type: "requestLocation" }, { type: "declineLocation" })
  assert.equal(state.area, "yousefabad")
  assert.equal(state.nearby, true)
  assert.equal(journeyReducer(initialJourney, { type: "resultSort", sort: "نزدیک‌ترین" }).resultSort, "مرتبط‌ترین")
  assert.equal(journeyReducer(initialJourney, { type: "sellerSort", sort: "نزدیک‌ترین فروشگاه" }).sellerSort, "پیشنهاد ترب")
  const sorted = journey({ type: "resultSort", sort: "کمترین قیمت" }, { type: "product", productId: 1 }, { type: "back" })
  assert.equal(sorted.resultSort, "کمترین قیمت")
})
