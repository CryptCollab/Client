import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    watch: {},
    outDir: '../Server/public/',
    emptyOutDir: true,
  },
  plugins: [react()],
})
