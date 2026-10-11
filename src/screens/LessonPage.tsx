import { RuleBody } from '../components/RuleSheet';
import { getLesson } from '../content';
import { cardsWord } from '../plural';
import { go } from '../router';
import type { Lang } from '../types';

// Урок: можно пройти целиком или по одному блоку-правилу (5–10 минут).
export function LessonPage({ lang, lessonId }: { lang: Lang; lessonId: string }) {
  const lesson = getLesson(lang, lessonId);
  const cards = lesson?.cards.filter((c) => c.verified !== false) ?? [];
  const count = (ruleId: string) => cards.filter((c) => c.rule === ruleId).length;

  return (
    <div className="screen">
      <header className="topbar">
        <button className="icon-btn" onClick={() => go(`/${lang}`)} aria-label="Назад">
          ←
        </button>
        <span className="topbar-title">{lesson?.title ?? 'Урок не найден'}</span>
      </header>
      {lesson && (
        <main className="rules">
          <button className="btn btn-primary btn-wide" onClick={() => go(`/${lang}/play?src=${lesson.id}`)}>
            Весь урок · {cardsWord(cards.length)}
          </button>
          {lesson.rules.map((rule) => (
            <section key={rule.id} className="panel">
              <h2>{rule.title}</h2>
              <RuleBody rule={rule} />
              {count(rule.id) > 0 && (
                <button
                  className="btn btn-wide"
                  onClick={() => go(`/${lang}/play?src=${lesson.id}&rule=${rule.id}`)}
                >
                  Учить блок · {cardsWord(count(rule.id))}
                </button>
              )}
            </section>
          ))}
        </main>
      )}
    </div>
  );
}
