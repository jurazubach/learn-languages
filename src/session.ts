import { getLesson, getLessons } from './content';
import type { Lang, Lesson, SessionCard } from './types';

export type Source = 'mix' | 'all' | string;

export function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function toSessionCards(lesson: Lesson): SessionCard[] {
  return lesson.cards
    .filter((card) => card.verified !== false)
    .map((card) => ({
      key: `${lesson.lang}/${lesson.id}/${card.id}`,
      lesson,
      card,
      rule: lesson.rules.find((r) => r.id === card.rule),
    }));
}

// Разводит соседние карточки одного правила, чтобы в миксе приходилось
// выбирать конструкцию, а не повторять ту, что была только что.
function spreadRules(cards: SessionCard[]): SessionCard[] {
  const result = [...cards];
  const ruleKey = (c: SessionCard) => `${c.lesson.id}/${c.card.rule ?? c.card.id}`;
  for (let i = 1; i < result.length; i++) {
    if (ruleKey(result[i]) !== ruleKey(result[i - 1])) continue;
    const j = result.findIndex((c, k) => k > i && ruleKey(c) !== ruleKey(result[i - 1]));
    if (j > 0) [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Урок: правила по порядку, внутри правила карточки перемешаны —
// сначала блоком закрепляем одно правило, потом следующее.
function lessonDeck(lesson: Lesson): SessionCard[] {
  const cards = toSessionCards(lesson);
  const order = lesson.rules.map((r) => r.id);
  const groups = new Map<string, SessionCard[]>();
  for (const c of cards) {
    const k = c.card.rule && order.includes(c.card.rule) ? c.card.rule : '';
    groups.set(k, [...(groups.get(k) ?? []), c]);
  }
  return [...order, ''].flatMap((k) => shuffle(groups.get(k) ?? []));
}

export function buildDeck(lang: Lang, source: Source, limit: number): SessionCard[] {
  if (source === 'all') {
    return spreadRules(shuffle(getLessons(lang).flatMap(toSessionCards)));
  }
  if (source === 'mix') {
    return spreadRules(shuffle(getLessons(lang).flatMap(toSessionCards)).slice(0, limit));
  }
  const lesson = getLesson(lang, source);
  return lesson ? lessonDeck(lesson) : [];
}
