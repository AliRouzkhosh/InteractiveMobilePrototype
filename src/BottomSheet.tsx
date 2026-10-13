import { useEffect, useId, useRef, type ReactNode } from "react"

type Props = {
  title: string
  children: ReactNode
  onClose: () => void
}

export default function BottomSheet({ title, children, onClose }: Props) {
  const dialog = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  useEffect(() => {
    const element = dialog.current!
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null
    element.showModal()
    return () => {
      element.close()
      queueMicrotask(() => {
        if (document.querySelector("dialog[open]")) return
        if (trigger?.isConnected) trigger.focus()
        else document.querySelector<HTMLInputElement>(".app-header input")?.focus()
      })
    }
  }, [])
  useEffect(() => {
    const element = dialog.current
    if (element?.open && !element.contains(document.activeElement)) {
      element.querySelector<HTMLElement>("[autofocus], .sheet-close")?.focus()
    }
  }, [title, children])
  return (
    <dialog ref={dialog} className="sheet-dialog" aria-labelledby={titleId}
      onKeyDown={event => {
        if (event.key !== "Tab") return
        const controls = [...event.currentTarget.querySelectorAll<HTMLElement>("button:not(:disabled), input:not(:disabled), [tabindex='0']")]
        const first = controls[0]
        const last = controls[controls.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last?.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first?.focus()
        }
      }}
      onCancel={event => { event.preventDefault(); onClose() }}
      onClick={event => { if (event.target === event.currentTarget) onClose() }}>
      <div className="sheet mobile-sheet" dir="rtl">
        <div className="sheet-heading">
          <h2 id={titleId}>{title}</h2>
          <button type="button" className="sheet-close" aria-label={`بستن ${title}`} onClick={onClose}>×</button>
        </div>
        {children}
      </div>
    </dialog>
  )
}
