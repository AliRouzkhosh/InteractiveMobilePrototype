import test from "node:test"
import assert from "node:assert/strict"
import { products, exampleQuery, interpretQuery, compatibility, initialJourney, journeyReducer, searchProducts, searchStores, effectiveChannel, priceScope, type JourneyAction } from "../src/demo.ts"
const journey = (...actions: JourneyAction[]) => actions.reduce(journeyReducer, initialJourney)

test("query fixture parser identifies only explicit part/model or exact demo SKU", () => {
  assert.deepEqual(interpretQuery(exampleQuery), { kind: "VEHICLE_PART", part: "دیسک و صفحه", vehicleId: "peugeot-206-type5", productId: null })
  assert.equal(interpretQuery("ديسك و صفحه ٢٠٦ تيپ ٥").kind, "VEHICLE_PART")
  assert.equal(interpretQuery("کلاچ").kind, "AMBIGUOUS")
  assert.equal(interpretQuery("دیسک و صفحه").vehicleId, null)
  assert.equal(interpretQuery("دیسک و صفحه ۲۰۶ تیپ ۶").kind, "AMBIGUOUS")
  assert.equal(interpretQuery("2060 تیپ 5 کیت کلاچ").vehicleId, null)
  for (const product of products) {
    assert.deepEqual(interpretQuery(product.sku.toLowerCase()), { kind: "EXACT_SKU", part: null, vehicleId: null, productId: product.id })
  }
})

test("initial search is non-blocking with no assumed year or gearbox", () => {
  assert.equal(initialJourney.vehicle.year, "")
  assert.equal(initialJourney.vehicle.gearbox, "")
  assert.equal(initialJourney.showCompatibility, false)
  assert.equal(searchProducts(initialJourney).length, 4)
  products.forEach(product => assert.equal(compatibility(product, initialJourney.vehicle, false), "UNKNOWN"))
})

test("vehicle sheet applies draft atomically and dismissal discards unapplied changes", () => {
  let state = journey({ type: "editVehicle" }, { type: "vehicle", field: "year", value: "۱۳۹۷" }, { type: "vehicle", field: "gearbox", value: "دستی" })
  assert.equal(state.vehicle.year, "")
  assert.equal(compatibility(products[0], state.vehicle, state.skipped), "UNKNOWN")
  state = journeyReducer(state, { type: "submitVehicle" })
  assert.equal(state.showCompatibility, false)
  assert.equal(state.vehicleApplied, true)
  assert.equal(compatibility(products[0], state.vehicle, state.skipped), "CONFIRMED")
  assert.equal(compatibility(products[2], state.vehicle, state.skipped), "UNKNOWN")
  state = journeyReducer(state, { type: "editVehicle" })
  state = journeyReducer(state, { type: "vehicle", field: "gearbox", value: "اتوماتیک" })
  state = journeyReducer(state, { type: "dismissVehicle" })
  assert.equal(state.vehicle.gearbox, "دستی")
  assert.equal(state.draftVehicle.gearbox, "دستی")
})

test("unknown and skip paths do not invent fitment or block browsing", () => {
  const incomplete = journey({ type: "editVehicle" }, { type: "vehicle", field: "year", value: "۱۳۹۷" }, { type: "submitVehicle" })
  products.forEach(product => assert.equal(compatibility(product, incomplete.vehicle, false), "UNKNOWN"))
  const skipped = journeyReducer(incomplete, { type: "skipVehicle" })
  assert.equal(searchProducts(skipped).length, 4)
  assert.equal(skipped.vehicle.year, "۱۳۹۷")
  assert.equal(skipped.showCompatibility, false)
  assert.equal(journeyReducer(skipped, { type: "query", query: exampleQuery }).skipped, true)
})

test("exact SKU bypasses clarification; ambiguous search never assumes vehicle or matches", () => {
  const exact = journey({ type: "query", query: products[1].sku })
  assert.equal(exact.showCompatibility, false)
  assert.equal(exact.vehicle.id, "")
  assert.deepEqual(searchProducts(exact).map(product => product.id), [2])
  assert.ok(searchStores(exact).every(store => store.offers.every(offer => offer.productId === 2)))
  const ambiguous = journey({ type: "query", query: "کلاچ" })
  assert.equal(ambiguous.vehicle.id, "")
  assert.deepEqual(searchProducts(ambiguous), [])
  assert.deepEqual(searchStores(ambiguous), [])
})

test("three views preserve query, vehicle, location and channel through offer navigation", () => {
  let state = journey({ type: "editVehicle" }, { type: "vehicle", field: "year", value: "۱۳۹۹" }, { type: "vehicle", field: "gearbox", value: "اتوماتیک" }, { type: "submitVehicle" }, { type: "channel", channel: "physical" }, { type: "nearby", enabled: true }, { type: "area", area: "sadeghiyeh" })
  for (const view of ["products", "stores", "map"] as const) {
    state = journeyReducer(state, { type: "view", view })
    const store = searchStores(state, view === "map")[0]
    const offer = store.offers[0]
    const opened = journeyReducer(state, { type: "product", productId: offer.productId, offerId: offer.id })
    assert.equal(opened.offerId, offer.id)
    assert.equal(opened.sellerMode, offer.mode)
    state = journeyReducer(opened, { type: "back" })
    assert.equal(state.view, view)
    assert.equal(state.query, exampleQuery)
    assert.equal(state.vehicle.year, "۱۳۹۹")
    assert.equal(state.vehicle.gearbox, "اتوماتیک")
    assert.equal(state.area, "sadeghiyeh")
    assert.equal(state.channel, "physical")
    assert.equal(state.nearby, true)
  }
})

test("location selection and cancelling do not change purchase channel or discovery view", () => {
  const state = journey({ type: "view", view: "map" }, { type: "requestLocation" }, { type: "area", area: "yousefabad" }, { type: "requestLocation" }, { type: "declineLocation" })
  assert.equal(state.view, "map")
  assert.equal(state.channel, "all")
  assert.equal(state.area, "yousefabad")
  assert.equal(state.locationPrompt, false)
  const declined = journey({ type: "nearby", enabled: true }, { type: "declineLocation" })
  assert.equal(declined.nearby, false)
  assert.equal(searchProducts(declined).length, 4)
})

test("product, store and map offer sets agree; map includes only physical stores", () => {
  for (const channel of ["all", "physical", "online"] as const) {
    const state = journey({ type: "channel", channel })
    const stores = searchStores(state)
    const expected = searchProducts(state).flatMap(product => product.offers.filter(offer => channel === "all" || offer.mode === channel)).map(offer => offer.id).sort()
    assert.deepEqual(stores.flatMap(store => store.offers.map(offer => offer.id)).sort(), expected)
    for (const store of stores) assert.ok(store.offers.every(offer => offer.storeId === store.storeId && products.some(product => product.id === offer.productId && product.offers.some(row => row.id === offer.id))))
    const map = searchStores(state, true)
    assert.ok(map.every(store => store.offers.every(offer => offer.mode === "physical")))
    if (channel === "online") assert.equal(map.length, 0)
  }
  const wrongOffer = journey({ type: "product", productId: 1, offerId: products[1].offers[0].id })
  assert.equal(wrongOffer.offerId, null)
})

test("proximity and price scope are explicit and independent from view", () => {
  const near = journey({ type: "nearby", enabled: true }, { type: "area", area: "yousefabad" })
  assert.equal(near.channel, "all")
  assert.equal(effectiveChannel(near), "physical")
  assert.match(priceScope(effectiveChannel(near)), /حضوری/)
  assert.match(priceScope("all"), /همه/)
  const online = journeyReducer(near, { type: "channel", channel: "online" })
  assert.equal(online.nearby, false)
  assert.equal(online.area, "yousefabad")
  assert.equal(journeyReducer(online, { type: "nearby", enabled: true }).nearby, false)
  assert.equal(searchStores(near)[0].representative.name, "ثریاکو")
})
