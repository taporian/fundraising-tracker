import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // base './' makes all asset paths relative so the built index.html
  // can be loaded directly from disk in OBS Browser Source
  base: './',
  // Exclude heavy ONNX/transformers packages from Vite's pre-bundler so their
  // WebAssembly and dynamic imports work correctly in both dev and build.
  optimizeDeps: {
    exclude: ['@huggingface/transformers', 'kokoro-js'],
  },
})
