import type { Rule } from '../types';

export function RuleBody({ rule }: { rule: Rule }) {
  return (
    <>
      <ul className="rule-summary">
        {rule.summary.map((line, i) => (
          <li key={i}>{line}</li>
        ))}
      </ul>
      {rule.examples?.length ? (
        <ul className="rule-examples">
          {rule.examples.map((ex, i) => (
            <li key={i}>
              <span className="target">{ex.target}</span>
              <span className="native">{ex.native}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </>
  );
}

export function RuleSheet({ rule, onClose }: { rule: Rule; onClose: () => void }) {
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" />
        <h2>{rule.title}</h2>
        <RuleBody rule={rule} />
        <button className="btn btn-wide" onClick={onClose}>
          Понятно
        </button>
      </div>
    </div>
  );
}
