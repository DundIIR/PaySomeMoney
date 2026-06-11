import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // Прод живёт на GitHub Pages в подпапке /PaySomeMoney/, дев — на корне localhost
  base: command === 'build' ? '/PaySomeMoney/' : '/',
  plugins: [react()],
  server: {
    // На Windows "localhost" резолвится в ::1 и Vite слушает только IPv6 —
    // браузер, идущий по IPv4 (127.0.0.1), получает ERR_CONNECTION_REFUSED
    host: '127.0.0.1',
  },
}))
