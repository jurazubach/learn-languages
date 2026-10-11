// Формат урока. Полное описание полей и правил генерации —
// .claude/skills/lesson/references/cards.md. Валидатор — scripts/validate-lessons.mjs.

export type Lang = 'en' | 'sk';

export type CardType = 'translate' | 'chunk' | 'transform' | 'spot' | 'form' | 'choice';

export interface Example {
  target: string;
  native: string;
}

export interface Rule {
  id: string;
  title: string;
  summary: string[];
  examples?: Example[];
}

export interface Card {
  id: string;
  type: CardType;
  rule?: string;
  prompt: string;
  answer: string;
  task?: string;
  options?: string[];
  lemma?: string;
  vzor?: string;
  full?: string;
  alt?: string[];
  diff?: string[];
  note?: string;
  example?: string;
  translation?: string;
  tags?: string[];
  verified?: boolean;
}

export interface Lesson {
  id: string;
  lang: Lang;
  number: number;
  title: string;
  date?: string;
  source?: string;
  rules: Rule[];
  cards: Card[];
}

export interface SessionCard {
  key: string;
  lesson: Lesson;
  card: Card;
  rule?: Rule;
}
