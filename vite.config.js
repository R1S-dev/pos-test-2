import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  // ✅ KLJUČNO: dedupe da Vite ne povuče dve kopije React-a
  resolve: {
    dedupe: ['react', 'react-dom'],
  },

  // ✅ Pomaže kod nekih kombinacija deps (zustand + react)
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },

  // za Vercel držimo root. Nemoj stavljati `base` na podputanju.
  build: { outDir: 'dist' }
})
