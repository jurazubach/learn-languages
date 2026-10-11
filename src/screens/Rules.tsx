import { RuleBody } from '../components/RuleSheet';
import { getLesson } from '../content';
import { go } from '../router';
import type { Lang } from '../types';

export function Rules({ lang, lessonId }: { lang: Lang; lessonId: string }) {
  const lesson = getLesson(lang, lessonId);
  return (
    <div className="screen">
      <header className="topbar">
        <button className="icon-btn" onClick={() => go(`/${lang}`)} aria-label="Назад">
          ←
        </button>
        <span className="topbar-title">{lesson?.title ?? 'Урок не найден'}</span>
      </header>
      <main className="rules">
        {lesson?.rules.map((rule) => (
          <section key={rule.id} className="panel">
            <h2>{rule.title}</h2>
            <RuleBody rule={rule} />
          </section>
        ))}
        {lesson && (
          <button className="btn btn-primary btn-wide" onClick={() => go(`/${lang}/play?src=${lesson.id}`)}>
            Учить этот урок
          </button>
        )}
      </main>
    </div>
  );
}
