export type Mode = "suggested" | "nearby" | "online"
export type SellerMode = "physical" | "online"
export type Compatibility = "CONFIRMED" | "UNKNOWN"
export type AreaId = "yousefabad" | "sadeghiyeh"
export type DiscoveryView = "products" | "stores" | "map"
export type Channel = "all" | SellerMode
export type QueryUnderstanding = {
  kind: "VEHICLE_PART" | "EXACT_SKU" | "AMBIGUOUS"
  part: string | null
  vehicleId: string | null
  productId: number | null
}
export type ResultSort = "مرتبط‌ترین" | "کمترین قیمت" | "بیشترین قیمت" | "نزدیک‌ترین"
export type SellerSort = "پیشنهاد ترب" | "کمترین قیمت" | "نزدیک‌ترین فروشگاه"
export type Vehicle = {
  id: string
  name: string
  year: string
  gearbox: string
}
export type Offer = {
  id: string
  storeId: string
  productId: number
  mode: SellerMode
  name: string
  city: string
  address: string
  price: number
  rating: string
  distances?: Record<AreaId, number>
}
export type Product = {
  id: number
  sku: string
  name: string
  shortName: string
  brand: string
  image: string
  imageNote?: string
  illustrationTone?: string
  vehicleIds?: string[]
  partType?: string
  partNumber?: string
  ean?: string
  technicalReference?: string
  offers: Offer[]
}

