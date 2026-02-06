// src/pages/reports/print.js
export function buildPrintCSS(){
  const SHIFT_MM = 2
  return `
    <style>
      @page { size: 80mm auto; margin: 0; }
      html, body { width: 80mm; margin: 0; padding: 0; background: #fff; color: #000; }
      * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .receipt {
        width: 72mm; margin-left:auto; margin-right:auto; padding: 8px 6px 10mm 6px;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Courier New", monospace;
        font-size: 12.5px; line-height: 1.28;
        transform: translateX(-${SHIFT_MM}mm);
      }
      .center { text-align:center }
      .row { display:flex; justify-content:space-between; gap:8px }
      .hr { border-top:1px dashed #000; margin:8px 0 }
      .small { font-size:15px }
      .bold { font-weight:700 }
      .mono { font-variant-numeric: tabular-nums; }
      .name { flex:1; padding-right:6px }
      .unit { min-width: 64px; text-align:right }
      .amt  { min-width: 64px; text-align:right }
    </style>
  `
}

export function openPrint(html){
  let w = null
  try { w = window.open('', 'PRINT', 'width=420,height=700') } catch {}

  if (!w || w.closed) {
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')
    return
  }

  w.document.open()
  w.document.write(html)
  w.document.close()

  const run = async () => {
    try {
      await new Promise(res => {
        if (w.document.readyState === 'complete') return res()
        w.addEventListener('load', () => res(), { once: true })
      })
      try { await w.document.fonts?.ready } catch {}

      // Reports obično nemaju slike, ali ostavimo robustno:
      const imgs = Array.from(w.document.images || [])
      await Promise.all(imgs.map(img => {
        try {
          if (img.complete && img.naturalWidth > 0) return Promise.resolve()
          if (typeof img.decode === 'function') return img.decode()
          return new Promise((res) => { img.onload = () => res(); img.onerror = () => res() })
        } catch { return Promise.resolve() }
      }))

      try { w.focus() } catch {}
      const closeLater = () => { try { w.close() } catch {} }
      w.addEventListener('afterprint', closeLater, { once: true })

      w.print()
      setTimeout(closeLater, 1500)
    } catch {
      try { w.focus() } catch {}
    }
  }

  run()
}
