import { useState } from "react"
import BottomSheet from "./BottomSheet"

export const demoDisclosure = {
  title: "نسخه نمایشی",
  paragraphs: [
    "این نمونه برای نمایش تجربهٔ جستجو ساخته شده است. فهرست خودروها، سال‌های پیشنهادی و رکوردهای تطبیق، دادهٔ نمونه‌اند و کاتالوگ معتبر تولید یا تأیید سازگاری واقعی نیستند.",
    "پیشنهادهای فروشگاه، قیمت‌ها، امتیازها و فاصله‌ها ساختگی هستند. موجودی، اعتبار فروشنده، زمان فعالیت، خرید، تماس و مسیریابی واقعی تأیید یا اجرا نمی‌شوند. تعداد پیشنهادها، تعداد واقعی در ترب نیست.",
    "موقعیت فعلی شبیه‌سازی می‌شود و GPS دریافت نمی‌شود. نقشه شماتیک است؛ پین‌ها مختصات واقعی ندارند.",
    "فقط مشخصات هویتی قطعه‌ای که به مرجع سازنده پیوند دارد از همان مرجع نقل شده‌اند. این مرجع، تطبیق با خودروی انتخابی شما را تأیید نمی‌کند. تصاویر طرح‌دار جای‌نگهدارند، نه عکس واقعی محصول.",
  ],
}
export default function DemoDisclosure() {
  const [open, setOpen] = useState(false)
  return <div className="demo-indicator"><button aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(true)}><span aria-hidden="true">ⓘ</span> {demoDisclosure.title}</button>
    {open && <BottomSheet title={demoDisclosure.title} onClose={() => setOpen(false)}><div className="disclosure-copy">{demoDisclosure.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</div><button className="primary" onClick={() => setOpen(false)}>متوجه شدم</button></BottomSheet>}
  </div>
}
