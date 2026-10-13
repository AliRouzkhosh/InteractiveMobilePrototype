import { useReducer, useState, useEffect, useRef, type Dispatch, type ReactNode } from "react"
import BottomSheet from "./BottomSheet"
import SearchResults from "./SearchResults"
import GuidedSearch from "./GuidedSearch"
import CompatibilityBadge from "./CompatibilityBadge"
import DemoDisclosure from "./DemoDisclosure"
import { manufacturerQuery } from "./query"

import {
  areas,
  areaName,
  number,
  allProducts,
  vehicleConflict,
  vehicleConflictExplanation,
  exampleQuery,
  offersFor,
  cheapestOffer,
  nearestDistance,
  distance,
  sortOffers,
  effectiveChannel,
  priceScope,
  vehicleSummary,
  initialJourney,
  journeyReducer,
  type Product,
  type Journey,
  type JourneyAction,
  type SellerSort,
} from "./demo"

const A = "/assets"

type JourneyProps = {
  state: Journey
  dispatch: Dispatch<JourneyAction>
}

function ScopeButton({
  children,
  className,
  label,
}: {
  children: ReactNode
  className?: string
  label?: string
}) {
  return (
    <button
      className={className}
      aria-label={label}
      title="خارج از محدوده نمونه نمایشی"
      disabled
    >
      {children}
    </button>
  )
}

function SearchHeader({ title, back, onSearch }: {
  title: string
  back?: () => void
  onSearch?: (query: string) => void
}) {
  const [draft, setDraft] = useState(title)
  const [suggestions, setSuggestions] = useState(false)
  useEffect(() => setDraft(title), [title])
  return (
    <header className="app-header" dir="rtl">
      <form className="search-shell" onSubmit={event => { event.preventDefault(); if (draft.trim()) { onSearch?.(draft); setSuggestions(false) } }}>
        {onSearch ? <button type="submit" className="search-button" aria-label="جستجو"><img src={`${A}/3d3f2.svg`} alt="" /></button> : <ScopeButton className="search-button" label="جستجو">
          <img src={`${A}/3d3f2.svg`} alt="" />
        </ScopeButton>}
        {onSearch ? <input className="search-title" aria-label="عبارت جستجو" aria-haspopup="dialog" value={draft} onClick={() => setSuggestions(true)} onKeyDown={event => { if (event.key === "ArrowDown") { event.preventDefault(); setSuggestions(true) } }} onChange={event => setDraft(event.target.value)} /> : <div className="search-title">{title}</div>}
      </form>
      {back && (
        <button className="back-button" onClick={back} aria-label="بازگشت">
          ‹
        </button>
      )}
      {suggestions && <BottomSheet title="پیشنهادهای جستجو" onClose={() => setSuggestions(false)}>
        <form className="suggestion-search" onSubmit={event => { event.preventDefault(); if (draft.trim()) { onSearch?.(draft); setSuggestions(false) } }}>
          <input autoFocus aria-label="جستجو در پیشنهادها" value={draft} onChange={event => setDraft(event.target.value)} />
          <button className="primary" type="submit">نمایش نتایج</button>
        </form>
        <p className="sheet-help">جستجوهای پیشنهادی</p>
        {[[exampleQuery, "دیسک و صفحه ۲۰۶ تیپ ۵"], [manufacturerQuery, "والئو 826211 · شماره قطعه سازنده"], ["کلاچ", "کلاچ · انتخاب مرحله‌ای خودرو و قطعه"]].map(([query, label]) => <button key={query} onClick={() => { onSearch?.(query); setSuggestions(false) }}>{label}</button>)}
      </BottomSheet>}
    </header>
  )
}

function BottomNav({ onSearch }: { onSearch: () => void }) {
  const items = [
    ["949d0.svg", "ترب من"],

    ["60053.svg", "پیشنهاد ویژه"],

    ["1dbdd.svg", "دسته‌بندی"],

    ["770d0.svg", "جستجو"],
  ]

  return (
    <nav className="bottom-nav" dir="rtl">
      {items.reverse().map(([icon, label]) => (
        label === "جستجو" ? <button key={label} onClick={onSearch}><img src={`${A}/${icon}`} alt="" /><span>{label}</span></button> : <ScopeButton key={label}>
          <img src={`${A}/${icon}`} alt="" />
          <span>{label}</span>
        </ScopeButton>
      ))}
    </nav>
  )
}

function VehiclePanel({
  vehicle,
  onVariant,
  year,

  gearbox,

  onYear,

  onGearbox,

  onSubmit,

  onSkip,
}: {
  vehicle: Journey["draftVehicle"]
  onVariant: (id: "peugeot-206-type5" | "") => void
  year: string

  gearbox: string

  onYear: (value: string) => void

  onGearbox: (value: string) => void

  onSubmit: () => void

  onSkip: () => void
}) {
  return (
    <section className="vehicle-panel" dir="rtl">
      <div className="panel-heading">
        <img src={`${A}/b7879.svg`} alt="" />
        <div>
          <strong>مشخصات خودروی شما</strong>
          <small>مدل، سال ساخت و نوع گیربکس</small>
        </div>
      </div>
      <fieldset className="choice-group variant-choices"><legend>تیپ خودرو</legend>{[["peugeot-206-type5", "۲۰۶ تیپ ۵"], ["", "تیپ را نمی‌دانم"]].map(([id, label]) => <label key={id} className={vehicle.id === id ? "selected" : ""}><input type="radio" name="vehicle-variant" checked={vehicle.id === id} onChange={() => onVariant(id as "peugeot-206-type5" | "")} />{label}</label>)}</fieldset>
      <div className="field-label">
        <img src={`${A}/56480.svg`} alt="" />
        <span>سال ساخت خودرو</span>
      </div>
      <fieldset className="choice-group"><legend>سال ساخت خودرو</legend>{["۱۴۰۲", "۱۴۰۱", "۱۳۹۹", "۱۳۹۷", "۱۳۹۵", ""].map(value => <label key={value} className={year === value ? "selected" : ""}><input type="radio" name="vehicle-year" value={value} checked={year === value} onChange={() => onYear(value)} />{value || "نمی‌دانم"}</label>)}</fieldset>
      <div className="field-label gearbox-label">
        <img src={`${A}/52c22.svg`} alt="" />
        <span>نوع گیربکس</span>
      </div>
      <fieldset className="choice-group"><legend>نوع گیربکس</legend>{["دستی", "اتوماتیک", ""].map(value => <label key={value} className={gearbox === value ? "selected" : ""}><input type="radio" name="vehicle-gearbox" value={value} checked={gearbox === value} onChange={() => onGearbox(value)} />{value || "نمی‌دانم"}</label>)}</fieldset>
      {vehicleConflict(vehicle) && <div className="configuration-warning" role="status"><strong>تیپ و گیربکس نیازمند بررسی</strong><p>{vehicleConflictExplanation}</p><button className="text-action" onClick={() => onVariant("")}>اصلاح تیپ: تیپ را نمی‌دانم</button><button className="text-action" onClick={() => onGearbox("دستی")}>اصلاح گیربکس به دستی</button></div>}
      <p className="sheet-help">برای نمونهٔ دارای تطبیق و نامشخص: ۱۳۹۷ / دستی. برای نمونهٔ نیازمند بررسی: ۱۴۰۱ / اتوماتیک.</p>
      <button className="primary" onClick={onSubmit}>
        {vehicleConflict(vehicle) ? "ادامه با سازگاری نامشخص" : "اعمال مشخصات"}
      </button>
      <button className="skip" onClick={onSkip}>
        ادامه بدون بررسی سازگاری
      </button>
    </section>
  )
}

function LocationPanel({ state, dispatch }: JourneyProps) {
  return (
    <section className="location-panel" dir="rtl">
      {state.locationStep === "method" ? <>
      <p>موقعیت فعلی با یوسف‌آباد شبیه‌سازی می‌شود؛ GPS دریافت نمی‌شود.</p>
      {state.area && <p className="selected-area">محدودهٔ انتخابی: {areaName(state.area)}</p>}
      <button className="primary" onClick={() => dispatch({ type: "area", area: "yousefabad" })}>استفاده از موقعیت فعلی</button>
      <button className="outline" onClick={() => dispatch({ type: "manualLocation" })}>انتخاب شهر یا محله</button>
      <button className="skip" onClick={() => dispatch({ type: "declineLocation" })}>فعلاً نه</button>
      </> : <>
      <button className="text-action" onClick={() => dispatch({ type: "locationBack" })}>بازگشت به روش انتخاب</button>
      <p>محدوده‌های نمونه در تهران</p>
      {areas.map((area) => (
        <button
          key={area.id}
          className={`outline ${state.area === area.id ? "chosen" : ""}`}
          aria-pressed={state.area === area.id}
          onClick={() => dispatch({ type: "area", area: area.id })}
        >
          {area.name}{state.area === area.id ? " ✓" : ""}
        </button>
      ))}
      </>}
    </section>
  )
}

function ProductCard({
  product,

  state,

  onClick,
}: {
  product: Product

  state: Journey

  onClick: () => void
}) {
  const offers = offersFor(
    product,
    effectiveChannel(state) === "all" ? undefined : effectiveChannel(state) as "physical" | "online",
  )

  const cheapest = cheapestOffer(offers)

  const nearest = nearestDistance(product, state.area)

  return (
    <button className="product-card" onClick={onClick} dir="rtl">
      <div className={`product-image ${product.illustrationTone === "blue" ? "illustration-blue" : ""}`}>
        <img src={product.image} alt={product.shortName} />
      </div>
      <div className="product-info">
        <strong>{product.shortName}</strong>
        <small>برند {product.brand}{product.id <= 4 ? " · پژو ۲۰۶ تیپ ۵" : ""}</small>
        <CompatibilityBadge product={product} vehicle={state.vehicle} skipped={state.skipped} />
        <b>{cheapest ? `از ${number(cheapest.price)} تومان` : "قیمت نامشخص"}</b>
        <small className="seller-count">
          در {number(offers.length)} فروشگاه
        </small>
        {state.nearby && state.area && Number.isFinite(nearest) && (
          <span className="distance">
            نزدیک‌ترین: {number(nearest)} کیلومتر (نمایشی)
          </span>
        )}
      </div>
    </button>
  )
}

function ResultsScreen({ state, dispatch }: JourneyProps) {
  return (
    <div className="app">
      <SearchHeader title={state.query} onSearch={query => dispatch({ type: "query", query })} />
      <SearchResults state={state} dispatch={dispatch} renderProduct={product => <ProductCard key={product.id} product={product} state={state} onClick={() => dispatch({ type: "product", productId: product.id })} />} />
      <div className="fixed-filter" dir="rtl">
        <ScopeButton>قیمت⌃</ScopeButton><ScopeButton>انتخاب برند⌃</ScopeButton><ScopeButton>دسته‌بندی⌃</ScopeButton><ScopeButton>خرید قسطی⌃</ScopeButton>
      </div>
      <BottomNav onSearch={() => document.querySelector<HTMLInputElement>("input[aria-label='عبارت جستجو']")?.click()} />
    </div>
  )
}

function ProductScreen({ state, dispatch }: JourneyProps) {
  const product = allProducts.find((product) => product.id === state.productId)!

  const { sellerMode, sellerSort } = state

  const [sortOpen, setSortOpen] = useState(false)

  const [notice, setNotice] = useState("")

  const sellers = sortOffers(product, sellerMode, sellerSort, state.area)

  const cheapest = cheapestOffer(sellers)

  const selectedOffer = useRef<HTMLElement>(null)
  useEffect(() => {
    selectedOffer.current?.scrollIntoView({ block: "center" })
    selectedOffer.current?.focus({ preventScroll: true })
  }, [state.offerId, sellerMode])

  const setSellerMode = (mode: "online" | "physical") =>
    dispatch({ type: "sellerMode", mode })

  function notify(message: string) {
    setNotice(message)

    window.setTimeout(() => setNotice(""), 2200)
  }

  return (
    <div className="app">
      <SearchHeader
        title={state.query}
        onSearch={query => dispatch({ type: "query", query })}
        back={() => dispatch({ type: "back" })}
      />
      <main className="product-scroll" dir="rtl">
        <DemoDisclosure />
        <section className="product-hero">
          <img src={product.image} alt={product.shortName} className={product.illustrationTone === "blue" ? "illustration-blue" : undefined} />
          <h1>
            {product.name}
          </h1>
          <small className="hero-brand">برند {product.brand}</small>
          {product.partNumber && <p className="manufacturer-reference">شماره سازنده: <bdi>{product.partNumber}</bdi> · EAN: <bdi>{product.ean}</bdi><br /><a href={product.technicalReference} target="_blank" rel="noreferrer">مرجع فنی والئو</a> · هویت قطعه؛ تطبیق خودروی انتخابی تأیید نشده است.</p>}
          {product.imageNote && <small className="image-note">{product.imageNote}</small>}
          <div className="hero-compat vehicle-summary-panel">
            <CompatibilityBadge product={product} vehicle={state.vehicle} skipped={state.skipped} />
            <span>
              {vehicleSummary(state.vehicle)}
            </span>
            {vehicleConflict(state.vehicle) && <small>تیپ ۵ و گیربکس اتوماتیک نیازمند بررسی هستند.</small>}
            {!product.partNumber && <button className="text-action" onClick={() => dispatch({ type: "editVehicle" })}>ویرایش مشخصات خودرو</button>}
          </div>
          <div className="hero-actions">
            <ScopeButton label="اعلان قیمت (غیرفعال در نمونه)">
              <img src={`${A}/c780f.svg`} alt="" />
            </ScopeButton>
            <ScopeButton label="علاقه‌مندی (غیرفعال در نمونه)">
              <img src={`${A}/04b64.svg`} alt="" />
            </ScopeButton>
            <ScopeButton label="اشتراک‌گذاری (غیرفعال در نمونه)">
              <img src={`${A}/5bbd5.svg`} alt="" />
            </ScopeButton>
            {!product.partNumber && <button className="specs" onClick={() => dispatch({ type: "editVehicle" })}>مشخصات خودرو</button>}
          </div>
        </section>

        <section className="cheapest">
          <div>
            <small>خرید از {cheapest?.name ?? "فروشگاه نامشخص"}</small>
            <strong>
              {cheapest ? `${number(cheapest.price)} تومان` : "قیمت نامشخص"}
            </strong>
          </div>
          <span>ارزان‌ترین {sellerMode === "physical" ? "حضوری" : "اینترنتی"}</span>
        </section>
        <p className="price-scope">{priceScope(sellerMode)} · تومان</p>

        <div className="seller-tabs">
          <button
            className={sellerMode === "online" ? "active" : ""}
            onClick={() => setSellerMode("online")}
          >
            خرید اینترنتی <i>{number(offersFor(product, "online").length)}</i>
          </button>
          <button
            className={sellerMode === "physical" ? "active" : ""}
            onClick={() => setSellerMode("physical")}
          >
            خرید حضوری <i>{number(offersFor(product, "physical").length)}</i>
          </button>
        </div>

        {sellerMode === "physical" && (
          <div className="area-banner">
            <div>
              <small>محدوده انتخابی:</small>
              <strong>{areaName(state.area)}</strong>
            </div>
            <button onClick={() => dispatch({ type: "requestLocation" })}>
              تغییر محدوده
            </button>
          </div>
        )}

        <div className="seller-control">
          <span>{number(sellers.length)} گزینه مرتبط</span>
          <button onClick={() => setSortOpen(true)}>
            <img src={`${A}/11ced.svg`} alt="" /> {sellerSort}
          </button>
        </div>

        <section className="seller-list">
          {sellers.map((seller) => (
            <article className={`seller-card ${seller.id === state.offerId ? "highlighted-offer" : ""}`} key={seller.id} ref={seller.id === state.offerId ? selectedOffer : undefined} tabIndex={seller.id === state.offerId ? -1 : undefined}>
              {seller.id === state.offerId && <small className="selected-offer-label">پیشنهاد انتخابی از نتایج جستجو</small>}
              <div className="seller-top">
                <div>
                  <strong>{seller.name}</strong>
                  <small>
                    {seller.city}
                    {state.area && sellerMode === "physical"
                      ? ` · ${number(distance(seller, state.area))} کیلومتر (نمایشی)`
                      : ""}
                  </small>
                </div>
                <span>★ {seller.rating} · امتیاز فرضی</span>
              </div>
              {sellerMode === "physical" && <img src={product.image} alt="" />}
              <p>
                {product.name}
              </p>
              <small className="address">{seller.address}</small>
              <div className="open">
                وضعیت فعالیت <span>نامشخص</span>
              </div>
              <CompatibilityBadge product={product} vehicle={state.vehicle} skipped={state.skipped} />
              <b>{number(seller.price)} تومان</b>
              <div className="seller-buttons">
                <button
                  onClick={() =>
                    notify(
                      sellerMode === "physical"
                        ? "اطلاعات تماس واقعی در نمونه نمایشی موجود نیست."
                        : "خرید اینترنتی در نمونه نمایشی فعال نیست.",
                    )
                  }
                >
                  {sellerMode === "physical" ? "اطلاعات تماس" : "خرید اینترنتی"}
                </button>
                {sellerMode === "physical" && (
                  <button
                    onClick={() =>
                      notify(
                        "مسیریابی در نمونه نمایشی فعال نیست؛ فاصله‌ها فرضی هستند.",
                      )
                    }
                  >
                    مسیریابی
                  </button>
                )}
              </div>
            </article>
          ))}
        </section>
      </main>
      <BottomNav onSearch={() => dispatch({ type: "back" })} />
      {notice && <div className="toast" role="status">{notice}</div>}
      {sortOpen && (
        <BottomSheet title="مرتب‌سازی فروشگاه‌ها" onClose={() => setSortOpen(false)}>
            {([
              "پیشنهاد ترب",
              "کمترین قیمت",
              "نزدیک‌ترین فروشگاه",
            ] as SellerSort[]).map((item) => (
              <button
                key={item}
                className={sellerSort === item ? "chosen" : ""}
                disabled={
                  item === "نزدیک‌ترین فروشگاه" &&
                  (!state.area || sellerMode === "online")
                }
                onClick={() => {
                  dispatch({ type: "sellerSort", sort: item })
                  setSortOpen(false)
                }}
              >
                {item}
                {item === "نزدیک‌ترین فروشگاه" &&
                (!state.area || sellerMode === "online")
                  ? " (نیازمند محدوده و خرید حضوری)"
                  : ""}
              </button>
            ))}
        </BottomSheet>
      )}
    </div>
  )
}

export default function App() {
  const [state, dispatch] = useReducer(journeyReducer, initialJourney)

  return <>
    {state.screen === "product" ? <ProductScreen state={state} dispatch={dispatch} /> : <ResultsScreen state={state} dispatch={dispatch} />}
    {state.guidedOpen && <GuidedSearch state={state} dispatch={dispatch} />}
    {state.showCompatibility && <BottomSheet title="مشخصات خودرو" onClose={() => dispatch({ type: "dismissVehicle" })}>
      <VehiclePanel vehicle={state.draftVehicle} onVariant={id => dispatch({ type: "variant", id })} year={state.draftVehicle.year} gearbox={state.draftVehicle.gearbox}
        onYear={value => dispatch({ type: "vehicle", field: "year", value })}
        onGearbox={value => dispatch({ type: "vehicle", field: "gearbox", value })}
        onSubmit={() => dispatch({ type: "submitVehicle" })}
        onSkip={() => dispatch({ type: "skipVehicle" })} />
    </BottomSheet>}
    {state.locationPrompt && <BottomSheet title={state.locationStep === "method" ? "انتخاب محدوده" : "انتخاب شهر یا محله"} onClose={() => dispatch({ type: "declineLocation" })}>
      <LocationPanel state={state} dispatch={dispatch} />
    </BottomSheet>}
  </>
}
