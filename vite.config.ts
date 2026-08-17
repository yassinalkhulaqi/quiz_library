import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Note: No API keys are inlined into the client bundle here.
// Gemini keys are read at runtime from import.meta.env.VITE_GEMINI_API_KEY
// or provided by the user in Settings -> AI Settings (in-memory only).
export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
      '@src': path.resolve(__dirname, 'src'),
    },
  },
});
