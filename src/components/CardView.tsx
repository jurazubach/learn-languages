import type { Card, CardType } from '../types';
import { Highlight, WithBlank, hasBlank } from './text';

export const TYPE_LABEL: Record<CardType, string> = {
  translate: 'Скажи',
  chunk: 'Словосочетание',
  transform: 'Переделай',
  spot: 'Найди ошибку',
  form: 'Поставь форму',
  choice: 'Выбери',
};

interface Props {
  card: Card;
  revealed: boolean;
  picked?: string;
}

function Prompt({ card }: { card: Card }) {
  switch (card.type) {
    case 'transform':
      return (
        <>
          <p className="prompt prompt-target">{card.prompt}</p>
          {card.task && <p className="task">{card.task}</p>}
        </>
      );
    case 'spot':
      return <p className="prompt prompt-target prompt-wrong">{card.prompt}</p>;
    case 'form':
      return (
        <>
          <p className="prompt prompt-target">
            <WithBlank text={card.prompt} />
          </p>
          {card.lemma && <p className="task">{card.lemma}</p>}
        </>
      );
    case 'choice':
      return (
        <p className={hasBlank(card.prompt) ? 'prompt prompt-target' : 'prompt prompt-word'}>
          <WithBlank text={card.prompt} />
        </p>
      );
    default:
      return <p className="prompt">{card.prompt}</p>;
  }
}

function Answer({ card, picked }: { card: Card; picked?: string }) {
  if (card.type === 'choice') {
    const wrong = picked !== undefined && picked !== card.answer;
    return (
      <>
        {hasBlank(card.prompt) ? (
          <p className="answer">
            <WithBlank text={card.prompt} fill={card.answer} />
          </p>
        ) : (
          <p className="answer">{card.answer}</p>
        )}
        {wrong && <p className="verdict verdict-wrong">Не «{picked}»</p>}
      </>
    );
  }
  if (card.type === 'form') {
    return (
      <>
        <p className="answer">
          {card.full ? <Highlight text={card.full} marks={[card.answer]} /> : card.answer}
        </p>
        {card.vzor && <p className="vzor">{card.vzor}</p>}
      </>
    );
  }
  return (
    <>
      <p className="answer">
        <Highlight text={card.answer} marks={card.diff} />
      </p>
      {card.alt?.length ? <p className="alt">также: {card.alt.join(' · ')}</p> : null}
    </>
  );
}

export function CardView({ card, revealed, picked }: Props) {
  return (
    <div className="card-body">
      <Prompt card={card} />
      {revealed && (
        <div className="reveal">
          <Answer card={card} picked={picked} />
          {card.example && <p className="example">{card.example}</p>}
          {card.translation && <p className="translation">{card.translation}</p>}
          {card.note && <p className="note">{card.note}</p>}
        </div>
      )}
    </div>
  );
}
