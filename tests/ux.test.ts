import test from "node:test"
import assert from "node:assert/strict"
import { initialJourney, journeyReducer, products, compatibility, fitmentState, fitmentLabel, vehicleConflict, searchStores, exampleQuery, type JourneyAction } from "../src/demo.ts"

const journey = (...actions: JourneyAction[]) => actions.reduce(journeyReducer, initialJourney)
const vehicle = (year: string, gearbox: string) => journey({ type: "editVehicle" }, { type: "vehicle", field: "year", value: year }, { type: "vehicle", field: "gearbox", value: gearbox }, { type: "submitVehicle" })

test("progressive manual location supports back and close without replacing area", () => {
  let state = journey({ type: "area", area: "sadeghiyeh" }, { type: "requestLocation" }, { type: "manualLocation" })
  assert.equal(state.locationStep, "area")
  assert.equal(state.area, "sadeghiyeh")
  state = journeyReducer(state, { type: "locationBack" })
  assert.equal(state.locationStep, "method")
  state = journeyReducer(state, { type: "manualLocation" })
  state = journeyReducer(state, { type: "declineLocation" })
  assert.equal(state.locationPrompt, false)
  assert.equal(state.area, "sadeghiyeh")
  assert.equal(journeyReducer(state, { type: "requestLocation" }).locationStep, "method")
})

test("simulated current and manual area selections preserve journey context", () => {
  const state = journey({ type: "view", view: "stores" }, { type: "nearby", enabled: true }, { type: "area", area: "yousefabad" }, { type: "product", productId: 2 }, { type: "back" })
  assert.equal(state.area, "yousefabad")
  assert.equal(state.view, "stores")
  assert.equal(state.nearby, true)
  assert.equal(state.query, exampleQuery)
  assert.equal(state.productId, 2)
})

test("three fitment presentation states never treat missing details as evidence", () => {
  assert.equal(fitmentState(products[0], initialJourney.vehicle, false), "INCOMPLETE")
  assert.match(fitmentLabel(products[0], initialJourney.vehicle, false), /ناقص/)
  const known = vehicle("۱۳۹۷", "دستی")
  assert.deepEqual(products.map(product => fitmentState(product, known.vehicle, false)), ["CONFIRMED", "UNKNOWN", "UNKNOWN", "CONFIRMED"])
  assert.match(fitmentLabel(products[0], known.vehicle, false), /دادهٔ نمونه/)
  const uncertain = vehicle("۱۴۰۱", "اتوماتیک")
  products.forEach(product => assert.equal(fitmentState(product, uncertain.vehicle, false), "UNKNOWN"))
  assert.equal(vehicleConflict(uncertain.vehicle), true)
})

test("variant correction is explicit, draft-only, and cannot fabricate Type 6 fitment", () => {
  let state = vehicle("۱۴۰۱", "اتوماتیک")
  const original = { ...state.vehicle }
  state = journeyReducer(state, { type: "editVehicle" })
  state = journeyReducer(state, { type: "variant", id: "" })
  assert.deepEqual(state.vehicle, original)
  assert.equal(vehicleConflict(state.draftVehicle), false)
  state = journeyReducer(state, { type: "submitVehicle" })
  assert.equal(state.vehicle.id, "")
  assert.equal(state.vehicle.gearbox, "اتوماتیک")
  assert.equal(fitmentState(products[0], state.vehicle, false), "INCOMPLETE")
  assert.equal(journeyReducer(state, { type: "query", query: exampleQuery }).vehicle.id, "")
  products.forEach(product => assert.equal(compatibility(product, state.vehicle, false), "UNKNOWN"))
})

test("warning acknowledgement survives navigation and resets on changed specifications", () => {
  let state = journeyReducer(vehicle("۱۴۰۱", "اتوماتیک"), { type: "acknowledgeWarning" })
  state = journeyReducer(journeyReducer(state, { type: "product", productId: 1 }), { type: "back" })
  assert.equal(state.warningAcknowledged, true)
  state = journeyReducer(state, { type: "editVehicle" })
  state = journeyReducer(state, { type: "vehicle", field: "gearbox", value: "دستی" })
  state = journeyReducer(state, { type: "submitVehicle" })
  assert.equal(state.warningAcknowledged, false)
  assert.equal(vehicleConflict(state.vehicle), false)
})

test("entering map from online selects physical stores and blocks internet-only map filtering", () => {
  const online = journey({ type: "channel", channel: "online" })
  const map = journeyReducer(online, { type: "view", view: "map" })
  assert.equal(map.channel, "physical")
  assert.ok(searchStores(map, true).length > 0)
  assert.ok(searchStores(map, true).every(store => store.offers.every(offer => offer.mode === "physical")))
  assert.equal(journeyReducer(map, { type: "channel", channel: "online" }).channel, "physical")
  assert.equal(journeyReducer(map, { type: "marker", storeId: "physical-2" }).mapStoreId, "physical-2")
  assert.equal(journeyReducer(map, { type: "view", view: "products" }).channel, "online")
  const changed = journeyReducer(map, { type: "channel", channel: "all" })
  assert.equal(journeyReducer(changed, { type: "view", view: "stores" }).channel, "all")
})

test("VASURE packaging has matching identity and product-specific offers; guarantees removed", () => {
  const packaged = products[1]
  assert.equal(packaged.image, "/assets/3192b.png")
  assert.match(packaged.brand, /VASURE/)
  assert.match(packaged.sku, /VASURE/)
  assert.ok(packaged.offers.every(offer => offer.productId === packaged.id))
  assert.ok(products.every(product => !/اصلی|گارانتی|لوک/.test(product.name)))
  assert.ok(products[2].imageNote && products[3].imageNote)
})
