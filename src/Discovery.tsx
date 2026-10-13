import { useEffect, type Dispatch } from "react"
import CompatibilityBadge from "./CompatibilityBadge"
import { allProducts as products, number, areaName, distance, searchStores, schematicPins, type Journey, type JourneyAction, type StoreResult } from "./demo"

type Props = {
  state: Journey
  dispatch: Dispatch<JourneyAction>
}

function StoreCard({ store, state, dispatch, preview = false }: Props & {
  store: StoreResult
  preview?: boolean
}) {
  const seller = store.representative
  return (
    <article id={`store-${store.storeId}`} className={`store-result ${state.mapStoreId === store.storeId ? "highlighted-offer" : ""}`} dir="rtl" tabIndex={-1}>
      <div className="seller-top">
        <div><strong>{seller.name}</strong><small>{seller.city} · {seller.mode === "physical" ? "حضوری" : "اینترنتی"}</small></div>
        <span>★ {seller.rating} · امتیاز فرضی</span>
      </div>
      <p className="store-meta">{seller.mode === "physical" ? seller.address : "پیشنهادهای خرید اینترنتی (نمایشی)"}
        {state.area && seller.mode === "physical" && <span> · {number(distance(seller, state.area))} کیلومتر از {areaName(state.area)} (نمایشی)</span>}
      </p>
      <small>{number(store.offers.length)} پیشنهاد مطابق جستجو</small>
      <div className="store-offers">
        {(preview ? store.offers.slice(0, 1) : store.offers).map(offer => {
          const product = products.find(product => product.id === offer.productId)!
          return <button key={offer.id} className="store-offer" onClick={() => dispatch({ type: "product", productId: product.id, offerId: offer.id })}>
            <img src={product.image} alt={product.shortName} className={product.illustrationTone === "blue" ? "illustration-blue" : undefined} />
            <span><strong>{product.shortName}</strong><small>برند {product.brand}</small><CompatibilityBadge product={product} vehicle={state.vehicle} skipped={state.skipped} /><b>{number(offer.price)} تومان</b></span>
            <span className="offer-arrow" aria-hidden="true">‹</span>
          </button>
        })}
      </div>
    </article>
  )
}

export default function Discovery({ state, dispatch }: Props) {
  useEffect(() => {
    if (state.view === "stores" && state.mapStoreId) {
      const selectedStore = document.getElementById(`store-${state.mapStoreId}`)
      selectedStore?.scrollIntoView({ block: "start" })
      selectedStore?.focus({ preventScroll: true })
    }
  }, [state.view, state.mapStoreId])
  const stores = searchStores(state, state.view === "map")
  const selected = stores.find(store => store.storeId === state.mapStoreId)
  if (state.view === "stores") return <section className="store-results" aria-label="فروشگاه‌های مطابق جستجو">{stores.map(store => <StoreCard key={store.storeId} store={store} state={state} dispatch={dispatch} />)}</section>
  return (
    <section className="map-view" dir="rtl" aria-label="نقشه نمایشی فروشگاه‌ها">
      <p className="map-disclaimer">فروشگاه‌های حضوری روی نقشه شماتیک نمایشی؛ جایگاه پین‌ها مختصات واقعی نیست.</p>
      {state.channel === "online" ? <div className="empty-state"><p>فروشگاه‌های اینترنتی در این نقشه نمایش داده نمی‌شوند.</p><button className="outline" onClick={() => dispatch({ type: "channel", channel: "physical" })}>نمایش فروشگاه‌های حضوری</button></div> : <>
        {!state.area && <div className="context-prompt"><p>برای مقایسه فاصله‌های نمایشی، محدوده را انتخاب کنید.</p><button onClick={() => dispatch({ type: "requestLocation" })}>انتخاب محدوده</button></div>}
        <div className="schematic-map" aria-label="پین‌های فروشگاه‌های حضوری">
          <svg className="map-roads" viewBox="0 0 360 300" aria-hidden="true"><path d="M0 80H360M0 215H360M85 0V300M260 0V300M0 300L360 0" /></svg>
          <span className="map-area-label">{state.area ? areaName(state.area) : "محدوده نمایشی"}</span>
          {stores.map(store => {
            const [x, y] = schematicPins[store.storeId]
            return <button key={store.storeId} className={`map-pin ${selected?.storeId === store.storeId ? "active" : ""}`} style={{ left: `${x}%`, top: `${y}%` }} aria-label={`نمایش ${store.representative.name}`} aria-pressed={selected?.storeId === store.storeId} onClick={() => dispatch({ type: "marker", storeId: store.storeId })}><span aria-hidden="true">●</span><small>{store.representative.name}</small></button>
          })}
          <span className="map-scale">بدون مقیاس جغرافیایی</span>
        </div>
        {selected ? <div className="map-preview" aria-live="polite"><StoreCard store={selected} state={state} dispatch={dispatch} preview /><button className="outline" onClick={() => dispatch({ type: "view", view: "stores" })}>مشاهده پیشنهادهای این فروشگاه</button></div> : <p className="map-hint">برای دیدن پیشنهاد، یک پین را انتخاب کنید.</p>}
        <div className="map-accessible-list">{stores.map(store => <button key={store.storeId} onClick={() => dispatch({ type: "marker", storeId: store.storeId })}>{store.representative.name}{state.area ? ` · ${number(distance(store.representative, state.area))} کیلومتر` : ""}</button>)}</div>
      </>}
    </section>
  )
}
