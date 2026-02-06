// Jednostavan “promise modal” helper.
// Koristi se tako što App renderuje <ConfirmPrintHost /> jednom.

import { create } from 'zustand'

export const useConfirmPrint = create((set) => ({
  state: { open: false, opts: null, resolve: null },

  ask: (opts) => new Promise((resolve) => {
    set({ state: { open: true, opts, resolve } })
  }),

  close: (result) => set((s) => {
    const r = s.state.resolve
    try { r?.(result) } catch {}
    return { state: { open: false, opts: null, resolve: null } }
  }),
}))
