import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  plugins: [react()],
  // API keys removidas - ahora se manejan en Netlify Functions (servidor)
  // Esto previene que las keys queden expuestas en el código del navegador
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    }
  }
});
