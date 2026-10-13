import type { Offer } from "./domain.ts"

// Fictional offers in tomans. Distances are illustrative fixtures, not geolocation.
export function demoOffers(productId: number, base: number): Offer[] {
  const offers: Offer[] = [
    {
      id: `${productId}-physical-1`,
      storeId: "physical-1",
      productId,
      mode: "physical",
      name: "تنظیم موتور محسن",
      city: "تهران",
      address: "خیابان پیروزی، خیابان شکوفه",
      price: base + 700000,
      rating: "۵",
      distances: { yousefabad: 8.2, sadeghiyeh: 13.6 },
    },
    {
      id: `${productId}-physical-2`,
      storeId: "physical-2",
      productId,
      mode: "physical",
      name: "ثریاکو",
      city: "تهران",
      address: "خیابان سعدی شمالی، بن‌بست بهار",
      price: base + 1000000,
      rating: "۴٫۹",
      distances: { yousefabad: 5.4, sadeghiyeh: 10.8 },
    },
    {
      id: `${productId}-physical-3`,
      storeId: "physical-3",
      productId,
      mode: "physical",
      name: "یدک غرب",
      city: "تهران",
      address: "صادقیه، خیابان ستارخان",
      price: base + 1300000,
      rating: "۴٫۸",
      distances: { yousefabad: 7.1, sadeghiyeh: 1.2 },
    },
    {
      id: `${productId}-online-1`,
      storeId: "online-1",
      productId,
      mode: "online",
      name: "کاپوت بالا",
      city: "تهران",
      address: "شرایط ارسال نیازمند بررسی با فروشگاه",
      price: base,
      rating: "۵",
    },
    {
      id: `${productId}-online-2`,
      storeId: "online-2",
      productId,
      mode: "online",
      name: "ایمنی یدک",
      city: "تبریز",
      address: "شرایط ضمانت و اصالت نیازمند بررسی",
      price: base + 699000,
      rating: "۴٫۹",
    },
    {
      id: `${productId}-online-3`,
      storeId: "online-3",
      productId,
      mode: "online",
      name: "برترین یدکی سال",
      city: "مشهد",
      address: "هزینه و زمان ارسال تأیید نشده",
      price: base + 1173000,
      rating: "۴٫۸",
    },
  ]
  // Different demo inventory per product; a store's distance stays identical
  // across its offers so changing products never changes the store's location.
  const physicalInventory: Record<number, number[]> = {
    1: [1, 2, 3],
    2: [1, 3],
    3: [1, 2],
    4: [1],
  }
  return offers.filter(offer => offer.mode === "online" || (physicalInventory[productId] ?? [1, 2, 3]).some(store => offer.id === `${productId}-physical-${store}`))
}

export const exactOffers = demoOffers(5, 10800000).filter(offer => ["physical-2", "physical-3", "online-1", "online-2"].includes(offer.storeId))
