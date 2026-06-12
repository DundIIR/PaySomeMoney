import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(() => ({
  // С кастомным доменом (pay-some-money.ru) сайт живёт на корне.
  // VITE_BASE_PATH задаётся в repository variables на GitHub — если домен
  // отвалится и вернёмся на dundiir.github.io, поставить там /PaySomeMoney/
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [react()],
  server: {
    // На Windows "localhost" резолвится в ::1 и Vite слушает только IPv6 —
    // браузер, идущий по IPv4 (127.0.0.1), получает ERR_CONNECTION_REFUSED
    host: '127.0.0.1',
  },
}))
