import { copyTemplate, initialPlans, makeSnapshot, validSlots } from './plans.js';

const STORAGE_KEY = 'herbes-fraiches:plans';

export function createPlanStore(
  getStorage = () => window.localStorage,
  now = () => new Date().toISOString(),
) {
  function write(state) {
    getStorage().setItem(STORAGE_KEY, JSON.stringify(state));
    return state;
  }

  function load() {
    const saved = getStorage().getItem(STORAGE_KEY);
    if (saved === null) return write(initialPlans(now()));

    const state = JSON.parse(saved);
    if (state?.version !== 1 || !Array.isArray(state.templates) ||
      !state.templates.every((template) => validSlots(template.slots)) ||
      !validSlots(state.published?.slots) || !Number.isFinite(Date.parse(state.published.appliedAt))) {
      throw new Error('Invalid saved plan data');
    }
    return state;
  }

  return {
    load,
    saveTemplate(template) {
      const state = load();
      const templates = [...state.templates];
      const index = templates.findIndex(({ id }) => id === template.id);
      if (index === -1) templates.push(copyTemplate(template));
      else templates[index] = copyTemplate(template);
      return write({ ...state, templates });
    },
    deleteTemplate(id) {
      const state = load();
      return write({ ...state, templates: state.templates.filter((template) => template.id !== id) });
    },
    applyTemplate(template) {
      return write({ ...load(), published: makeSnapshot(template, now()) });
    },
  };
}

export const planStore = createPlanStore();
