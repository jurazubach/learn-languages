import { LANGS, getLessons, playableCount } from '../content';
import { cardsWord, lessonsWord } from '../plural';
import { go } from '../router';
import type { Lang } from '../types';

export function Home() {
  return (
    <div className="screen">
      <main className="home">
        <h1>Drill</h1>
        <p className="muted">5 минут перед сном. Говори про себя, тапай, свайпай.</p>
        <div className="lang-grid">
          {(Object.keys(LANGS) as Lang[]).map((lang) => {
            const lessons = getLessons(lang);
            const cards = lessons.reduce((sum, l) => sum + playableCount(l), 0);
            return (
              <button key={lang} className="lang-tile" onClick={() => go(`/${lang}`)}>
                <span className="flag">{LANGS[lang].flag}</span>
                <span className="lang-title">{LANGS[lang].title}</span>
                <span className="muted">
                  {lessonsWord(lessons.length)} · {cardsWord(cards)}
                </span>
                <span className="muted small">{LANGS[lang].native}</span>
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
}
