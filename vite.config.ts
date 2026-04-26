import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Use VITE_BASE_PATH env var injected by GitHub Actions configure-pages,
  // falling back to /hawkins/ for local preview of production build.
  base: process.env.VITE_BASE_PATH ?? '/hawkins/',
})
