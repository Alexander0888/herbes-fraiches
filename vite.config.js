import { defineConfig, searchForWorkspaceRoot } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    fs: {
      allow: [searchForWorkspaceRoot(process.cwd())],
      deny: ['.env', '.env.*', '*.{crt,pem,key}', '**/.git/**', '**/supabase/**', '**/*.local'],
    },
  },
});
