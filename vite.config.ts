import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'
// https://vitejs.dev/config/
export default defineConfig({
  build: {
    watch: {},
    outDir: '../Server/public/',
    emptyOutDir: true,
  },
  plugins: [react()],
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: `window`
      },
      plugins: [
        NodeGlobalsPolyfillPlugin({
          buffer: true,
        })
      ]
    }
  }
})


