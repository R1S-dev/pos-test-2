// src/pages/pos/print.js

/* ===== Helpers (datetime/no) ===== */
function pad2(n){ return String(n).padStart(2,'0') }
export function makePrebillNo(d=new Date(), suffix=''){
  const y = d.getFullYear(), m = pad2(d.getMonth()+1), dd = pad2(d.getDate())
  const hh = pad2(d.getHours()), mm = pad2(d.getMinutes()), ss = pad2(d.getSeconds())
  return `PR-${y}${m}${dd}-${hh}${mm}${ss}${suffix ? '-' + suffix : ''}`
}
export function formatDateTime(d=new Date()){
  return d.toLocaleString('sr-RS')
}

/* === PRINT TEMPLATES (80mm) — centrirano, veliki gornji logo === */
export function buildPrintCSS(){
  const SHIFT_MM = 2; // blagi pomeraj ulevo radi centriranja
  return `
    <style>
      @page { size: 80mm auto; margin: 0; }
      html, body { width: 80mm; margin: 0; padding: 0; background: #fff; color: #000; }
      * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }

      .receipt {
        width: 72mm;
        margin-left: auto; margin-right: auto;
        padding: 8px 6px 14mm 6px;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Courier New", monospace;
        font-size: 12.5px; line-height: 1.28;
        position: relative;
        transform: translateX(-${SHIFT_MM}mm);
      }

      .center { text-align: center; }
      .left { text-align: left; }
      .bold { font-weight: 700; }
      .small { font-size: 11.5px; }
      .mono { font-variant-numeric: tabular-nums; }
      .muted { opacity: .92; }

      .row { display:flex; justify-content:space-between; align-items:flex-start; gap:8px; }
      .hr { border-top:1px dashed #000; margin:8px 0; }
      .divider { text-align:center; font-weight:700; letter-spacing:.5px; margin:6px 0; }

      .name { flex:1; padding-right:6px; word-break: break-word; }
      .unit { min-width: 64px; text-align:right; }
      .sum  { min-width: 64px; text-align:right; }

      .logo-top { display:block; margin:0 auto 4px auto; width: 68mm; height:auto; }

      .thanks { text-align:center; font-weight:700; margin-top:8px; }
      .foot-warn { margin-top: 8px; border-top:1px solid #000; padding-top:6px; text-align:center; font-weight:700; }
      .foot-note { margin-top: 4px; text-align:center; font-size:11px; opacity:.92 }
      .tail { height: 8mm; }

      .qr { display:block; margin:8px auto 0 auto; width: 28mm; height:auto; }
      .qr-url { text-align:center; font-size:11px; word-break:break-all; opacity:.95; margin-top:2px; }
    </style>
  `
}

export function buildReceiptHTML({
  shop,
  meta,
  items=[],
  total=0,
  warning='OVO NIJE FISKALNI RAČUN',
  qrUrl=null
}){
  const css = buildPrintCSS()

  const header = `
    ${shop.logo ? `<img src="${shop.logo}" class="logo-top" alt="logo" />` : ''}
    <div class="center bold">${shop.name}</div>
    ${shop.place ? `<div class="center small">${shop.place}</div>` : ''}
  `

  const metaBlock = `
    <div class="divider">*** ${meta.title} ***</div>
    <div class="row small mono"><div>Datum/čas</div><div>${meta.datetime}</div></div>
    <div class="row small mono"><div>Broj predračuna</div><div>${meta.number}</div></div>
    ${meta.refLeft ? `<div class="row small mono"><div>Ref</div><div>${meta.refLeft}</div></div>` : ''}
  `

  const headCols = `
    <div class="row small mono" style="opacity:.9">
      <div class="name left bold">Artikal</div>
      <div class="unit bold">Kol × Cena</div>
      <div class="sum  bold">Iznos</div>
    </div>
  `
  const lines = items.map(it => {
    const unit = `${it.qty}× ${(it.priceEach || 0).toFixed(2)}`
    const sum = (it.qty * (it.priceEach||0)).toFixed(2)
    return `
      <div class="row mono">
        <div class="name">${it.name || 'Artikal'}</div>
        <div class="unit">${unit}</div>
        <div class="sum">${sum} RSD</div>
      </div>
    `
  }).join('')

  const extras = `
    <div class="hr"></div>
    <div class="row mono"><div>Stavki ukupno</div><div>${items.reduce((s,i)=>s+i.qty,0)}</div></div>
    <div class="row mono"><div>Način plaćanja</div><div>Gotovina</div></div>
    <div class="row mono"><div>Valuta</div><div>RSD</div></div>
    <div class="row mono"><div>Napomena</div><div>Čuvajte ovaj predračun do naplate</div></div>
  `

  const qrBlock = qrUrl ? `
    <img src="/qr_instagram.png" class="qr" alt="QR Instagram" />
    <div class="qr-url small">${qrUrl}</div>
  ` : ''

  // NEMA inline auto-print skripte ovde.
  // Print se okida iz openPrint() nakon što se učitaju slike/fontovi.
  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${(shop?.name||'POS')} — ${meta?.title||'Print'}</title>
        ${css}
      </head>
      <body>
        <div class="receipt">
          ${header}
          <div class="hr"></div>
          ${metaBlock}
          <div class="hr"></div>
          ${headCols}
          ${lines || '<div class="small muted">— Nema stavki —</div>'}
          <div class="hr"></div>
          <div class="row bold mono"><div>UKUPNO</div><div>${total.toFixed(2)} RSD</div></div>
          ${extras}
          <div class="thanks">Hvala na poseti — CaffeClub M</div>
          ${qrBlock}
          <div class="foot-warn small">${warning}</div>
          <div class="foot-note small mono">Štampano: ${formatDateTime(new Date())}</div>
          <div class="tail"></div>
        </div>
      </body>
    </html>
  `
}

/**
 * openPrint(html)
 * - Automatski okida print čim se prozor učita
 * - Sačeka fontove + dekodiranje slika (da ne bude "print failed" / prazno)
 * - Zatvori prozor posle štampe (afterprint) umesto agresivnog timeout-a
 */
export function openPrint(html){
  let w = null
  try { w = window.open('', 'PRINT', 'width=420,height=700') } catch {}

  // Popup blokiran -> fallback na novu karticu sa Blob URL (ne možemo auto-print u tom slučaju pouzdano)
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
      // Sačekaj da DOM bude spreman
      await new Promise(res => {
        if (w.document.readyState === 'complete') return res()
        w.addEventListener('load', () => res(), { once: true })
      })

      // Fontovi (ako browser podržava)
      try { await w.document.fonts?.ready } catch {}

      // Sačekaj dekodiranje slika (logo/qr)
      const imgs = Array.from(w.document.images || [])
      await Promise.all(imgs.map(img => {
        try {
          if (img.complete && img.naturalWidth > 0) return Promise.resolve()
          // decode() radi bolje od onload u mnogim slučajevima
          if (typeof img.decode === 'function') return img.decode()
          return new Promise((res) => { img.onload = () => res(); img.onerror = () => res() })
        } catch {
          return Promise.resolve()
        }
      }))

      // Fokus + print
      try { w.focus() } catch {}
      // afterprint -> close
      const closeLater = () => { try { w.close() } catch {} }
      w.addEventListener('afterprint', closeLater, { once: true })

      // Okini print
      w.print()

      // Fallback close (ako afterprint ne okine)
      setTimeout(closeLater, 1500)
    } catch {
      // Ako nešto pukne, bar otvori prozor sa sadržajem
      try { w.focus() } catch {}
    }
  }

  // Bez await (ne sme blokirati UI), ali sve se dešava odmah.
  run()
}
