import { randomBytes } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { initialPlans } from '../src/data/plans.js';
import { createSharedPlanStore } from '../src/data/sharedPlanStore.js';
import { checked, localSettings, sessionlessClient } from './localSupabase.js';

const { url, key, secretKey } = localSettings(process.argv[2]);
const admin = sessionlessClient(url, secretKey);
const credentialFile = 'supabase/demo-accounts.local';

if (!existsSync(credentialFile)) {
  const accounts = ['manager', 'employee'].map((role) => ({
    role,
    email: `${role}@herbes.example.com`,
    password: randomBytes(18).toString('base64url'),
  }));
  writeFileSync(credentialFile, JSON.stringify(accounts, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
}

const accounts = JSON.parse(readFileSync(credentialFile, 'utf8'));
const manager = sessionlessClient(url, key);

for (const { role, email, password } of accounts) {
  const client = role === 'manager' ? manager : sessionlessClient(url, key);
  let { data, error } = await client.auth.signInWithPassword({ email, password });

  if (error?.code === 'invalid_credentials') {
    checked(await admin.auth.admin.createUser({ email, password, email_confirm: true }));
    ({ data, error } = await client.auth.signInWithPassword({ email, password }));
  }

  const { user } = checked({ data, error });
  checked(await admin.from('rayon_members').upsert({ user_id: user.id, role }));
}

const store = createSharedPlanStore(manager);
const state = await store.load(true);

if (!state.templates.length && !state.published) {
  const { templates } = initialPlans(new Date().toISOString());
  let first;
  for (const model of templates) {
    const saved = await store.saveTemplate(model);
    first ??= saved;
  }
  await store.applyTemplate(first);
}

writeFileSync('.env.shared.local', `VITE_SUPABASE_URL=${url}\nVITE_SUPABASE_PUBLISHABLE_KEY=${key}\n`, { mode: 0o600 });
console.log('Local accounts are ready in supabase/demo-accounts.local.');
console.log('Run npm run dev:shared and open http://localhost:5174/.');
