import type { Mode, SellerMode, Compatibility, AreaId, DiscoveryView, Channel, QueryUnderstanding, ResultSort, SellerSort, Vehicle, Offer, Product } from "./domain.ts"
export type * from "./domain.ts"
import { products, allProducts, catalogProducts } from "./products.ts"
export { products, allProducts } from "./products.ts"
import { exampleQuery, interpretQuery } from "./query.ts"
export { exampleQuery, interpretQuery } from "./query.ts"
import { compatibility, vehicleComplete } from "./fitment.ts"
export * from "./fitment.ts"
import { emptyGuided, updateGuided, guidedVehicle, guidedValid, type GuidedDraft, type GuidedField } from "./guided.ts"
import { vehicleCatalog } from "./vehicleCatalog.ts"

export const areas: {
  id: AreaId
  name: string
}[] = [
  { id: "yousefabad", name: "تهران، یوسف‌آباد" },
  { id: "sadeghiyeh", name: "تهران، صادقیه" },
]
export const areaName = (id: AreaId | null) =>
  areas.find((area) => area.id === id)?.name ?? "انتخاب نشده"
export const number = (value: number) =>
  new Intl.NumberFormat("fa-IR").format(value)

export function offersFor(product: Product, mode?: SellerMode): Offer[] {
  return product.offers.filter(
    (offer) => offer.productId === product.id && (!mode || offer.mode === mode),
  )
}
export function cheapestOffer(offers: Offer[]): Offer | undefined {
  return [...offers].sort((a, b) => a.price - b.price)[0]
}
export function distance(offer: Offer, area: AreaId | null): number {
  return area ? (offer.distances?.[area] ?? Infinity) : Infinity
}
export function nearestDistance(product: Product, area: AreaId | null): number {
  return Math.min(
    ...offersFor(product, "physical").map((offer) => distance(offer, area)),
  )
}
export function sortOffers(
  product: Product,
  mode: SellerMode,
  sort: SellerSort,
  area: AreaId | null,
): Offer[] {
  return offersFor(product, mode).sort((a, b) => {
    if (sort === "کمترین قیمت") return a.price - b.price
    if (sort === "نزدیک‌ترین فروشگاه" && mode === "physical" && area)
      return distance(a, area) - distance(b, area)
    return 0 // Original fixture order is the demo recommendation rank.
  })
}
export function visibleProducts(
  mode: Mode,
  sort: ResultSort,
  area: AreaId | null,
): Product[] {
  const offerMode =
    mode === "nearby" ? "physical" : mode === "online" ? "online" : undefined
  const price = (product: Product) =>
    cheapestOffer(offersFor(product, offerMode))?.price ?? Infinity
  return products
    .filter((product) => offersFor(product, offerMode).length > 0)
    .sort((a, b) => {
      if (sort === "کمترین قیمت") return price(a) - price(b)
      if (sort === "بیشترین قیمت") return price(b) - price(a)
      if (
        area &&
        (sort === "نزدیک‌ترین" || (mode === "nearby" && sort === "مرتبط‌ترین"))
      )
        return nearestDistance(a, area) - nearestDistance(b, area)
      return 0
    })
}

export type Journey = {
  screen: "results" | "product"
  query: string
  guided: GuidedDraft
  guidedDraft: GuidedDraft
  guidedApplied: boolean
  guidedOpen: boolean
  guidedStep: number
  view: DiscoveryView
  vehicle: Vehicle
  draftVehicle: Vehicle
  vehicleApplied: boolean
  area: AreaId | null
  channel: Channel
  mapPreviousChannel: Channel | null
  nearby: boolean
  mapStoreId: string | null
  offerId: string | null
  productId: number
  showCompatibility: boolean
  skipped: boolean
  locationPrompt: boolean
  locationStep: "method" | "area"
  warningAcknowledged: boolean
  resultSort: ResultSort
  sellerMode: SellerMode
  sellerSort: SellerSort
}
export const initialJourney: Journey = {
  screen: "results",
  query: exampleQuery,
  guided: { ...emptyGuided },
  guidedDraft: { ...emptyGuided },
  guidedApplied: false,
  guidedOpen: false,
  guidedStep: 0,
  view: "products",
  vehicle: {
    id: "peugeot-206-type5",
    name: "پژو ۲۰۶ · تیپ ۵",
    year: "",
    gearbox: "",
  },
  draftVehicle: { id: "peugeot-206-type5", name: "پژو ۲۰۶ · تیپ ۵", year: "", gearbox: "" },
  vehicleApplied: false,
  area: null,
  channel: "all",
  mapPreviousChannel: null,
  nearby: false,
  mapStoreId: null,
  offerId: null,
  productId: 1,
  showCompatibility: false,
  skipped: false,
  locationPrompt: false,
  locationStep: "method",
  warningAcknowledged: false,
  resultSort: "مرتبط‌ترین",
  sellerMode: "online",
  sellerSort: "پیشنهاد ترب",
}
export type JourneyAction = {
  type: "guidedField"
  field: GuidedField
  value: string
} | {
  type: "guidedStep"
  step: number
} | {
  type: "openGuided" | "dismissGuided" | "applyGuided"
} | {
  type: "vehicle"
  field: "year" | "gearbox"
  value: string
} | {
  type: "editVehicle" | "submitVehicle" | "skipVehicle" | "dismissVehicle" | "requestLocation" | "declineLocation" | "manualLocation" | "locationBack" | "acknowledgeWarning" | "back"
} | {
  type: "variant"
  id: "peugeot-206-type5" | ""
} | {
  type: "query"
  query: string
} | {
  type: "view"
  view: DiscoveryView
} | {
  type: "channel"
  channel: Channel
} | {
  type: "nearby"
  enabled: boolean
} | {
  type: "marker"
  storeId: string
} | {
  type: "area"
  area: AreaId
} | {
  type: "product"
  productId: number
  offerId?: string
} | {
  type: "resultSort"
  sort: ResultSort
} | {
  type: "sellerMode"
  mode: SellerMode
} | {
  type: "sellerSort"
  sort: SellerSort
}
export function journeyReducer(state: Journey, action: JourneyAction): Journey {
  switch (action.type) {
    case "guidedField": return { ...state, guidedDraft: updateGuided(state.guidedDraft, action.field, action.value) }
    case "guidedStep": return { ...state, guidedStep: Math.max(0, Math.min(4, action.step)) }
    case "openGuided": return { ...state, guidedOpen: true, guidedStep: 0, guidedDraft: { ...state.guided }, showCompatibility: false }
    case "dismissGuided": return { ...state, guidedOpen: false, guidedDraft: { ...state.guided } }
    case "applyGuided": {
      if (!guidedValid(state.guidedDraft)) return state
      const vehicle = guidedVehicle(state.guidedDraft)
      return { ...state, guided: { ...state.guidedDraft, year: vehicle.year }, guidedDraft: { ...state.guidedDraft, year: vehicle.year }, guidedApplied: true, guidedOpen: false, vehicle, draftVehicle: { ...vehicle }, vehicleApplied: true, skipped: false, warningAcknowledged: false, mapStoreId: null }
    }
    case "vehicle":
      return {
        ...state,
        draftVehicle: { ...state.draftVehicle, [action.field]: action.value },
      }
    case "editVehicle":
      if (interpretQuery(state.query).kind === "AMBIGUOUS") return { ...state, guidedOpen: true, guidedStep: 0, guidedDraft: { ...state.guided } }
      return { ...state, draftVehicle: { ...state.vehicle }, showCompatibility: true }
    case "variant":
      return { ...state, draftVehicle: { ...state.draftVehicle, id: action.id, name: action.id ? "پژو ۲۰۶ · تیپ ۵" : "پژو ۲۰۶ · تیپ نامشخص" } }
    case "submitVehicle":
      return { ...state, vehicle: { ...state.draftVehicle }, vehicleApplied: true, showCompatibility: false, skipped: false, warningAcknowledged: false }
    case "acknowledgeWarning": return { ...state, warningAcknowledged: true }
    case "skipVehicle":
      return { ...state, draftVehicle: { ...state.vehicle }, showCompatibility: false, skipped: true }
    case "dismissVehicle":
      return { ...state, draftVehicle: { ...state.vehicle }, showCompatibility: false }
    case "query": {
      const interpreted = interpretQuery(action.query)
      const id = interpreted.kind === "VEHICLE_PART" ? interpreted.vehicleId! : ""
      const sameContext = state.vehicle.id === id || state.query === action.query.trim()
      const vehicle = sameContext ? state.vehicle : { id, name: id ? "پژو ۲۰۶ · تیپ ۵" : "خودرو انتخاب نشده", year: "", gearbox: "" }
      const sameQuery = state.query === action.query.trim()
      const broad = interpreted.kind === "AMBIGUOUS"
      const retainedVehicle = sameQuery && state.guidedApplied ? state.vehicle : vehicle
      return { ...state, query: action.query.trim(), screen: "results", vehicle: retainedVehicle, draftVehicle: { ...retainedVehicle }, vehicleApplied: sameContext && state.vehicleApplied, showCompatibility: false, skipped: sameContext && state.skipped, warningAcknowledged: sameContext && state.warningAcknowledged, locationPrompt: false, mapStoreId: null, offerId: null,
        guided: sameQuery ? state.guided : { ...emptyGuided }, guidedDraft: sameQuery ? { ...state.guided } : { ...emptyGuided }, guidedApplied: sameQuery && state.guidedApplied, guidedOpen: broad && (!sameQuery || !state.guidedApplied), guidedStep: 0 }
    }
    case "view": {
      const enteringOnlineMap = action.view === "map" && state.view !== "map" && state.channel === "online"
      const leavingMap = state.view === "map" && action.view !== "map"
      const channel = enteringOnlineMap ? "physical" : leavingMap ? state.mapPreviousChannel ?? state.channel : state.channel
      return { ...state, view: action.view, channel, mapPreviousChannel: enteringOnlineMap ? "online" : leavingMap ? null : state.mapPreviousChannel, nearby: channel === "online" ? false : state.nearby, resultSort: channel === "online" && state.resultSort === "نزدیک‌ترین" ? "مرتبط‌ترین" : state.resultSort }
    }
    case "channel": return state.view === "map" && action.channel === "online" ? state : { ...state, channel: action.channel, mapPreviousChannel: null, nearby: action.channel === "online" ? false : state.nearby, mapStoreId: null, resultSort: action.channel === "online" && state.resultSort === "نزدیک‌ترین" ? "مرتبط‌ترین" : state.resultSort }
    case "nearby": return state.channel === "online" && action.enabled ? state : { ...state, nearby: action.enabled, locationPrompt: action.enabled && !state.area, locationStep: "method" }
    case "marker": return { ...state, mapStoreId: action.storeId }
    case "requestLocation":
      return { ...state, locationPrompt: true, locationStep: "method" }
    case "manualLocation": return { ...state, locationStep: "area" }
    case "locationBack": return { ...state, locationStep: "method" }
    case "declineLocation":
      return {
        ...state,
        locationPrompt: false,
        nearby: state.area ? state.nearby : false,
      }
    case "area":
      return {
        ...state,
        area: action.area,
        locationPrompt: false,
        sellerSort: "نزدیک‌ترین فروشگاه",
      }
    case "product": {
      const product = allProducts.find(product => product.id === action.productId)
      if (!product) return state
      const offer = product.offers.find(offer => offer.id === action.offerId && offer.productId === product.id)
      const sellerMode = offer?.mode ?? (effectiveChannel(state) === "physical" ? "physical" : "online")
      return {
        ...state,
        screen: "product",
        productId: action.productId,
        offerId: offer?.id ?? null,
        sellerMode,
        sellerSort:
          sellerMode === "physical" && state.area
            ? "نزدیک‌ترین فروشگاه"
            : "پیشنهاد ترب",
      }
    }
    case "back":
      return { ...state, screen: "results", locationPrompt: false }
    case "resultSort":
      return action.sort === "نزدیک‌ترین" && (!state.area || state.channel === "online")
        ? state
        : { ...state, resultSort: action.sort }
    case "sellerMode":
      return {
        ...state,
        sellerMode: action.mode,
        offerId: null,
        sellerSort:
          action.mode === "physical" && state.area
            ? "نزدیک‌ترین فروشگاه"
            : "پیشنهاد ترب",
      }
    case "sellerSort":
      return action.sort === "نزدیک‌ترین فروشگاه" &&
        (!state.area || state.sellerMode !== "physical")
        ? state
        : { ...state, sellerSort: action.sort }
  }
}

export function vehicleSummary(vehicle: Vehicle): string {
  return `${vehicle.name} · ${vehicle.year ? `ساخت ${vehicle.year}` : "سال نامشخص"} · ${vehicle.gearbox || "گیربکس نامشخص"}`
}
export function effectiveChannel(state: Journey): Channel {
  return state.nearby ? "physical" : state.channel
}
export function priceScope(channel: Channel): string {
  return channel === "all" ? "کمترین قیمت بین همه فروشگاه‌ها" : channel === "online" ? "کمترین قیمت فروشگاه‌های اینترنتی" : "کمترین قیمت فروشگاه‌های حضوری"
}
export function queryProducts(query: string): Product[] {
  const interpreted = interpretQuery(query)
  if (interpreted.kind === "AMBIGUOUS") return []
  return interpreted.kind === "EXACT_SKU" ? allProducts.filter(product => product.id === interpreted.productId) : products
}
export function matchingProducts(state: Journey): Product[] {
  if (interpretQuery(state.query).kind !== "AMBIGUOUS") return queryProducts(state.query)
  if (!state.guidedApplied) return []
  const draft = state.guided
  const modelIds = vehicleCatalog.find(brand => brand.id === draft.brandId)?.models.map(model => model.id)
  return catalogProducts.filter(product =>
    (!draft.modelId || product.vehicleIds?.includes(draft.modelId)) &&
    (!draft.brandId || product.vehicleIds?.some(id => modelIds?.includes(id))) &&
    (draft.partType === "unknown" || product.partType === draft.partType))
}
export function searchProducts(state: Journey): Product[] {
  const channel = effectiveChannel(state)
  const area = state.nearby || state.resultSort === "نزدیک‌ترین" ? state.area : null
  const mode = channel === "all" ? undefined : channel
  return matchingProducts(state).filter(product => offersFor(product, mode).length > 0).sort((a, b) => {
    if (state.resultSort === "کمترین قیمت") return cheapestOffer(offersFor(a, mode))!.price - cheapestOffer(offersFor(b, mode))!.price
    if (state.resultSort === "بیشترین قیمت") return cheapestOffer(offersFor(b, mode))!.price - cheapestOffer(offersFor(a, mode))!.price
    if (area && channel !== "online") return nearestDistance(a, area) - nearestDistance(b, area)
    return 0
  })
}
export type StoreResult = {
  storeId: string
  representative: Offer
  offers: Offer[]
}
export function searchStores(state: Journey, mapOnly = false): StoreResult[] {
  const channel = effectiveChannel(state)
  if (mapOnly && channel === "online") return []
  const grouped = new Map<string, StoreResult>()
  for (const product of matchingProducts(state)) {
    for (const offer of offersFor(product, mapOnly ? "physical" : channel === "all" ? undefined : channel)) {
      const existing = grouped.get(offer.storeId)
      if (existing) existing.offers.push(offer)
      else grouped.set(offer.storeId, { storeId: offer.storeId, representative: offer, offers: [offer] })
    }
  }
  return [...grouped.values()].map(store => ({ ...store, offers: [...store.offers].sort((a, b) => a.price - b.price) })).sort((a, b) => {
    if (state.resultSort === "کمترین قیمت") return a.offers[0].price - b.offers[0].price
    if (state.resultSort === "بیشترین قیمت") return b.offers[0].price - a.offers[0].price
    if (state.area && (state.nearby || mapOnly || state.resultSort === "نزدیک‌ترین")) return distance(a.representative, state.area) - distance(b.representative, state.area)
    return 0
  })
}
// Percent positions for an abstract diagram, never latitude/longitude.
export const schematicPins: Record<string, [number, number]> = {
  "physical-1": [74, 69], "physical-2": [54, 38], "physical-3": [22, 59],
}
