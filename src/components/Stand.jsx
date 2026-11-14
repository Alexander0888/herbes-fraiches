import { ChevronDown } from 'lucide-react';
import { fr, locale } from '../content/fr.js';
import { herbById, herbStyle } from '../data/herbs.js';
import { COLUMNS, ROWS } from '../data/plans.js';

const columns = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.slice(0, COLUMNS).split('');
const rows = Array.from({ length: ROWS }, (_, index) => index + 1);
const dateFormat = new Intl.DateTimeFormat(locale, { dateStyle: 'long', timeStyle: 'short' });

export function Stand({ slots, name, appliedAt, onPlace }) {
  return (
    <section className="card stand-card" aria-label={fr.stand}>
      <header className="stand-heading">
        <div>
          {appliedAt && <p className="stand-kicker">{fr.current}</p>}
          <h2>{name}</h2>
          {appliedAt && (
            <time dateTime={appliedAt}>{fr.appliedAt(dateFormat.format(new Date(appliedAt)))}</time>
          )}
        </div>
      </header>
      <figure className="stand-figure">
        <div className="metal-panel">
          <div className="stand-grid" role="group" aria-label={fr.dimensions(COLUMNS, ROWS)}>
            {rows.map((row) => (
              <div className="stand-row" key={row}>
                {columns.map((column, columnIndex) => {
                  const index = (row - 1) * COLUMNS + columnIndex;
                  const herb = herbById[slots[index]];
                  const title = herb?.name ?? fr.emptySlot;
                  const label = fr.position(column, row, title);
                  const face = <span className="slot-face" aria-hidden="true">{herb?.short}</span>;
                  const style = herb && herbStyle(herb);
                  if (onPlace) {
                    return (
                      <button className={herb ? 'slot' : 'slot slot-empty'} key={column} type="button" aria-label={label}
                        title={title} style={style} onClick={() => onPlace(index)}>
                        {face}
                      </button>
                    );
                  }
                  return (
                    <div className={herb ? 'slot' : 'slot slot-empty'} key={column} role="img" aria-label={label} title={title} style={style}>
                      {face}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          <div className="engraving">{fr.brand}</div>
        </div>
        <div className="stand-front"><ChevronDown size={15} aria-hidden="true" />{fr.front}</div>
      </figure>
    </section>
  );
}
