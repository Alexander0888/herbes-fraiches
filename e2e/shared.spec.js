import { readFileSync } from 'node:fs';
import { parseEnv } from 'node:util';
import { randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { test, expect } from '@playwright/test';
import { createSharedPlanStore } from '../src/features/herbs/data/sharedPlanStore.js';
import { emptySlots } from '../src/features/herbs/data/plans.js';
import { chooseHerb, confirm, filled, openEditor, selectTemplate } from './helpers.js';

const settings = parseEnv(readFileSync('.env.shared.local', 'utf8'));
if (!['localhost', '127.0.0.1', '[::1]'].includes(new URL(settings.VITE_SUPABASE_URL).hostname)) {
  throw new Error('Shared UI checks must never target a hosted database.');
}
const account = JSON.parse(readFileSync('supabase/demo-accounts.local', 'utf8')).find(({ role }) => role === 'manager');

async function login(page) {
  await page.getByRole('button', { name: 'Se connecter', exact: true }).click();
  await page.getByLabel('Adresse e-mail', { exact: true }).fill(account.email);
  await page.getByLabel('Mot de passe', { exact: true }).fill(account.password);
  await page.getByRole('dialog').getByRole('button', { name: 'Se connecter', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Se déconnecter', exact: true })).toBeVisible();
}

async function managerStore() {
  const client = createClient(settings.VITE_SUPABASE_URL, settings.VITE_SUPABASE_PUBLISHABLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } });
  const { error } = await client.auth.signInWithPassword({ email: account.email, password: account.password });
  if (error) throw new Error('Could not sign in with the local demo manager.');
  return createSharedPlanStore(client);
}

test('shared login persists through routes; publication updates a separate public session', async ({ page, browser }) => {
  const store = await managerStore();
  const before = await store.load(true);
  let model = await store.saveTemplate({ id: randomUUID(), name: `UI ${randomUUID()}`, slots: emptySlots(), example: false });
  const visitor = await browser.newContext();
  const publicPage = await visitor.newPage();
  try {
    await publicPage.goto('http://127.0.0.1:5181/#/herbs');
    await expect(publicPage.locator('.stand-heading h2')).toHaveText(before.published.name);
    const beforeLabels = await publicPage.locator('.slot').evaluateAll((slots) => slots.map((slot) => slot.getAttribute('aria-label')));
    await expect(publicPage.getByRole('button', { name: 'Éditeur', exact: true })).toHaveCount(0);
    await page.goto('/');
    await login(page);
    await page.getByRole('link', { name: /Herbes fraîches/ }).click();
    await openEditor(page);
    await selectTemplate(page, model.name);
    await chooseHerb(page, 'Basilic');
    await page.locator('.slot').first().click();
    await page.getByRole('button', { name: 'Enregistrer', exact: true }).click();
    await expect(page.getByText('Modèle enregistré.', { exact: true })).toBeVisible();
    expect(await publicPage.locator('.slot').evaluateAll((slots) => slots.map((slot) => slot.getAttribute('aria-label')))).toEqual(beforeLabels);
    await page.getByRole('button', { name: 'Appliquer au présentoir', exact: true }).click();
    await expect(publicPage.locator('.stand-heading h2')).toHaveText(model.name, { timeout: 15000 });
    await filled(publicPage, 1);
    await page.getByRole('link', { name: 'Accueil', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Se déconnecter', exact: true })).toBeVisible();
    await page.getByRole('link', { name: /Herbes fraîches/ }).click();
    await page.reload();
    await expect(page.getByRole('button', { name: 'Se déconnecter', exact: true })).toBeVisible();
    await filled(page, 1);
    await openEditor(page);
    await selectTemplate(page, model.name);
    await chooseHerb(page, 'Menthe');
    await page.locator('.slot').nth(1).click();
    await page.getByRole('button', { name: 'Se déconnecter', exact: true }).click();
    await confirm(page, 'Annuler');
    await filled(page, 2);
    await page.getByRole('button', { name: 'Se déconnecter', exact: true }).click();
    await confirm(page, 'Abandonner les modifications');
    await expect(page.getByRole('button', { name: 'Se connecter', exact: true })).toBeVisible();
    await filled(page, 1);
    await expect(page.getByRole('button', { name: 'Éditeur', exact: true })).toHaveCount(0);
    // An employee tab returns from the menu to the latest published plan.
    await publicPage.getByRole('link', { name: 'Accueil', exact: true }).click();
    const fresh = (await store.load(true)).templates.find(({ id }) => id === model.id);
    await store.applyTemplate({ ...fresh, name: `${model.name} suivant`, slots: emptySlots() });
    await publicPage.getByRole('link', { name: /Herbes fraîches/ }).click();
    await filled(publicPage, 0);
    await expect(publicPage.locator('.stand-heading h2')).toHaveText(`${model.name} suivant`);
  } finally {
    const current = await store.load(true);
    const source = current.templates.find(({ id }) => id === before.published.templateId) || current.templates[0];
    await store.applyTemplate({ ...source, name: before.published.name, slots: before.published.slots });
    model = current.templates.find(({ id }) => id === model.id);
    if (model) await store.deleteTemplate(model);
    await visitor.close();
  }
});

test('a failed save during navigation keeps the draft and allows retry', async ({ page }) => {
  const store = await managerStore();
  let model = await store.saveTemplate({ id: randomUUID(), name: `UI ${randomUUID()}`, slots: emptySlots(), example: false });
  try {
    await page.goto('/#/herbs');
    await login(page);
    await expect(page.locator('button.slot')).toHaveCount(48);
    await selectTemplate(page, model.name);
    await chooseHerb(page, 'Basilic');
    await page.locator('.slot').first().click();
    let releaseRequest;
    const gate = new Promise((resolve) => { releaseRequest = resolve; });
    await page.route('**/rest/v1/plan_templates?*', async (route) => {
      if (route.request().method() !== 'PATCH') return route.continue();
      await gate;
      await route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ message: 'Test: temporary outage' }) });
    });
    await page.getByRole('button', { name: 'Enregistrer', exact: true }).click();
    await page.getByRole('link', { name: 'Accueil', exact: true }).click();
    await expect(page.getByRole('dialog')).toHaveAccessibleName('Opération en cours');
    releaseRequest();
    await expect(page.getByRole('dialog')).toHaveAccessibleName('Abandonner les modifications ?');
    await confirm(page, 'Annuler');
    await filled(page, 1);
    await expect(page.getByText('Modifications non enregistrées', { exact: true })).toBeVisible();
    await page.unroute('**/rest/v1/plan_templates?*');
    await page.getByRole('button', { name: 'Enregistrer', exact: true }).click();
    await expect(page.getByText('Modèle enregistré.', { exact: true })).toBeVisible();
    await page.getByRole('link', { name: 'Accueil', exact: true }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Les outils du rayon');
  } finally {
    model = (await store.load(true)).templates.find(({ id }) => id === model.id);
    if (model) await store.deleteTemplate(model);
  }
});
