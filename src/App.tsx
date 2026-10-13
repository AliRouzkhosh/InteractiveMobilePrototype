import { useState } from "react"

const A = "/assets"

type Screen = "results" | "product"
type Mode = "suggested" | "nearby" | "online"
type SellerMode = "physical" | "online"

type Product = {
  id: number
  name: string
  shortName: string
  image: string
  price: string
  sellers: string
  compatible: boolean
  distance: string
}

const products: Product[] = [
  {
    id: 1,
    name: "کیت کلاچ والئو سبز مناسب پژو ۲۰۶ تیپ ۵",
    shortName: "کیت کلاچ والئو سبز",
    image: `${A}/1ac0c.png`,
    price: "۱۱٬۵۰۰٬۰۰۰",
    sellers: "۲۵",
    compatible: true,
    distance: "۲٫۱",
  },
  {
    id: 2,
    name: "دیسک و صفحه کلاچ پژو ۲۰۶ تیپ ۵ لوک آلمان",
    shortName: "کیت کلاچ لوک آلمان",
    image: `${A}/3192b.png`,
    price: "۱۹٬۴۴۹٬۰۰۰",
    sellers: "۱۶",
    compatible: false,
    distance: "۳٫۴",
  },
  {
    id: 3,
    name: "دیسک و صفحه پژو ۲۰۶ تیپ ۵ گلدن با گارانتی",
    shortName: "کیت کلاچ گلدن",
    image: `${A}/044f1.png`,
    price: "۴٬۶۰۷٬۰۰۰",
    sellers: "۱۲",
    compatible: false,
    distance: "۴٫۸",
  },
  {
    id: 4,
    name: "کیت کلاچ والئو سبز اصلی با بلبرینگ",
    shortName: "کیت کلاچ والئو سبز",
    image: `${A}/1ac0c.png`,
    price: "۱۲٬۲۰۰٬۰۰۰",
    sellers: "۱۸",
    compatible: true,
    distance: "۵٫۲",
  },
]

function Header({ title, back }: { title: string; back?: () => void }) {
  return (
    <header className="app-header" dir="rtl">
      <div className="search-shell">
        <button className="search-button" aria-label="جستجو">
          <img src={`${A}/3d3f2.svg`} alt="" />
        </button>
        <div className="search-title">{title}</div>
        <div className="search-tools">
          <img src={`${A}/4ff7d.svg`} alt="" />
          <span />
          <span className="mic">●</span>
        </div>
      </div>
      {back && (
        <button className="back-button" onClick={back} aria-label="بازگشت">
          ‹
        </button>
      )}
    </header>
  )
}

function BottomNav() {
  const items = [
    ["949d0.svg", "ترب من"],
    ["60053.svg", "پیشنهاد ویژه"],
    ["1dbdd.svg", "دسته‌بندی"],
    ["770d0.svg", "جستجو"],
  ]
  return (
    <nav className="bottom-nav" dir="rtl">
      {items.reverse().map(([icon, label]) => (
        <button key={label}>
          <img src={`${A}/${icon}`} alt="" />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  )
}

function ModeTabs({
  mode,
  onChange,
}: {
  mode: Mode
  onChange: (mode: Mode) => void
}) {
  return (
    <div className="mode-tabs" dir="rtl">
      <button
        className={mode === "suggested" ? "active" : ""}
        onClick={() => onChange("suggested")}
      >
        پیشنهادها
      </button>
      <button
        className={mode === "nearby" ? "active" : ""}
        onClick={() => onChange("nearby")}
      >
        نزدیک من
      </button>
      <button
        className={mode === "online" ? "active" : ""}
        onClick={() => onChange("online")}
      >
        اینترنتی
      </button>
    </div>
  )
}

function VehiclePanel({
  year,
  gearbox,
  onYear,
  onGearbox,
  onSubmit,
  onSkip,
}: {
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
          <small>برای بررسی دقیق‌تر سازگاری قطعات</small>
        </div>
      </div>
      <div className="field-label">
        <img src={`${A}/56480.svg`} alt="" />
        <span>سال ساخت خودرو</span>
      </div>
      <select value={year} onChange={(e) => onYear(e.target.value)}>
        <option>۱۴۰۲</option>
        <option>۱۴۰۱</option>
        <option>۱۳۹۹</option>
        <option>۱۳۹۷</option>
        <option>۱۳۹۵</option>
      </select>
      <div className="field-label gearbox-label">
        <img src={`${A}/52c22.svg`} alt="" />
        <span>نوع گیربکس</span>
      </div>
      <div className="gear-options">
        {["دستی", "اتوماتیک", "نمی‌دانم"].map((item) => (
          <button
            key={item}
            className={gearbox === item ? "selected" : ""}
            onClick={() => onGearbox(item)}
          >
            {item}
          </button>
        ))}
      </div>
      <button className="primary" onClick={onSubmit}>
        نمایش نتایج مرتبط
      </button>
      <button className="skip" onClick={onSkip}>
        مشاهده همه نتایج بدون تکمیل مشخصات
      </button>
    </section>
  )
}

function LocationPanel({
  onSelect,
  onDecline,
}: {
  onSelect: () => void
  onDecline: () => void
}) {
  return (
    <section className="location-panel" dir="rtl">
      <img className="map-image" src={`${A}/c6bea.png`} alt="" />
      <strong>فروشگاه‌های نزدیک شما</strong>
      <p>برای مشاهده فاصله فروشگاه‌ها، موقعیت مکانی خود را مشخص کنید.</p>
      <button className="primary" onClick={onSelect}>
        استفاده از موقعیت فعلی
      </button>
      <button className="outline" onClick={onSelect}>
        انتخاب شهر یا محدوده
      </button>
      <button className="skip" onClick={onDecline}>
        فعلا نه
      </button>
    </section>
  )
}

function ProductCard({
  product,
  nearby,
  onClick,
}: {
  product: Product
  nearby: boolean
  onClick: () => void
}) {
  return (
    <button className="product-card" onClick={onClick} dir="rtl">
      <div className="product-image">
        <img src={product.image} alt={product.shortName} />
      </div>
      <div className="product-info">
        <strong>{product.shortName}</strong>
        <small>مناسب پژو ۲۰۶ تیپ ۵</small>
        <span className={product.compatible ? "compat ok" : "compat unknown"}>
          {product.compatible ? "✓ سازگاری تأیید شده" : "سازگاری نامشخص"}
        </span>
        <b>از {product.price} تومان</b>
        <small className="seller-count">در {product.sellers} فروشگاه</small>
        {nearby && (
          <span className="distance">
            نزدیک‌ترین: {product.distance} کیلومتر
          </span>
        )}
      </div>
    </button>
  )
}

function ResultsScreen({
  onProduct,
}: {
  onProduct: (product: Product, fromNearby: boolean) => void
}) {
  const [year, setYear] = useState("۱۳۹۷")
  const [gearbox, setGearbox] = useState("دستی")
  const [showCompatibility, setShowCompatibility] = useState(true)
  const [mode, setMode] = useState<Mode>("suggested")
  const [locationStage, setLocationStage] =
    useState<"none" | "prompt" | "selected">("none")
  const [sortOpen, setSortOpen] = useState(false)
  const [sort, setSort] = useState("مرتبط‌ترین")

  function changeMode(next: Mode) {
    setMode(next)
    if (next === "nearby" && locationStage === "none") {
      setLocationStage("prompt")
    }
  }

  function selectedLocation() {
    setLocationStage("selected")
    setMode("nearby")
  }

  return (
    <div className="app">
      <Header title="دیسک و صفحه ۲۰۶ تیپ ۵" />
      <main className="results-scroll">
        <section className="vehicle-context" dir="rtl">
          <div>
            <strong>دیسک و صفحه برای پژو ۲۰۶ تیپ ۵</strong>
            <span>
              پژو ۲۰۶ · تیپ ۵ · ساخت {year} · {gearbox}
            </span>
          </div>
          <button onClick={() => setShowCompatibility(true)}>ویرایش</button>
        </section>

        {showCompatibility && (
          <VehiclePanel
            year={year}
            gearbox={gearbox}
            onYear={setYear}
            onGearbox={setGearbox}
            onSubmit={() => setShowCompatibility(false)}
            onSkip={() => {
              setGearbox("نمی‌دانم")
              setShowCompatibility(false)
            }}
          />
        )}

        <div className="sticky-controls">
          <ModeTabs mode={mode} onChange={changeMode} />
          {locationStage === "selected" && (
            <div className="selected-area" dir="rtl">
              <div>
                <small>محدوده انتخابی:</small>
                <strong>تهران، یوسف‌آباد</strong>
              </div>
              <button onClick={() => setLocationStage("prompt")}>
                انتخاب یا تغییر محدوده
              </button>
            </div>
          )}
          <div className="result-control" dir="rtl">
            <span>۱۲ گزینه مرتبط</span>
            <button onClick={() => setSortOpen(true)}>
              <img src={`${A}/11ced.svg`} alt="" />
              {sort}
            </button>
          </div>
        </div>

        {mode === "nearby" && locationStage === "prompt" ? (
          <LocationPanel
            onSelect={selectedLocation}
            onDecline={() => {
              setLocationStage("none")
              setMode("suggested")
            }}
          />
        ) : (
          <section className="product-grid">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                nearby={mode === "nearby" && locationStage === "selected"}
                onClick={() =>
                  onProduct(
                    product,
                    mode === "nearby" && locationStage === "selected",
                  )
                }
              />
            ))}
          </section>
        )}
      </main>
      <div className="fixed-filter" dir="rtl">
        <button>قیمت⌃</button>
        <button>انتخاب برند⌃</button>
        <button>دسته‌بندی⌃</button>
        <button>خرید قسطی⌃</button>
      </div>
      <BottomNav />
      {sortOpen && (
        <div className="modal-backdrop" onClick={() => setSortOpen(false)}>
          <div className="sheet" dir="rtl" onClick={(e) => e.stopPropagation()}>
            <h3>مرتب‌سازی</h3>
            {["مرتبط‌ترین", "کمترین قیمت", "بیشترین قیمت", "نزدیک‌ترین"].map(
              (item) => (
                <button
                  key={item}
                  className={sort === item ? "chosen" : ""}
                  onClick={() => {
                    setSort(item)
                    setSortOpen(false)
                  }}
                >
                  {item}
                </button>
              ),
            )}
          </div>
        </div>
      )}
    </div>
  )
}

const physicalSellers = [
  {
    name: "تنظیم موتور محسن",
    place: "تهران · ۲٫۱ کیلومتر",
    address: "خیابان پیروزی، خیابان شکوفه",
    price: "۱۹٬۴۴۹٬۰۰۰",
  },
  {
    name: "ثریاکو",
    place: "تهران · ۳٫۴ کیلومتر",
    address: "خیابان سعدی شمالی، بن‌بست بهار",
    price: "۲۰٬۰۰۰٬۰۰۰",
  },
]

const onlineSellers = [
  {
    name: "کاپوت بالا",
    place: "تهران",
    address: "ارسال فوری به سراسر کشور",
    price: "۴٬۶۰۷٬۰۰۰",
  },
  {
    name: "ایمنی یدک",
    place: "تبریز",
    address: "گارانتی اصالت و سلامت کالا",
    price: "۵٬۳۰۶٬۰۰۰",
  },
  {
    name: "برترین یدکی سال",
    place: "مشهد",
    address: "ارسال رایگان برای خرید بالای ۵ میلیون",
    price: "۵٬۷۸۰٬۰۰۰",
  },
]

function ProductScreen({
  product,
  fromNearby,
  onBack,
}: {
  product: Product
  fromNearby: boolean
  onBack: () => void
}) {
  const [sellerMode, setSellerMode] = useState<SellerMode>(
    fromNearby ? "physical" : "online",
  )
  const [sortOpen, setSortOpen] = useState(false)
  const [notice, setNotice] = useState("")
  const sellers = sellerMode === "physical" ? physicalSellers : onlineSellers

  function notify(message: string) {
    setNotice(message)
    window.setTimeout(() => setNotice(""), 2200)
  }

  return (
    <div className="app">
      <Header title={product.shortName} back={onBack} />
      <main className="product-scroll" dir="rtl">
        <section className="product-hero">
          <img src={product.image} alt={product.shortName} />
          <div className="dots">•••</div>
          <h1>{product.name}</h1>
          <div
            className={
              product.compatible ? "hero-compat ok" : "hero-compat unknown"
            }
          >
            <strong>
              {product.compatible
                ? "✓ سازگاری تأیید شده"
                : "سازگاری نیازمند بررسی"}
            </strong>
            <span>پژو ۲۰۶ · تیپ ۵ · ساخت ۱۳۹۷ · دستی</span>
          </div>
          <div className="hero-actions">
            <button>
              <img src={`${A}/c780f.svg`} alt="" />
            </button>
            <button>
              <img src={`${A}/04b64.svg`} alt="" />
            </button>
            <button>
              <img src={`${A}/5bbd5.svg`} alt="" />
            </button>
            <button className="specs">مشخصات</button>
          </div>
        </section>

        <section className="cheapest">
          <div>
            <small>
              خرید از{" "}
              {sellerMode === "physical" ? "فروشگاه نزدیک" : "کاپوت بالا"}
            </small>
            <strong>{product.price} تومان</strong>
          </div>
          <span>ارزان‌ترین</span>
        </section>

        <div className="seller-tabs">
          <button
            className={sellerMode === "online" ? "active" : ""}
            onClick={() => setSellerMode("online")}
          >
            خرید اینترنتی <i>{product.sellers}</i>
          </button>
          <button
            className={sellerMode === "physical" ? "active" : ""}
            onClick={() => setSellerMode("physical")}
          >
            خرید حضوری <i>۲</i>
          </button>
        </div>

        {sellerMode === "physical" && (
          <div className="area-banner">
            <div>
              <small>محدوده انتخابی:</small>
              <strong>{fromNearby ? "تهران، یوسف‌آباد" : "تهران"}</strong>
            </div>
            <button
              onClick={() => notify("محدوده روی تهران، یوسف‌آباد تنظیم شد")}
            >
              تغییر محدوده
            </button>
          </div>
        )}

        <div className="seller-control">
          <span>{sellers.length} گزینه مرتبط</span>
          <button onClick={() => setSortOpen(true)}>
            <img src={`${A}/11ced.svg`} alt="" /> مرتب‌سازی
          </button>
        </div>

        <section className="seller-list">
          {sellers.map((seller, index) => (
            <article className="seller-card" key={seller.name}>
              <div className="seller-top">
                <div>
                  <strong>{seller.name}</strong>
                  <small>{seller.place}</small>
                </div>
                <span>★ {index ? "۴٫۹" : "۵"} در ترب</span>
              </div>
              {sellerMode === "physical" && <img src={product.image} alt="" />}
              <p>{product.name}</p>
              <small className="address">{seller.address}</small>
              <div className="open">
                باز <span>(تا ۲۳:۵۹)</span>
              </div>
              <b>{seller.price} تومان</b>
              <div className="seller-buttons">
                <button
                  onClick={() => notify(`تماس با ${seller.name}: ۰۲۱-۸۸۷۷۴۴۲۱`)}
                >
                  {sellerMode === "physical" ? "اطلاعات تماس" : "خرید اینترنتی"}
                </button>
                {sellerMode === "physical" && (
                  <button
                    onClick={() => notify(`مسیریابی تا ${seller.name} آغاز شد`)}
                  >
                    مسیریابی
                  </button>
                )}
              </div>
            </article>
          ))}
        </section>
      </main>
      <BottomNav />
      {notice && <div className="toast">{notice}</div>}
      {sortOpen && (
        <div className="modal-backdrop" onClick={() => setSortOpen(false)}>
          <div className="sheet" dir="rtl" onClick={(e) => e.stopPropagation()}>
            <h3>مرتب‌سازی فروشگاه‌ها</h3>
            {["پیشنهاد ترب", "کمترین قیمت", "نزدیک‌ترین فروشگاه"].map((item) => (
              <button key={item} onClick={() => setSortOpen(false)}>
                {item}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("results")
  const [selectedProduct, setSelectedProduct] = useState(products[0])
  const [fromNearby, setFromNearby] = useState(false)

  if (screen === "product") {
    return (
      <ProductScreen
        product={selectedProduct}
        fromNearby={fromNearby}
        onBack={() => setScreen("results")}
      />
    )
  }

  return (
    <ResultsScreen
      onProduct={(product, nearby) => {
        setSelectedProduct(product)
        setFromNearby(nearby)
        setScreen("product")
      }}
    />
  )
}
