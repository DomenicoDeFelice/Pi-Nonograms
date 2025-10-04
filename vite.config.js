import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  publicDir: 'themes',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: 'index.html'
      }
    }
  }
});
