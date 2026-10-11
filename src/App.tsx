import { isLang } from './content';
import { useRoute } from './router';
import { Home } from './screens/Home';
import { Language } from './screens/Language';
import { Rules } from './screens/Rules';
import { Session } from './screens/Session';

// #/                         — выбор языка
// #/en                       — режимы и список уроков
// #/en/play?src=mix&n=20     — сессия (src: mix | all | <id урока>)
// #/en/rules/lesson-01       — шпаргалка урока
export function App() {
  const { parts, params, hash } = useRoute();
  const [lang, view, arg] = parts;

  if (!isLang(lang)) return <Home />;
  if (view === 'play') {
    const source = params.get('src') ?? 'mix';
    const limit = Number(params.get('n')) || 20;
    return <Session key={hash} lang={lang} source={source} limit={limit} />;
  }
  if (view === 'rules' && arg) return <Rules lang={lang} lessonId={arg} />;
  return <Language lang={lang} />;
}
