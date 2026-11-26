import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// In development the website runs on :5173 and forwards /api/* to the render server on :5174.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:5174', changeOrigin: true },
    },
  },
});
