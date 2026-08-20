import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      '/images': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      '/favicon-32x32.png': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      '/favicon-16x16.png': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      '/logo.png': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'framer-motion': ['framer-motion'],
          icons: ['lucide-react'],
          'pdf-vendor': ['jspdf', 'qrcode'],
          'confetti': ['canvas-confetti'],
        },
      },
    },
  },
});
