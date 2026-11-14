import assert from 'node:assert/strict';
import test from 'node:test';
import { createPlanStore } from '../src/data/planStore.js';
import { copyTemplate, countSlots, emptySlots, sameTemplate, validSlots } from '../src/data/plans.js';

function memoryStorage() {
  const entries = new Map();
  return {
    getItem: (key) => entries.get(key) ?? null,
    setItem: (key, value) => entries.set(key, value),
  };
}

test('default templates contain 36 and 48 herbs in the intended rows', () => {
  const store = createPlanStore(() => memoryStorage());
  const { templates } = store.load();
  assert.equal(templates.length, 2);
  for (const template of templates) {
    assert.equal(template.slots.length, 48);
    assert.equal(validSlots(template.slots), true);
    assert.equal(template.example, true);
  }
  assert.deepEqual(templates.map((template) => countSlots(template.slots).assigned), [36, 48]);
  for (const { slots } of templates) {
    assert.deepEqual(slots.slice(-24), [
      'basilic', 'basilic', 'basilic', 'coriandre', 'coriandre', 'coriandre',
      'aneth', 'aneth', 'aneth', 'ciboulette', 'ciboulette', 'ciboulette',
      ...Array(6).fill('persil-frise'),
      ...Array(6).fill('persil-plat'),
    ]);
    assert.equal(Math.min(...Object.values(countSlots(slots).byHerb)), 1);
  }
  assert.equal(countSlots(emptySlots()).free, 48);
});

test('a copied template can be edited and saved without changing its source', () => {
  const storage = memoryStorage();
  const store = createPlanStore(() => storage);
  const original = store.load().templates[0];
  const copy = copyTemplate(original);
  copy.id = 'copy';
  copy.name = 'Copie';
  copy.slots[0] = 'basilic';
  store.saveTemplate(copy);
  const [reloadedOriginal, , reloadedCopy] = createPlanStore(() => storage).load().templates;
  assert.deepEqual(reloadedOriginal, original);
  assert.deepEqual(reloadedCopy, copy);
  assert.equal(sameTemplate(original, copy), false);
});

test('new herbs can be counted, saved and published', () => {
  const storage = memoryStorage();
  const store = createPlanStore(() => storage);
  const { templates } = store.load();
  const draft = copyTemplate(templates[0]);
  const additions = [
    'basilic-thai', 'cerfeuil', 'estragon', 'laurier',
    'mix-herbes-grill', 'origan', 'sauge', 'thym-citron',
  ];
  draft.slots = emptySlots();
  draft.slots.splice(0, additions.length, ...additions);

  store.saveTemplate(draft);
  store.applyTemplate(draft);
  const reloaded = createPlanStore(() => storage).load();
  assert.deepEqual(reloaded.templates[0].slots, draft.slots);
  assert.deepEqual(reloaded.published.slots, draft.slots);
  for (const id of additions) {
    assert.equal(countSlots(reloaded.published.slots).byHerb[id], 1);
  }
});

test('the published snapshot survives edits, deletion and a reload', () => {
  const storage = memoryStorage();
  let now = '2025-08-08T10:00:00.000Z';
  const store = createPlanStore(() => storage, () => now);
  const initial = store.load();
  const draft = copyTemplate(initial.templates[0]);
  draft.name = 'Matin';
  draft.slots[0] = null;
  store.saveTemplate(draft);
  assert.deepEqual(store.load().published, initial.published);
  now = '2025-08-09T10:00:00.000Z';
  assert.equal(store.applyTemplate(draft).published.appliedAt, now);
  draft.name = 'Après-midi';
  draft.slots[0] = 'menthe';
  store.saveTemplate(draft);
  store.deleteTemplate(draft.id);
  const reloaded = createPlanStore(() => storage).load();
  assert.equal(reloaded.published.name, 'Matin');
  assert.equal(reloaded.published.slots[0], null);
  assert.equal(reloaded.published.appliedAt, now);
  assert.equal(reloaded.templates.some(({ id }) => id === draft.id), false);
});
