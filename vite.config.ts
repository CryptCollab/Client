import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill'
import rollupNodePolyFill from 'rollup-plugin-polyfill-node'
// https://vitejs.dev/config/
export default defineConfig({
  build: {
    emptyOutDir: true,
    rollupOptions: {
      plugins: [
        rollupNodePolyFill()
      ]
    }
  },
  plugins: [react()],
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: `globalThis`
      },
      plugins: [
        NodeGlobalsPolyfillPlugin({
          buffer: true,
        }),
        NodeModulesPolyfillPlugin() // this is required for the `crypto` module
      ]
    }
  }
})


