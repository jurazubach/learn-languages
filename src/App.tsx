import { isLang } from './content';
import { useRoute } from './router';
import { Home } from './screens/Home';
import { Language } from './screens/Language';
import { LessonPage } from './screens/LessonPage';
import { Session } from './screens/Session';

// #/                         — выбор языка
// #/en                       — режимы и список уроков
// #/en/play?src=mix&n=20     — сессия (src: mix | all | <id урока>, rule: <id правила>)
// #/en/lesson/lesson-01      — урок: шпаргалка и блоки по правилам
export function App() {
  const { parts, params, hash } = useRoute();
  const [lang, view, arg] = parts;

  if (!isLang(lang)) return <Home />;
  if (view === 'play') {
    const source = params.get('src') ?? 'mix';
    const limit = Number(params.get('n')) || 20;
    const rule = params.get('rule') ?? undefined;
    return <Session key={hash} lang={lang} source={source} limit={limit} rule={rule} />;
  }
  if ((view === 'lesson' || view === 'rules') && arg) return <LessonPage lang={lang} lessonId={arg} />;
  return <Language lang={lang} />;
}
