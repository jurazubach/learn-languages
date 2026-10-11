import { useState } from 'react';
import { LANGS, getLessons, playableCount } from '../content';
import { cardsWord, rulesWord } from '../plural';
import { go } from '../router';
import type { Lang } from '../types';

const LIMITS = [10, 20, 40];

export function Language({ lang }: { lang: Lang }) {
  const lessons = getLessons(lang);
  const total = lessons.reduce((sum, l) => sum + playableCount(l), 0);
  const [limit, setLimit] = useState(20);

  return (
    <div className="screen">
      <header className="topbar">
        <button className="icon-btn" onClick={() => go('/')} aria-label="Назад">
          ←
        </button>
        <span className="topbar-title">
          {LANGS[lang].flag} {LANGS[lang].title}
        </span>
      </header>

      <main className="language">
        <section className="panel">
          <h2>Микс из всех уроков</h2>
          <div className="chips">
            {LIMITS.map((n) => (
              <button
                key={n}
                className={`chip-btn ${limit === n ? 'chip-on' : ''}`}
                onClick={() => setLimit(n)}
              >
                {n}
              </button>
            ))}
          </div>
          <button
            className="btn btn-primary btn-wide"
            disabled={!total}
            onClick={() => go(`/${lang}/play?src=mix&n=${limit}`)}
          >
            Случайные {Math.min(limit, total)}
          </button>
          <button className="btn btn-wide" disabled={!total} onClick={() => go(`/${lang}/play?src=all`)}>
            Всё вперемешку · {total}
          </button>
        </section>

        <h2 className="section-title">Уроки</h2>
        {lessons.length === 0 && <p className="empty">Уроков пока нет — скинь скриншоты и вызови /lesson.</p>}
        <ul className="lessons">
          {lessons.map((lesson) => (
            <li key={lesson.id}>
              <button className="lesson-row" onClick={() => go(`/${lang}/lesson/${lesson.id}`)}>
                <span className="lesson-title">{lesson.title}</span>
                <span className="muted small">
                  {[lesson.date, rulesWord(lesson.rules.length), cardsWord(playableCount(lesson))]
                    .filter(Boolean)
                    .join(' · ')}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
