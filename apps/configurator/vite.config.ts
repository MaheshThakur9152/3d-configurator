import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true
  },
  assetsInclude: ['**/*.glb', '**/*.hdr', '**/*.glsl'],
  build: {
    target: 'esnext',
    chunkSizeWarningLimit: 1500
  }
});
