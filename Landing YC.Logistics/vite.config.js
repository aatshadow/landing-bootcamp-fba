import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// In dev we serve at root (port 5174). In production we deploy under
// /yc-logistics-araminda/ within fbaacademypro.com — set base accordingly.
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? '/yc-logistics-araminda/' : '/',
  server: { port: 5174 },
}))
