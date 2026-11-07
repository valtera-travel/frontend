import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Saat backend Spring Boot berjalan di :8080, set VITE_USE_MOCK=false
// dan request /api akan diteruskan ke backend (menghindari masalah CORS saat development).
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: { '/api': { target: 'http://localhost:8080', changeOrigin: true } },
  },
})
