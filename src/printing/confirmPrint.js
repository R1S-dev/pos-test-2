// src/printing/confirmPrint.js
export function confirmPrint({
  title = 'Potvrda štampe',
  message = 'Da li ste sigurni da želite da odštampate račun?'
} = {}) {
  return new Promise((resolve) => {
    window.dispatchEvent(new CustomEvent('r1s:confirm-print', {
      detail: { title, message, resolve }
    }))
  })
}
