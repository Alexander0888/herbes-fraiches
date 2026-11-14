import { execFileSync } from 'node:child_process';
import { createClient } from '@supabase/supabase-js';

export function localSettings(stack) {
  const args = ['status', '--output-format', 'json'];
  if (stack) args.push('--stack', stack);
  const status = JSON.parse(execFileSync('node_modules/.bin/supabase', args, {
    encoding: 'utf8',
    env: { ...process.env, SUPABASE_TELEMETRY_DISABLED: '1' },
  }));
  const { API_URL: url, PUBLISHABLE_KEY: key, SECRET_KEY: secretKey } = status.env ?? {};
  if (!url || !key || !secretKey || !['127.0.0.1', 'localhost'].includes(new URL(url).hostname)) {
    throw new Error('Start the local Supabase stack first.');
  }
  return { url, key, secretKey };
}

export function sessionlessClient(url, key) {
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export function checked({ data, error }) {
  if (error) throw error;
  return data;
}
