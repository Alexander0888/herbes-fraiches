import { fr } from '../../../content/fr.js';
import { herbStyle, herbs } from '../data/herbs.js';
import { countSlots, SLOT_COUNT } from '../data/plans.js';

export function Legend({ slots }) {
  const { byHerb, assigned, free } = countSlots(slots);
  const sortedHerbs = [...herbs].sort((a, b) => byHerb[b.id] - byHerb[a.id]);

  return (
    <section className="card legend" aria-labelledby="legend-title">
      <h2 id="legend-title">{fr.legend}</h2>
      <p className="secondary legend-caption">{fr.legendCaption}</p>
      <div className="occupancy">
        <div className="occupancy-values">
          <div aria-label={fr.occupancy(assigned, SLOT_COUNT)}>
            <strong>{assigned}</strong><span className="secondary"> / {SLOT_COUNT}</span>
          </div>
          <span className="available">{fr.available(free)}</span>
        </div>
        <progress value={assigned} max={SLOT_COUNT} aria-label={fr.occupancy(assigned, SLOT_COUNT)} />
      </div>
      <ul className="legend-list">
        {sortedHerbs.map((herb) => (
          <li key={herb.id} className={byHerb[herb.id] === 0 ? 'legend-unused' : undefined}>
            <span className="herb-code" style={herbStyle(herb)} aria-hidden="true">{herb.short}</span>
            <span>{herb.name}</span>
            <strong>{byHerb[herb.id]}</strong>
          </li>
        ))}
      </ul>
    </section>
  );
}
