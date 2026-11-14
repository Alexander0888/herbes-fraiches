import { fr } from '../content/fr.js';
import { ChoiceSelect } from './ChoiceSelect.jsx';

export function TemplateSelect({ templates, draft, onSelect }) {
  return (
    <div className="template-select">
      <ChoiceSelect label={fr.template} options={templates} value={draft?.id}
        placeholder={fr.noTemplate} disabled={!draft} onSelect={onSelect} />
    </div>
  );
}
