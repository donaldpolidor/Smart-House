import { defineConfig } from 'vite';

export default defineConfig({
  root: 'src',
  publicDir: 'public',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    sourcemap: true
  },
  server: {
    port: 5173,
    host: true,
    hmr: {
      overlay: false
    }
  },
  optimizeDeps: {
    include: [] // Évite le pré-bundling problématique
  }
});