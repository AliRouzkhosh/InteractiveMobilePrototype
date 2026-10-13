import { useEffect, useState, type Dispatch } from "react"
import BottomSheet from "./BottomSheet"
import { vehicleCatalog } from "./vehicleCatalog"
import { partTypes, guidedValid, guidedVehicle, normalizedYear } from "./guided"
import { number, vehicleConflict, vehicleConflictExplanation, type Journey, type JourneyAction } from "./demo"

const steps = ["برند خودرو", "مدل و تیپ خودرو", "سال ساخت", "نوع گیربکس", "نوع قطعه"]
export default function GuidedSearch({ state, dispatch }: { state: Journey; dispatch: Dispatch<JourneyAction> }) {
  const draft = state.guidedDraft
  const step = state.guidedStep
  const brand = vehicleCatalog.find(brand => brand.id === draft.brandId)
  const model = brand?.models.find(model => model.id === draft.modelId)
  const examples = model?.illustrativeYears ?? []
  const [otherYear, setOtherYear] = useState(!!draft.year && !examples.includes(normalizedYear(draft.year)))
  useEffect(() => setOtherYear(!!draft.year && !examples.includes(normalizedYear(draft.year))), [draft.modelId])
  const valid = guidedValid(draft)
  const conflict = vehicleConflict(guidedVehicle(draft))
  const field = (["brandId", "modelId", "year", "gearbox", "partType"] as const)[step]
  const choices = step === 0 ? vehicleCatalog.map(brand => [brand.id, brand.name]) : step === 1 ? (brand?.models ?? []).map(model => [model.id, model.name]) : step === 2 ? examples.map(year => [year, year]) : step === 3 ? [["دستی", "دستی"], ["اتوماتیک", "اتوماتیک"]] : partTypes.filter(part => part.id !== "unknown").map(part => [part.id, part.label])
  const unknown = step === 4 ? "unknown" : ""
  const setField = (value: string) => dispatch({ type: "guidedField", field, value })
  return <BottomSheet title="راهنمای انتخاب کلاچ" onClose={() => dispatch({ type: "dismissGuided" })}>
    <p className="sheet-help wizard-progress" aria-live="polite">گام {number(step + 1)} از ۵ · {steps[step]}</p>
    {step > 0 && <p className="wizard-context">{brand?.name ?? "برند نامشخص"} · {model?.name ?? "مدل نامشخص"}{step > 2 && ` · ${normalizedYear(draft.year) || "سال نامشخص"}`}</p>}
    <fieldset className="choice-group wizard-choices"><legend>{steps[step]}</legend>
      {choices.map(([value, label]) => <label key={value} className={draft[field] === value && !(step === 2 && otherYear) ? "selected" : ""}><input type="radio" name={`guided-${field}`} checked={draft[field] === value && !(step === 2 && otherYear)} onChange={() => { if (step === 2) setOtherYear(false); setField(value) }} />{label}</label>)}
      {step === 2 && <label className={otherYear ? "selected" : ""}><input type="radio" name="guided-year" checked={otherYear} onChange={() => { setOtherYear(true); setField("") }} />سال دیگر</label>}
      <label className={draft[field] === unknown && !(step === 2 && otherYear) ? "selected" : ""}><input type="radio" name={`guided-${field}`} checked={draft[field] === unknown && !(step === 2 && otherYear)} onChange={() => { if (step === 2) setOtherYear(false); setField(unknown) }} />{step === 4 ? "هنوز نمی‌دانم" : "نمی‌دانم"}</label>
    </fieldset>
    {step === 1 && !brand && <p className="sheet-help">برای انتخاب مدل به گام برند برگردید، یا با مدل نامشخص ادامه دهید.</p>}
    {step === 2 && <><p className="sheet-help">این سال‌ها فقط انتخاب‌های نمایشی‌اند؛ اعتبار سال تولید را تأیید نمی‌کنند.</p>{otherYear && <label className="wizard-year">سال ساخت (اختیاری)<input autoFocus aria-label="سال ساخت (اختیاری)" inputMode="numeric" maxLength={4} value={draft.year} onChange={event => setField(normalizedYear(event.target.value))} placeholder="مثلاً ۱۳۹۷" aria-invalid={!!draft.year && !valid} aria-describedby={draft.year && !valid ? "year-error" : undefined} /></label>}{draft.year && !valid && <p id="year-error" role="alert" className="sheet-help">سال باید چهار رقم باشد، یا خالی بماند.</p>}</>}
    {conflict && step >= 3 && <div className="configuration-warning" role="status"><p>{vehicleConflictExplanation}</p><button className="text-action" onClick={() => dispatch({ type: "guidedField", field: "gearbox", value: "دستی" })}>اصلاح گیربکس به دستی</button><button className="text-action" onClick={() => dispatch({ type: "guidedStep", step: 1 })}>ویرایش مدل و تیپ</button></div>}
    {step === 4 && draft.gearbox === "اتوماتیک" && <p className="sheet-help">برای گیربکس اتوماتیک، کیت دستی بدون رکورد صریح تطبیق تأیید نمی‌شود.</p>}
    <div className="wizard-actions"><button className="primary" disabled={!valid} onClick={() => step === 4 ? dispatch({ type: "applyGuided" }) : dispatch({ type: "guidedStep", step: step + 1 })}>{step === 4 ? "نمایش گزینه‌ها با این مشخصات" : "ادامه"}</button>
      {step > 0 && <button className="outline" onClick={() => dispatch({ type: "guidedStep", step: step - 1 })}>گام قبل</button>}
      <button className="skip" onClick={() => { setField(unknown); dispatch({ type: "guidedStep", step: Math.min(4, step + 1) }); if (step === 4) dispatch({ type: "applyGuided" }) }}>{step === 4 ? "نمایش همه نوع‌های قطعه" : "این مورد را نمی‌دانم"}</button>
    </div>
  </BottomSheet>
}
