import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Sitio de usuario (EX1MA.github.io): se sirve desde la raíz del dominio
  base: '/',
  
  optimizeDeps: {
    include: ['react/jsx-runtime'],
  },
})