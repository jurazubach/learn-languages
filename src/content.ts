import type { Lang, Lesson } from './types';

// Все уроки вшиваются в бандл на этапе сборки: новый lesson.json
// появляется в приложении после коммита и деплоя.
const modules = import.meta.glob<Lesson>('/content/*/lessons/*/lesson.json', {
  eager: true,
  import: 'default',
});

export const LANGS: Record<Lang, { title: string; native: string; flag: string }> = {
  en: { title: 'English', native: 'подсказки на русском', flag: '🇬🇧' },
  sk: { title: 'Slovenčina', native: 'підказки українською', flag: '🇸🇰' },
};

const lessonsByLang: Record<Lang, Lesson[]> = { en: [], sk: [] };
for (const lesson of Object.values(modules)) lessonsByLang[lesson.lang]?.push(lesson);
for (const list of Object.values(lessonsByLang)) list.sort((a, b) => b.number - a.number);

export function isLang(value: string | undefined): value is Lang {
  return value === 'en' || value === 'sk';
}

export function getLessons(lang: Lang): Lesson[] {
  return lessonsByLang[lang];
}

export function getLesson(lang: Lang, id: string): Lesson | undefined {
  return lessonsByLang[lang].find((l) => l.id === id);
}

export function playableCount(lesson: Lesson): number {
  return lesson.cards.filter((c) => c.verified !== false).length;
}
