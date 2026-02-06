import { useEffect } from 'react'

export default function ConfirmPrintModal({
  open,
  title = 'Potvrda štampe',
  message = 'Da li ste sigurni da želite da štampate račun?',
  confirmText = 'Štampaj',
  cancelText = 'Otkaži',
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onCancel?.()
      if (e.key === 'Enter') onConfirm?.()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onCancel, onConfirm])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel?.() }}
    >
      <div className="absolute inset-0 bg-black/55 backdrop-blur-[1px]" />
      <div className="relative w-[min(520px,92vw)] rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden fade-up">
        <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
          <div className="text-lg font-semibold">{title}</div>
        </div>

        <div className="px-4 py-4 text-sm opacity-90">
          {message}
        </div>

        <div className="px-4 py-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-3 py-2 rounded-xl bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-700 dark:hover:bg-neutral-600 border border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 touch-btn"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-3 py-2 rounded-xl bg-brand hover:bg-brand-dark text-white touch-btn"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
