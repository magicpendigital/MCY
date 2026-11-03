import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  root: 'D:/Projects/MCY',
  envDir: 'D:/Projects/MCY/analyse/foundation-series-2026-10-16/empty-env',
  envPrefix: 'MCY_FOUNDATION_PREVIEW_UNUSED_',
  cacheDir: 'D:/Projects/MCY/analyse/foundation-series-2026-10-16/.vite-cache',
  define: {
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(''),
    'import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY': JSON.stringify('')
  },
  plugins: [react()],
  server: { host: '127.0.0.1', port: 4316, strictPort: true, headers: {
    'Content-Security-Policy': "connect-src 'self' ws://127.0.0.1:4316; frame-src 'none'"
  } }
});
