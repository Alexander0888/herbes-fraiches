import { readFileSync } from 'node:fs';
import { parseEnv } from 'node:util';
import { defineConfig, devices } from '@playwright/test';

const shared = process.env.HERBES_E2E_SHARED === '1';
const settings = shared ? parseEnv(readFileSync('.env.shared.local', 'utf8')) : {};
if (shared && !['localhost', '127.0.0.1', '[::1]'].includes(new URL(settings.VITE_SUPABASE_URL).hostname)) {
  throw new Error('Browser tests may use only a local Supabase instance.');
}

export default defineConfig({
  testDir: './e2e',
  testMatch: shared ? 'shared.spec.js' : 'workspace.spec.js',
  fullyParallel: !shared,
  workers: shared ? 1 : 2,
  timeout: 30_000,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:5181',
    trace: 'off',
    screenshot: 'off',
  },
  projects: shared ? [
    { name: 'shared-chromium', use: { browserName: 'chromium', viewport: { width: 1440, height: 1000 } } },
  ] : [
    { name: 'desktop', use: { browserName: 'chromium', viewport: { width: 1440, height: 1000 } } },
    { name: 'phone', use: { ...devices['iPhone 13'], defaultBrowserType: 'webkit' } },
    { name: 'ipad-mini', use: { browserName: 'webkit', viewport: { width: 768, height: 1024 }, isMobile: true, hasTouch: true } },
    { name: 'tablet-large', use: { browserName: 'chromium', viewport: { width: 1024, height: 1366 }, hasTouch: true } },
  ],
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 5181 --strictPort --mode e2e',
    url: 'http://127.0.0.1:5181',
    reuseExistingServer: false,
    env: {
      VITE_SUPABASE_URL: settings.VITE_SUPABASE_URL || '',
      VITE_SUPABASE_PUBLISHABLE_KEY: settings.VITE_SUPABASE_PUBLISHABLE_KEY || '',
    },
  },
});
