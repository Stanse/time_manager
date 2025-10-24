import { defineConfig } from 'vite';

export default defineConfig(({ command }) => {
  const base = command === 'build' ? '/time_manager/' : '/';

  return {
    base,
    root: '.',
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      rollupOptions: {
        input: {
          main: './index.html',
          tracker: './index_tracker.html'
        }
      }
    },
    server: {
      port: 3000,
      open: true
    }
  };
});
