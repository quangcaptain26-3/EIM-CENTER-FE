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
});
