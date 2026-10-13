import { useState, type Dispatch, type ReactNode } from "react"
import BottomSheet from "./BottomSheet"
import Discovery from "./Discovery"
import { interpretQuery, searchProducts, searchStores, priceScope, effectiveChannel, areaName, vehicleSummary, vehicleComplete, vehicleConflict, vehicleConflictExplanation, compatibility, number, type Product, type Journey, type JourneyAction, type DiscoveryView, type ResultSort, type Channel } from "./demo"
import { manufacturerQuery } from "./query"
import { partTypes } from "./guided"
import DemoDisclosure from "./DemoDisclosure"

type Props = {
  state: Journey
  dispatch: Dispatch<JourneyAction>
  renderProduct: (product: Product) => ReactNode
}
const views: [DiscoveryView, string][] = [["products", "محصولات"], ["stores", "فروشگاه‌ها"], ["map", "نقشه"]]
const channels: [Channel, string][] = [["all", "همه"], ["online", "اینترنتی"], ["physical", "حضوری"]]

export default function SearchResults({ state, dispatch, renderProduct }: Props) {
  const [sortOpen, setSortOpen] = useState(false)
  const [warningOpen, setWarningOpen] = useState(false)
  const interpreted = interpretQuery(state.query)
  const results = searchProducts(state)
  const stores = searchStores(state, state.view === "map")
  const noConfirmed = state.vehicleApplied && !state.skipped && vehicleComplete(state.vehicle) && results.length > 0 && !results.some(product => compatibility(product, state.vehicle, state.skipped) === "CONFIRMED")
  const conflict = vehicleConflict(state.vehicle)
  const warning = conflict || noConfirmed
  const explanation = `${conflict ? vehicleConflictExplanation + " " : ""}برای مشخصات انتخابی، هیچ تطبیقی در دادهٔ ساختگی ثبت نشده است. محصولات نیازمند بررسی با فروشنده یا متخصص هستند. دادهٔ نمونه تأیید سازگاری واقعی نیست.`
  return (
    <main className="results-scroll" dir="rtl">
      <DemoDisclosure />
      {interpreted.kind === "AMBIGUOUS" && state.guidedApplied ? <section className="vehicle-context compact-context"><div><strong>{vehicleSummary(state.vehicle)}</strong><small>نوع قطعه: {state.guided.partType === "unknown" ? "نامشخص" : partTypes.find(part => part.id === state.guided.partType)?.label}</small></div><button onClick={() => dispatch({ type: "openGuided" })}>ویرایش</button></section> : interpreted.kind === "AMBIGUOUS" ? <section className="context-prompt ambiguous-prompt" aria-label="روشن کردن جستجو">
        <strong>منظورتان کدام قطعه یا خودرو است؟</strong>
        <p>خودرو و نوع قطعه را مرحله‌به‌مرحله انتخاب کنید؛ موارد نامشخص را می‌توانید رد کنید.</p>
        <button onClick={() => dispatch({ type: "openGuided" })}>راهنمای انتخاب خودرو و قطعه</button>
        <button onClick={() => dispatch({ type: "query", query: manufacturerQuery })}>جستجوی شماره قطعه والئو 826211</button>
      </section> : interpreted.kind === "EXACT_SKU" ? <p className="query-understood">شماره قطعه دقیق · {interpreted.productId === 5 ? "یک محصول با چهار پیشنهاد ساختگی؛ تعداد واقعی ترب بررسی نشده است." : "شناسه داخلی نمونه"} سازگاری نیازمند بررسی است.</p> : state.vehicleApplied && !state.skipped ? <section className="vehicle-context compact-context">
        <div><strong>{vehicleSummary(state.vehicle)}</strong></div>
        <button onClick={() => dispatch({ type: "editVehicle" })}>ویرایش</button>
      </section> : <section className="context-prompt">
        <p>۲۰۶ تیپ ۵ · سال و گیربکس نامشخص</p>
        <button onClick={() => dispatch({ type: "editVehicle" })}>تکمیل مشخصات خودرو</button>
      </section>}
      {warning && <section className={`compatibility-explanation ${state.warningAcknowledged ? "acknowledged" : ""}`} role="status">
        <strong>{conflict ? "تیپ ۵ + اتوماتیک نیازمند بررسی" : "برای این خودرو تطبیق نمونه نداریم"}</strong>
        {!state.warningAcknowledged && <p>{conflict ? "تیپ ۵ معمولاً دستی است؛ تیپ یا گیربکس را بررسی کنید. " : ""}تطبیقی برای این مشخصات ثبت نشده؛ پیش از خرید بررسی کنید.</p>}
        <button className="text-action" onClick={() => setWarningOpen(true)}>توضیح و اصلاح</button>
        {!state.warningAcknowledged && <button className="text-action" onClick={() => dispatch({ type: "acknowledgeWarning" })}>متوجه شدم</button>}
      </section>}
      <div className="sticky-controls discovery-controls">
        <div className="mode-tabs discovery-tabs" role="tablist" aria-label="نمای نتایج">
          {views.map(([view, label], index) => <button key={view} role="tab" id={`view-${view}`} aria-controls="discovery-panel" aria-selected={state.view === view} tabIndex={state.view === view ? 0 : -1} className={state.view === view ? "active" : ""} onClick={() => dispatch({ type: "view", view })}
            onKeyDown={event => {
              const next = event.key === "ArrowLeft" ? (index + 1) % views.length : event.key === "ArrowRight" ? (index + views.length - 1) % views.length : event.key === "Home" ? 0 : event.key === "End" ? views.length - 1 : -1
              if (next >= 0) { event.preventDefault(); dispatch({ type: "view", view: views[next][0] }); document.getElementById(`view-${views[next][0]}`)?.focus() }
            }}>{label}</button>)}
        </div>
        <div className="purchase-filters" aria-label="کانال خرید و نزدیکی">
          <div className="channel-options" role="group" aria-label="کانال خرید"><span>خرید:</span>{channels.map(([channel, label]) => <button key={channel} disabled={state.view === "map" && channel === "online"} title={state.view === "map" && channel === "online" ? "نقشه فقط فروشگاه حضوری را نمایش می‌دهد" : undefined} aria-pressed={state.channel === channel} className={state.channel === channel ? "selected" : ""} onClick={() => dispatch({ type: "channel", channel })}>{label}</button>)}</div>
          <button className={`nearby-toggle ${state.nearby ? "selected" : ""}`} role="switch" aria-checked={state.nearby} disabled={state.channel === "online"} title={state.channel === "online" ? "نزدیکی فقط برای فروشگاه حضوری است" : "فاصله‌ها نمایشی هستند"} onClick={() => dispatch({ type: "nearby", enabled: !state.nearby })}>نزدیک من</button>
        </div>
        {state.view === "map" && <p className="map-channel-note">نقشه مخصوص خرید حضوری است؛ برای خرید اینترنتی به محصولات یا فروشگاه‌ها بروید.</p>}
        <div className="location-summary"><span>{state.area ? areaName(state.area) : "محدوده انتخاب نشده"}</span><button onClick={() => dispatch({ type: "requestLocation" })}>{state.area ? "تغییر محدوده" : "انتخاب محدوده"}</button></div>
        <div className="result-control"><span>{number(state.view === "products" ? results.length : stores.length)} {state.view === "products" ? "محصول" : "فروشگاه"}</span><button onClick={() => setSortOpen(true)}><img src="/assets/11ced.svg" alt="" />{state.resultSort}</button></div>
      </div>
      {(interpreted.kind !== "AMBIGUOUS" || state.guidedApplied) && <>
        <p className="price-scope">{priceScope(state.view === "map" && state.channel !== "online" ? "physical" : effectiveChannel(state))} · تومان</p>
        <div id="discovery-panel" role="tabpanel" aria-labelledby={`view-${state.view}`}>
          {state.view === "products" ? <section className="product-grid" aria-label="محصولات مطابق جستجو">{results.map(renderProduct)}</section> : <Discovery state={state} dispatch={dispatch} />}
        </div>
      </>}
      {sortOpen && <BottomSheet title="مرتب‌سازی نتایج" onClose={() => setSortOpen(false)}>
        {(["مرتبط‌ترین", "کمترین قیمت", "بیشترین قیمت", "نزدیک‌ترین"] as ResultSort[]).map(sort => <button key={sort} className={state.resultSort === sort ? "chosen" : ""} disabled={sort === "نزدیک‌ترین" && (!state.area || state.channel === "online")} onClick={() => { dispatch({ type: "resultSort", sort }); setSortOpen(false) }}>{sort}{sort === "نزدیک‌ترین" && (!state.area || state.channel === "online") ? " (نیازمند محدوده و فروشگاه حضوری)" : ""}</button>)}
      </BottomSheet>}
      {warningOpen && <BottomSheet title="بررسی مشخصات و سازگاری" onClose={() => setWarningOpen(false)}><p className="sheet-help">{explanation}</p><button className="primary" onClick={() => { setWarningOpen(false); dispatch({ type: "editVehicle" }) }}>اصلاح مشخصات خودرو</button><button className="skip" onClick={() => { setWarningOpen(false); dispatch({ type: "acknowledgeWarning" }) }}>ادامه با سازگاری نامشخص</button></BottomSheet>}
    </main>
  )
}
