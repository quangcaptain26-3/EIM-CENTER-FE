import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Plugin Tailwind CSS v4 cho Vite
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @/ trỏ vào thư mục src – dùng trong toàn bộ codebase
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (
            id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/') ||
            id.includes('react-router')
          ) {
            return 'vendor-react';
          }
          if (id.includes('@tanstack/react-query') || id.includes('@tanstack/react-table')) {
            return 'vendor-query';
          }
          if (id.includes('@reduxjs/toolkit') || id.includes('react-redux')) {
            return 'vendor-store';
          }
          if (id.includes('react-hook-form') || id.includes('/zod/') || id.includes('@hookform')) {
            return 'vendor-form';
          }
          if (id.includes('recharts')) {
            return 'vendor-charts';
          }
          if (
            id.includes('lucide-react') ||
            id.includes('sonner') ||
            id.includes('clsx') ||
            id.includes('tailwind-merge') ||
            id.includes('dayjs')
          ) {
            return 'vendor-ui';
          }
          if (id.includes('axios')) {
            return 'vendor-http';
          }
          return undefined;
        },
      },
    },
  },
});
