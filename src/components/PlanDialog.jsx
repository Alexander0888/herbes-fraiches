import { useEffect, useRef, useState } from 'react';
import { fr } from '../content/fr.js';

export function PlanDialog({ title, descriptions, initialName, action, danger, maxNameLength, onClose, onConfirm }) {
  const dialog = useRef(null);
  const input = useRef(null);
  const [name, setName] = useState(initialName ?? '');
  const asksName = initialName !== undefined;

  useEffect(() => {
    const element = dialog.current;
    element.showModal();
    if (input.current) {
      input.current.focus();
      input.current.select();
    }
    return () => element.close();
  }, []);

  function submit(event) {
    event.preventDefault();
    if (asksName && !name.trim()) {
      input.current.setCustomValidity(fr.requiredName);
      input.current.reportValidity();
      return;
    }
    if (action) onConfirm(name.trim());
  }

  return (
    <dialog ref={dialog} aria-labelledby="dialog-title"
      aria-describedby={descriptions.length ? 'dialog-description' : undefined}
      onCancel={(event) => { event.preventDefault(); onClose(); }}>
      <form onSubmit={submit}>
        <h2 id="dialog-title">{title}</h2>
        {!!descriptions.length && (
          <div id="dialog-description">
            {descriptions.map((description) => <p key={description} className="secondary">{description}</p>)}
          </div>
        )}
        {asksName && (
          <div className="dialog-field">
            <label htmlFor="model-name">{fr.name}</label>
            <input ref={input} type="text" id="model-name" required value={name} maxLength={maxNameLength}
              placeholder={fr.namePlaceholder}
              onChange={(event) => {
                event.target.setCustomValidity('');
                setName(event.target.value);
              }} />
          </div>
        )}
        <div className="dialog-actions">
          <button className="button" type="button" onClick={onClose}>{fr.cancel}</button>
          {action && <button className={danger ? 'button danger' : 'button primary'} type="submit">{action}</button>}
        </div>
      </form>
    </dialog>
  );
}
