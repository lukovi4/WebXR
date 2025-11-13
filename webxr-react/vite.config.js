import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig({
  base: '/WebXR/',
  plugins: [
    react(),
    basicSsl() // HTTPS для WebXR (нужно для Quest и Vision Pro)
  ],
  server: {
    host: true, // Доступ по локальной сети
    port: 5173
  }
});
