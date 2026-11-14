import { build } from 'vite';

const url = process.env.VITE_SUPABASE_URL?.trim();
const publishableKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();
const endpoint = URL.canParse(url ?? '') ? new URL(url) : null;

if (!endpoint || endpoint.protocol !== 'https:' || endpoint.username || endpoint.password ||
  !/^[a-z0-9-]+\.supabase\.co$/.test(endpoint.hostname) ||
  endpoint.pathname !== '/' || endpoint.search || endpoint.hash ||
  !/^sb_publishable_[A-Za-z0-9_-]+$/.test(publishableKey ?? '')) {
  console.error('Pages requires a hosted Supabase project URL and an sb_publishable_ key.');
  process.exit(1);
}

await build({ base: './', mode: 'pages' });
