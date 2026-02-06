import { useEffect, useState } from 'react'
import { Printer, X, AlertTriangle } from 'lucide-react'

/**
 * Otvara se preko:
 * window.dispatchEvent(new CustomEvent('r1s:confirm-print', {
 *   detail: { title, message, resolve, onConfirm }
 * }))
 *
 * - resolve(true/false) -> preporučeni način (Promise)
 * - onConfirm() -> kompatibilnost (ako si ranije tako radio)
 */
export default function ConfirmPrintHost(){
  const [open, setOpen] = useState(false)
  const [payload, setPayload] = useState(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const onAsk = (ev) => {
      const d = ev?.detail || {}
      setPayload({
        title: d.title || 'Potvrda štampe',
        message: d.message || 'Da li ste sigurni da želite da odštampate račun?',
        resolve: typeof d.resolve === 'function' ? d.resolve : null,
        onConfirm: typeof d.onConfirm === 'function' ? d.onConfirm : null,
      })
      setBusy(false)
      setOpen(true)
    }

    const onKey = (e) => {
      if (!open) return
      if (e.key === 'Escape') {
        e.preventDefault()
        cancel()
      }
    }

    window.addEventListener('r1s:confirm-print', onAsk)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('r1s:confirm-print', onAsk)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  function closeHard(){
    setOpen(false)
    setTimeout(() => setPayload(null), 150)
  }

  function cancel(){
    if (busy) return
    try { payload?.resolve?.(false) } catch {}
    closeHard()
  }

  async function confirm(){
    if (busy) return
    setBusy(true)
    try {
      // 1) Promise način
      if (payload?.resolve) {
        payload.resolve(true)
        closeHard()
        return
      }
      // 2) kompatibilnost
      if (payload?.onConfirm) {
        await payload.onConfirm()
        closeHard()
        return
      }
      closeHard()
    } finally {
      setBusy(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/55 backdrop-blur-[1px]"
        onClick={cancel}
      />

      <div className="relative bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-2xl w-[min(560px,94vw)] overflow-hidden fade-up">
        <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-white/90 dark:bg-neutral-900/90 backdrop-blur">
          <div className="text-lg font-semibold inline-flex items-center gap-2">
            <Printer size={18}/> {payload?.title || 'Potvrda štampe'}
          </div>
          <button
            onClick={cancel}
            className="h-11 px-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 transition active:scale-[0.98] inline-flex items-center justify-center"
            aria-label="Zatvori"
            title="Zatvori"
            disabled={busy}
          >
            <X size={20}/>
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5">
              <AlertTriangle size={18} className="opacity-80" />
            </div>
            <div className="text-sm leading-6 opacity-90">
              {payload?.message || 'Da li ste sigurni da želite da odštampate račun?'}
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-1">
            <button
              onClick={cancel}
              disabled={busy}
              className="px-3 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-800 touch-btn transition"
            >
              Otkaži
            </button>
            <button
              onClick={confirm}
              disabled={busy}
              className="px-3 py-2 rounded-xl bg-brand hover:bg-brand-dark text-white touch-btn transition disabled:opacity-60"
            >
              {busy ? '…' : 'Da, štampaj'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
