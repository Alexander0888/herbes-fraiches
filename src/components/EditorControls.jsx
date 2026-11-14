import { useEffect, useRef } from 'react';
import { Check, ChevronDown, Copy, Eraser, Pencil, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { fr } from '../content/fr.js';
import { herbStyle, herbs } from '../data/herbs.js';
import { ChoiceSelect } from './ChoiceSelect.jsx';
import { TemplateSelect } from './TemplateSelect.jsx';

export function TemplateBar({ templates, draft, dirty, onSelect, onAction }) {
  const menu = useRef(null);

  useEffect(() => {
    function closeOutside(event) {
      if (!menu.current?.contains(event.target)) menu.current?.removeAttribute('open');
    }

    document.addEventListener('pointerdown', closeOutside);
    return () => document.removeEventListener('pointerdown', closeOutside);
  }, []);

  function closeMenu() {
    if (!menu.current?.open) return;
    menu.current.open = false;
    menu.current.querySelector('summary').focus();
  }

  const actions = [
    { id: 'create', label: fr.newTemplate, Icon: Plus },
    { id: 'rename', label: fr.rename, Icon: Pencil },
    { id: 'duplicate', label: fr.duplicate, Icon: Copy },
    { id: 'delete', label: fr.delete, Icon: Trash2, danger: true },
  ].map(({ id, label, Icon, danger }) => (
    <button className={danger ? 'button danger-outline' : 'button'} key={id} type="button"
      disabled={id !== 'create' && !draft} onClick={() => {
        closeMenu();
        onAction(id);
      }}><Icon aria-hidden="true" />{label}</button>
  ));

  return (
    <section className="card template-bar" aria-label={fr.template}>
      <div className="template-fields">
        <TemplateSelect templates={templates} draft={draft} onSelect={onSelect} />
        <div className="template-actions">{actions}</div>
        <details className="template-menu" ref={menu} onKeyDown={(event) => {
          if (event.key === 'Escape' && menu.current.open) {
            event.preventDefault();
            closeMenu();
          }
        }}>
          <summary className="button">{fr.templateMenu}<ChevronDown aria-hidden="true" /></summary>
          <div className="template-menu-actions">{actions}</div>
        </details>
      </div>
      {draft && (
        <div className="template-footer">
          {dirty && <span className="unsaved">{fr.unsaved}</span>}
          <div className="save-actions">
            <button className="button" type="button" disabled={!dirty} aria-label={fr.reset} onClick={() => onAction('reset')}>
              <RotateCcw aria-hidden="true" />{fr.resetShort}
            </button>
            <button className="button" type="button" disabled={!dirty} onClick={() => onAction('save')}>
              <Check />{fr.save}
            </button>
            <button className="button primary" type="button" onClick={() => onAction('apply')}>
              {fr.apply}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

export function HerbPicker({ slots, selected, onSelect, onClearAll }) {
  const onStand = new Set(slots);
  const options = herbs.map((herb) => ({
    id: herb.id,
    name: herb.name,
    badge: <span className="herb-code" style={herbStyle(herb)} aria-hidden="true">{herb.short}</span>,
    indicator: onStand.has(herb.id)
      ? <Check className="picker-check" size={14} strokeWidth={3} aria-hidden="true" /> : null,
    description: onStand.has(herb.id) ? fr.onStand : undefined,
  }));

  return (
    <section className="card picker" aria-label={fr.pickHerb}>
      <div className="picker-intro">
        <h2>{fr.pickHerb}</h2>
        <p className="secondary">{fr.editHelp}</p>
      </div>
      <div className="picker-buttons">
        {options.map(({ id, name, badge, indicator, description }) => (
          <button type="button" key={id} className="picker-button" aria-pressed={selected === id}
            aria-description={description} onClick={() => onSelect(id)}>
            {badge}<span>{name}</span>{indicator}
          </button>
        ))}
      </div>
      <div className="picker-toolbar" role="group" aria-label={fr.pickHerb}>
        <div className="picker-compact">
          <ChoiceSelect label={fr.pickHerb} options={[...options, { id: null, name: fr.clear }]}
            value={selected} placeholder={fr.chooseHerb} onSelect={onSelect} fitViewport />
        </div>
        <button className="button picker-clear" type="button" aria-pressed={selected === null}
          onClick={() => onSelect(null)}><Eraser aria-hidden="true" />{fr.clear}</button>
      </div>
      <div className="picker-bottom">
        <button className="button danger-outline picker-clear-all" type="button"
          onClick={onClearAll} disabled={slots.every((slot) => slot === null)}>
          <Trash2 aria-hidden="true" />{fr.clearAll}
        </button>
      </div>
    </section>
  );
}
