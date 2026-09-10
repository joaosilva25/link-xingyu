import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api': 'http://localhost:3001',
      '/top-banner.json': 'http://localhost:3001',
      '/trend-banner.json': 'http://localhost:3001',
      // CORP same-origin no domínio das consultoras bloqueia o embed direto
      '/xingyu-consultoras': {
        target: 'https://consultoras.xingyujewelry.com.br',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/xingyu-consultoras/, ''),
      },
    },
  },
});
