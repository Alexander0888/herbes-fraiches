import { planStore } from './planStore.js';

// Each mutation returns just the record it changed, in both storage modes.
export const localWorkspace = {
  load: () => planStore.load(),
  saveTemplate(template) {
    return planStore.saveTemplate(template).templates.find(({ id }) => id === template.id);
  },
  deleteTemplate(template) {
    planStore.deleteTemplate(template.id);
  },
  applyTemplate(template) {
    return planStore.applyTemplate(template).published;
  },
};
