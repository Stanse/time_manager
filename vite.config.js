import { defineConfig } from 'vite';

export default defineConfig({
  // Базовый путь для GitHub Pages
  // Замените 'time_manager' на название вашего репозитория
  base: process.env.NODE_ENV === 'production' ? '/time_manager/' : '/',

  root: '.',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: './index.html'
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
});
