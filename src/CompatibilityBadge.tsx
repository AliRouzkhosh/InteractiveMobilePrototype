import { badgePresentation } from "./fitment"
import type { Product, Vehicle } from "./domain"

export default function CompatibilityBadge({ product, vehicle, skipped }: { product: Product; vehicle: Vehicle; skipped: boolean }) {
  const badge = badgePresentation(product, vehicle, skipped)
  return <span className={`compat fitment-badge ${badge.tone}`} data-product-id={product.id} data-fitment={badge.status}
    title={badge.status === "CONFIRMED" ? "تطبیق با رکورد ساختگی؛ تأیید فنی واقعی نیست" : "پیش از خرید با فروشنده یا متخصص بررسی کنید"}>{badge.label}</span>
}
