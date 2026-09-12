import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    // The FastAPI backend, once it exists. Until then the app runs on the
    // seeded workspace in `app/mock.ts`, so the front end never blocks on it.
    proxy: {
      '/api': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/live': { target: 'ws://127.0.0.1:8000', ws: true },
    },
  },
});
