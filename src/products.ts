import type { Product } from "./domain.ts"
import { demoOffers, exactOffers } from "./offers.ts"
import { vehicleCatalog } from "./vehicleCatalog.ts"
import { partTypes } from "./guided.ts"
import { assetMetadata } from "./assets.ts"

export const products: Product[] = [
  {
    id: 1,
    sku: "SKU-DEMO-VALEO-206-01",
    name: "کیت کلاچ والئو سبز",
    shortName: "کیت کلاچ والئو سبز",
    brand: "والئو",
    image: "/assets/1ac0c.png",
    offers: demoOffers(1, 11500000),
  },
  {
    id: 2,
    sku: "SKU-DEMO-VASURE-206-02",
    name: "کیت کلاچ واسور (VASURE)",
    shortName: "کیت کلاچ واسور",
    brand: "واسور (VASURE)",
    image: "/assets/3192b.png",
    offers: demoOffers(2, 19449000),
  },
  {
    id: 3,
    sku: "SKU-DEMO-GOLDEN-206-03",
    name: "کیت کلاچ گلدن",
    shortName: "کیت کلاچ گلدن",
    brand: "گلدن",
    image: "/assets/044f1.png",
    imageNote: "تصویر نمونه؛ برند از روی تصویر قابل تأیید نیست.",
    offers: demoOffers(3, 4607000),
  },
  {
    id: 4,
    sku: "SKU-DEMO-VALEO-206-04",
    name: "کیت کلاچ والئو سبز با بلبرینگ",
    shortName: "کیت کلاچ والئو سبز با بلبرینگ",
    brand: "والئو",
    image: "/assets/1ac0c.png",
    imageNote: "تصویر مشترک نمونه والئو؛ تفاوت این پیشنهاد با تصویر قابل تأیید نیست.",
    offers: demoOffers(4, 12200000),
  },
]


export const manufacturerProduct: Product = {
  id: 5, sku: "VALEO-826211", name: "کیت کلاچ والئو 826211", shortName: "والئو 826211", brand: "والئو (Valeo)",
  partNumber: "826211", ean: "3276428262116", technicalReference: assetMetadata.valeo826211.technicalReference,
  image: assetMetadata.valeo826211.path, imageNote: "طرح خنثی نمایشی؛ تصویر واقعی قطعه نیست.", offers: exactOffers,
}
export const catalogProducts: Product[] = vehicleCatalog.flatMap((brand, brandIndex) => brand.models.flatMap((model, modelIndex) =>
  partTypes.filter(part => part.id !== "unknown").flatMap((part, partIndex) => Array.from({length: part.id === "kit" ? 2 : 1}, (_, option) => {
    const id = 100 + brandIndex * 100 + modelIndex * 20 + partIndex * 2 + option
    const descriptor = option ? "طرح خاکستری" : "طرح آبی"
    const name = part.label + " برای " + brand.name + " " + model.name + (part.id === "kit" ? ` · ${descriptor}` : "")
    const shortName = part.id === "kit" ? `کیت ${descriptor} · ${model.name}` : `${part.label} ${model.name}`
    return { id, sku: "CATALOG-" + id, name, shortName, brand: "برند نامشخص", image: assetMetadata.neutral.path,
      illustrationTone: part.id === "kit" && !option ? "blue" : "neutral",
      imageNote: "طرح نمایشی؛ عکس واقعی محصول نیست.", vehicleIds: [model.id], partType: part.id, offers: demoOffers(id, 1800000 + brandIndex * 700000 + modelIndex * 150000 + partIndex * 300000 + option * 200000) }
  }))
))
export const allProducts: Product[] = [...products, manufacturerProduct, ...catalogProducts]
