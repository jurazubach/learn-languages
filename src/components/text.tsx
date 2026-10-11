import type { ReactNode } from 'react';

const BLANK = /_{3,}/;

function escape(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Подсвечивает фрагменты из diff — места, где язык расходится с подсказкой.
export function Highlight({ text, marks }: { text: string; marks?: string[] }) {
  const list = (marks ?? []).filter(Boolean).sort((a, b) => b.length - a.length);
  if (!list.length) return <>{text}</>;
  const parts = text.split(new RegExp(`(${list.map(escape).join('|')})`, 'g'));
  return (
    <>
      {parts.map((part, i) =>
        list.includes(part) ? (
          <mark key={i} className="diff">
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </>
  );
}

// Рисует пропуск ___ как пустую ячейку или подставляет в него ответ.
export function WithBlank({ text, fill }: { text: string; fill?: string }) {
  const [before, ...rest] = text.split(BLANK);
  if (!rest.length) return <>{text}</>;
  const filler: ReactNode = fill ? (
    <span className="fill">{fill}</span>
  ) : (
    <span className="blank" />
  );
  return (
    <>
      {before}
      {filler}
      {rest.join('___')}
    </>
  );
}

export function hasBlank(text: string) {
  return BLANK.test(text);
}

// Ответ целиком: для form — full, для фраз с пропуском — фраза с подставленным ответом.
export function fullAnswer(card: { prompt: string; answer: string; full?: string }) {
  if (card.full) return card.full;
  return hasBlank(card.prompt) ? card.prompt.replace(BLANK, card.answer) : card.answer;
}
