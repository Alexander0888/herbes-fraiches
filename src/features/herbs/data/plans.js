import { fr } from '../../../content/fr.js';
import { herbById, herbs } from './herbs.js';

export const COLUMNS = 6;
export const ROWS = 8;
export const SLOT_COUNT = COLUMNS * ROWS;
export const MAX_NAME_LENGTH = 64;

export function emptySlots() {
  return Array(SLOT_COUNT).fill(null);
}

export function copyTemplate(template) {
  return { ...template, slots: [...template.slots] };
}

export function sameTemplate(first, second) {
  return first.name === second.name &&
    first.slots.every((herb, index) => herb === second.slots[index]);
}

export function countSlots(slots) {
  const byHerb = Object.fromEntries(herbs.map(({ id }) => [id, 0]));
  let assigned = 0;

  for (const id of slots) {
    if (!Object.hasOwn(byHerb, id)) continue;
    byHerb[id] += 1;
    assigned += 1;
  }

  return { byHerb, assigned, free: SLOT_COUNT - assigned };
}

// Each line follows one row of the stand, starting at the rear.
const normal = [
  '--- --- --- --- --- ---',
  '--- --- --- --- --- ---',
  'cerfeuil estragon sauge laurier origan thym-citron',
  'romarin thym basilic-thai mix-herbes-grill menthe menthe',
  'basilic basilic basilic coriandre coriandre coriandre',
  'aneth aneth aneth ciboulette ciboulette ciboulette',
  'persil-frise persil-frise persil-frise persil-frise persil-frise persil-frise',
  'persil-plat persil-plat persil-plat persil-plat persil-plat persil-plat',
];

const busy = [
  'cerfeuil estragon sauge sauge laurier laurier',
  'origan origan thym-citron thym-citron basilic-thai basilic-thai',
  'romarin romarin romarin thym thym thym',
  'mix-herbes-grill mix-herbes-grill mix-herbes-grill menthe menthe menthe',
  'basilic basilic basilic coriandre coriandre coriandre',
  'aneth aneth aneth ciboulette ciboulette ciboulette',
  'persil-frise persil-frise persil-frise persil-frise persil-frise persil-frise',
  'persil-plat persil-plat persil-plat persil-plat persil-plat persil-plat',
];

function example(id, name, rows) {
  const slots = rows.flatMap((row) => row.split(' ').map((id) => id === '---' ? null : id));
  return { id, name, slots, example: true };
}

export function makeSnapshot(template, appliedAt) {
  return {
    templateId: template.id,
    name: template.name,
    slots: [...template.slots],
    example: template.example,
    appliedAt,
  };
}

export function initialPlans(appliedAt) {
  const templates = [
    example('normal', fr.initialTemplate, normal),
    example('busy', fr.busyTemplate, busy),
  ];

  return { version: 1, templates, published: makeSnapshot(templates[0], appliedAt) };
}

export function validSlots(slots) {
  return Array.isArray(slots) && slots.length === SLOT_COUNT &&
    slots.every((id) => id === null || Object.hasOwn(herbById, id));
}
